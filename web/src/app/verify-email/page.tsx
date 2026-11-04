"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { verifyEmail } from "@/lib/api";

type VerificationState = { message: string; success: boolean } | null;

export default function VerifyEmailPage() {
  const [result, setResult] = useState<VerificationState>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setResult({ message: "This verification link is missing its token.", success: false });
      return;
    }
    verifyEmail(token)
      .then((response) => setResult({ message: response.message, success: true }))
      .catch((error: Error) => setResult({ message: error.message, success: false }));
  }, []);

  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <section className="w-full max-w-md space-y-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold">Email verification</h1>
          {!result ? <p role="status">Verifying your email address…</p> : (
            <>
              <p role={result.success ? "status" : "alert"} className={result.success ? "text-ink/80" : "text-red-700"}>
                {result.message}
              </p>
              {result.success && <Link href="/login" className="btn-primary w-full">Sign in</Link>}
              {!result.success && <p className="text-sm text-ink/70">Ask for a new verification email if this link has expired.</p>}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
