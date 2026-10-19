"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { login, registerUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// UX hint only: the server still enforces its own rules.
const strength = (p: string) => { const n = +(p.length >= 8) + +(p.length >= 12) + +(/[a-z]/.test(p) && /[A-Z]/.test(p)) + +/\d/.test(p) + +/[^A-Za-z0-9]/.test(p); return n <= 2 ? 0 : n === 3 ? 1 : 2; };
const LEVEL = [{ t: "Weak", c: "bg-red-500 w-1/3" }, { t: "Medium", c: "bg-amber-500 w-2/3" }, { t: "Strong", c: "bg-teal-deep w-full" }];
type K = "name" | "email" | "password" | "confirm";

export default function Login() {
  const [register, setRegister] = useState(false);
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const e: Record<string, string> = {};
  if (register && !v.name.trim()) e.name = "Enter your full name.";
  if (!EMAIL.test(v.email)) e.email = "Enter a valid email address.";
  if (register) {
    if (v.password.length < 8) e.password = "Use at least 8 characters.";
    else if (strength(v.password) === 0) e.password = "Too weak. Add numbers, symbols or mixed case.";
    if (v.confirm !== v.password) e.confirm = "Passwords don't match.";
    if (!agree) e.agree = "Accept the Terms and Privacy Policy to continue.";
  } else if (!v.password) e.password = "Enter your password.";
  const bad = (k: string) => (touched[k] || submitted) && e[k];

  async function submit(ev: React.FormEvent) {
    ev.preventDefault(); setSubmitted(true); setErr("");
    const first = Object.keys(e)[0];
    if (first) { document.getElementById(first)?.focus(); return; }
    setBusy(true);
    try { signIn(register ? await registerUser(v.email.trim(), v.password, v.name.trim()) : await login(v.email.trim(), v.password)); router.push("/phones"); }
    catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }
  const field = (k: K, label: string, auto: string, type = k === "email" ? "email" : "text") => {
    const pw = k === "password" || k === "confirm";
    return (
      <div>
        <label htmlFor={k} className="mb-1.5 block text-sm font-semibold text-navy">{label}</label>
        <div className="relative">
          <input id={k} name={k} type={pw && !show ? "password" : type} value={v[k]} autoComplete={auto} aria-invalid={!!bad(k)} aria-describedby={bad(k) ? `${k}-e` : undefined}
            onChange={(x) => setV({ ...v, [k]: x.target.value })} onBlur={() => setTouched({ ...touched, [k]: true })}
            className={`h-12 w-full rounded-xl border bg-white px-4 text-base ${pw ? "pr-12" : ""} ${bad(k) ? "border-red-500" : "border-navy/15"}`} />
          {k === "password" && <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide passwords" : "Show passwords"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-navy/60">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>}
        </div>
        {bad(k) && <p id={`${k}-e`} className="mt-1 text-xs font-medium text-red-700">{e[k]}</p>}
      </div>
    );
  };
  const s = strength(v.password);
  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold">{register ? "Create your account" : "Welcome back"}</h1>
          {register && field("name", "Full name", "name")}
          {field("email", "Email", "email")}
          {field("password", "Password", register ? "new-password" : "current-password")}
          {register && v.password && (
            <div aria-live="polite"><div className="h-1.5 rounded-full bg-navy/10"><div className={`h-full rounded-full transition-all ${LEVEL[s].c}`} /></div><p className="mt-1 text-xs text-ink/70">Password strength: <strong>{LEVEL[s].t}</strong></p></div>
          )}
          {register && field("confirm", "Confirm password", "new-password")}
          {register && (
            <div>
              <label className="flex items-start gap-3 text-sm text-ink/80"><input id="agree" type="checkbox" checked={agree} onChange={(x) => setAgree(x.target.checked)} onBlur={() => setTouched({ ...touched, agree: true })} aria-invalid={!!bad("agree")} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0E7C86]" />
                <span>I agree to the <Link href="/terms" target="_blank" className="font-semibold text-teal-deep underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" className="font-semibold text-teal-deep underline">Privacy Policy</Link>.</span></label>
              {bad("agree") && <p className="mt-1 text-xs font-medium text-red-700">{e.agree}</p>}
            </div>
          )}
          {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}{register && /already exists/i.test(err) && <> <button type="button" onClick={() => { setRegister(false); setErr(""); }} className="underline">Sign in instead</button></>}</p>}
          <button disabled={busy} className="btn-primary w-full disabled:opacity-60">{busy ? <><Loader2 className="h-4 w-4 animate-spin" />Please wait…</> : register ? <><UserPlus className="h-4 w-4" />Create account</> : <><LogIn className="h-4 w-4" />Sign in</>}</button>
          <button type="button" onClick={() => { setRegister(!register); setErr(""); setSubmitted(false); setTouched({}); }} className="w-full text-center text-sm font-semibold text-teal-deep">{register ? "Have an account? Sign in" : "New here? Create an account"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
