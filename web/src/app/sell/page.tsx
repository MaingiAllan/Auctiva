"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import { ApiError, GRADE_LABEL, createListing, getDeviceModels, type DeviceModel } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const f = "h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base";
const L = ({ id, t }: { id: string; t: string }) => <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">{t}</label>;

export default function Sell() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { getDeviceModels().then(setModels).catch(() => setErr("Couldn't load phone models. Refresh to retry.")); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!user) return;
    setErr(""); setBusy(true);
    const v = (k: string) => String(new FormData(e.currentTarget).get(k) ?? "").trim();
    try {
      const l = await createListing(user.token, { deviceModelId: v("model"), title: v("title"), description: v("description") || undefined, conditionGrade: v("grade"), price: Number(v("price")), currency: "KES", location: v("location") || undefined, imei1: v("imei") || undefined });
      router.push(`/phones/${l.id}`);
    } catch (x) {
      if (x instanceof ApiError && (x.status === 401 || x.status === 403)) signOut();
      setErr((x as Error).message);
    } finally { setBusy(false); }
  }
  if (ready && !user) return (<><Header /><main className="container-page section text-center"><h1 className="text-2xl font-extrabold">Sign in to sell</h1><p className="mt-2 text-ink/70">You need an account to publish a listing.</p><Link href="/login" className="btn-primary mt-6">Sign in</Link></main><Footer /></>);

  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-8">
          <div><h1 className="text-2xl font-extrabold sm:text-3xl">Sell a phone</h1><p className="mt-1 text-ink/70">Honest details sell faster and avoid disputes.</p></div>
          <section className="space-y-3"><h2 className="text-lg font-bold">1. Photos</h2><ImageUploader /><p className="text-xs text-ink/60">Photo storage isn&apos;t live yet, so photos are not saved with the listing.</p></section>
          <section className="space-y-4"><h2 className="text-lg font-bold">2. Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><L id="model" t="Phone model" /><select id="model" name="model" required className={f} defaultValue=""><option value="" disabled>Select a model</option>{models.map((m) => <option key={m.id} value={m.id}>{m.brandName} {m.name}{m.variant ? ` ${m.variant}` : ""}</option>)}</select></div>
              <div className="sm:col-span-2"><L id="title" t="Title" /><input id="title" name="title" required className={f} placeholder="e.g. Clean Galaxy S24, barely used" /></div>
              <div><L id="grade" t="Condition grade" /><select id="grade" name="grade" className={f} defaultValue="A">{Object.entries(GRADE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
              <div><L id="price" t="Price (KES)" /><input id="price" name="price" type="number" min={1} required inputMode="numeric" className={f} /></div>
              <div><L id="imei" t="IMEI (dial *#06#)" /><input id="imei" name="imei" inputMode="numeric" pattern="\d{15}" maxLength={15} title="15 digits" className={f} /></div>
              <div><L id="location" t="Location" /><input id="location" name="location" className={f} placeholder="e.g. Nairobi" /></div>
              <div className="sm:col-span-2"><L id="description" t="Description" /><textarea id="description" name="description" rows={5} className={`${f} h-auto py-3`} placeholder="Mention any defects, what is included, and whether the price is negotiable." /></div>
            </div>
          </section>
          {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
          <button disabled={busy} className="btn-primary w-full disabled:opacity-60 sm:w-auto">{busy ? "Publishing…" : "Publish listing"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
