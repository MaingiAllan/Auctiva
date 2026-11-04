"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/lib/auth";

export default function OAuthCallbackPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    try {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const token = fragment.get("access_token");
      const email = fragment.get("email");
      const role = fragment.get("role");
      if (!token || !email || !role) throw new Error("The identity provider returned an incomplete sign-in.");
      signIn({ token, email, role });
      router.replace("/phones");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Social sign-in failed.";
      window.location.replace(`/login?oauthError=${encodeURIComponent(message)}`);
    }
  }, [router, signIn]);

  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <p role="status" className="text-ink/80">Completing sign-in…</p>
      </main>
      <Footer />
    </>
  );
}
