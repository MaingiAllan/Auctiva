"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, createOrder, getOrder, getPendingOrder, type ListingStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function CheckoutButton({ listingId, status }: { listingId: string; status: ListingStatus }) {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [pendingOrderChecked, setPendingOrderChecked] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "RESERVED" || !ready || !user) {
      setPendingOrderChecked(true);
      return;
    }
    let active = true;
    getPendingOrder(user.token, listingId)
      .then((order) => {
        if (active && order) {
          setOrderId(order.id);
          setMessage(order.status === "PAYMENT_REVIEW"
            ? "Your payment is under review. Don’t pay again."
            : "Your payment is pending. You can check its status here.");
        }
      })
      .catch((e) => {
        if (active) setError((e as Error).message);
      })
      .finally(() => {
        if (active) setPendingOrderChecked(true);
      });
    return () => { active = false; };
  }, [listingId, ready, status, user]);

  async function checkOrder(token: string, id: string) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const current = await getOrder(token, id);
      if (current.status === "PAID") {
        setMessage("Payment confirmed. This item is now marked sold.");
        router.refresh();
        return;
      }
      if (current.status === "CANCELLED") {
        setOrderId(null);
        setIdempotencyKey(null);
        setMessage("");
        setError("The payment was not completed. The item is available again; you can try checkout again.");
        router.refresh();
        return;
      }
      if (current.status === "PAYMENT_REVIEW") {
        setMessage("Payment is on hold for manual review. Don’t pay again; Auctiva needs to reconcile it.");
        return;
      }
    }
    setMessage("Payment is still pending. Don’t pay again; select Check payment status in a moment.");
  }

  async function checkout(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      if (orderId) {
        setMessage("Checking the payment status…");
        await checkOrder(user.token, orderId);
        return;
      }
      const key = idempotencyKey ?? crypto.randomUUID();
      setIdempotencyKey(key);
      setMessage("Starting M-Pesa checkout…");
      const { order } = await createOrder(user.token, listingId, phone.trim(), key);
      setOrderId(order.id);
      setMessage("Approve the M-Pesa prompt on your phone. We’re waiting for confirmation…");
      await checkOrder(user.token, order.id);
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) signOut();
      if (e instanceof ApiError && (e.status < 500 || e.status === 502)) {
        setOrderId(null);
        setIdempotencyKey(null);
        if (e.status === 502) router.refresh();
      }
      setMessage("");
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "SOLD") {
    return <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Sold — this item is no longer available.</p>;
  }
  if (status === "RESERVED") {
    if (orderId) {
      return <div className="mt-5 space-y-3 rounded-xl bg-amber-50 p-4">
        <p role="status" className="text-sm font-semibold text-amber-900">{message}</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!user || !orderId) return;
            setBusy(true);
            setError("");
            try { await checkOrder(user.token, orderId); }
            catch (e) {
              if (e instanceof ApiError && (e.status === 401 || e.status === 403)) signOut();
              setError((e as Error).message);
            } finally { setBusy(false); }
          }}
          className="btn-primary disabled:opacity-60"
        >{busy ? "Checking…" : "Check payment status"}</button>
      </div>;
    }
    if (!pendingOrderChecked) {
      return <p className="mt-5 text-sm text-ink/60">Checking checkout status…</p>;
    }
    return <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">Pending payment — another buyer is checking out.</p>;
  }
  if (status !== "ACTIVE") {
    return <p className="mt-5 rounded-xl bg-navy-soft p-3 text-sm text-ink/75">This listing is not currently available.</p>;
  }
  if (!ready) return <p className="mt-5 text-sm text-ink/60">Loading checkout…</p>;
  if (!user) {
    return <div className="mt-5 rounded-xl bg-navy-soft p-4 text-sm">
      <p>Sign in to pay with M-Pesa. Buyer protection and seller messaging are not available yet.</p>
      <Link href="/login" className="btn-primary mt-3 inline-flex">Sign in to buy</Link>
    </div>;
  }

  return (
    <form onSubmit={checkout} className="mt-5 space-y-3 rounded-xl bg-navy-soft p-4">
      <label htmlFor="checkout-phone" className="block text-sm font-semibold text-navy">M-Pesa phone number</label>
      <input
        id="checkout-phone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        required={!orderId}
        disabled={busy || Boolean(orderId)}
        maxLength={16}
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="0712 345 678"
        className="h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base disabled:opacity-60"
      />
      {message && <p role="status" className="text-sm text-ink/75">{message}</p>}
      {error && <p role="alert" className="text-sm font-medium text-red-700">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60 sm:w-auto">
        {busy ? "Checking M-Pesa…" : orderId ? "Check payment status" : "Pay with M-Pesa"}
      </button>
      <p className="text-xs text-ink/60">The item is reserved while payment is pending. Auctiva will mark it sold after Daraja confirms payment.</p>
    </form>
  );
}
