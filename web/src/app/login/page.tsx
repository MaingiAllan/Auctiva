"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { login, registerUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [register, setRegister] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();
  const field = "h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErr(""); setBusy(true);
    const f = new FormData(e.currentTarget);
    const [email, password, name] = ["email", "password", "name"].map((k) => String(f.get(k) ?? ""));
    try { signIn(register ? await registerUser(email, password, name) : await login(email, password)); router.push("/phones"); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }
  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold">{register ? "Create your account" : "Welcome back"}</h1>
          {register && <div><label htmlFor="n" className="mb-1.5 block text-sm font-semibold text-navy">Full name</label><input id="n" name="name" required autoComplete="name" className={field} /></div>}
          <div><label htmlFor="e" className="mb-1.5 block text-sm font-semibold text-navy">Email</label><input id="e" name="email" type="email" required autoComplete="email" className={field} /></div>
          <div><label htmlFor="p" className="mb-1.5 block text-sm font-semibold text-navy">Password</label>
            <div className="relative"><input id="p" name="password" type={show ? "text" : "password"} required minLength={8} autoComplete={register ? "new-password" : "current-password"} className={`${field} pr-12`} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-navy/60">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            {register && <p className="mt-1 text-xs text-ink/60">At least 8 characters.</p>}</div>
          {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
          <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? "Please wait…" : register ? <><UserPlus className="h-4 w-4" />Create account</> : <><LogIn className="h-4 w-4" />Sign in</>}</button>
          <button type="button" onClick={() => { setRegister(!register); setErr(""); }} className="w-full text-center text-sm font-semibold text-teal-deep">{register ? "Have an account? Sign in" : "New here? Create an account"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
