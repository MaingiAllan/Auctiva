"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TurnstileChallenge from "@/components/TurnstileChallenge";
import { login, registerUser } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const strength = (p: string) => {
  const score = +(p.length >= 8) + +(p.length >= 12)
    + +(/[a-z]/.test(p) && /[A-Z]/.test(p)) + +/\d/.test(p) + +/[^A-Za-z0-9]/.test(p);
  return score <= 2 ? 0 : score === 3 ? 1 : 2;
};
const LEVEL = [
  { text: "Weak", color: "bg-red-500 w-1/3" },
  { text: "Medium", color: "bg-amber-500 w-2/3" },
  { text: "Strong", color: "bg-teal-deep w-full" },
];
type FieldName = "name" | "email" | "password" | "confirm";

const GOOGLE_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";
const APPLE_ENABLED = process.env.NEXT_PUBLIC_APPLE_OAUTH_ENABLED === "true";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";
const HAS_TURNSTILE = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function Login() {
  const [register, setRegister] = useState(false);
  const [v, setV] = useState({ name: "", email: "", password: "", confirm: "" });
  const [agree, setAgree] = useState(false);
  const [socialAgree, setSocialAgree] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [err, setErr] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const oauthError = new URLSearchParams(window.location.search).get("oauthError");
    if (oauthError) {
      const messages: Record<string, string> = {
        email_not_verified: "The identity provider did not confirm this email address.",
        terms_required: "Accept the Terms and Privacy Policy before continuing with social sign-in.",
      };
      setErr(messages[oauthError] ?? "Social sign-in failed. Please try again or use email.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const errors: Record<string, string> = {};
  if (register && !v.name.trim()) errors.name = "Enter your full name.";
  if (!EMAIL.test(v.email)) errors.email = "Enter a valid email address.";
  if (register) {
    if (v.password.length < 8) errors.password = "Use at least 8 characters.";
    else if (strength(v.password) === 0) errors.password = "Too weak. Add numbers or mixed case.";
    if (v.confirm !== v.password) errors.confirm = "Passwords don't match.";
    if (!agree) errors.agree = "Accept the Terms and Privacy Policy to continue.";
  } else if (!v.password) {
    errors.password = "Enter your password.";
  }
  const bad = (key: string) => (touched[key] || submitted) && errors[key];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setErr("");
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }
    if (register && !captchaToken) {
      setErr(HAS_TURNSTILE ? "Complete the anti-bot check before creating an account."
        : "Signup protection is not configured. Please try again later.");
      return;
    }
    setBusy(true);
    try {
      if (register) {
        await registerUser(v.email.trim(), v.password, v.name.trim(), captchaToken);
        setRegistered(true);
      } else {
        signIn(await login(v.email.trim(), v.password));
        router.push("/phones");
      }
    } catch (error) {
      setErr((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const field = (key: FieldName, label: string, autoComplete: string, type = key === "email" ? "email" : "text") => {
    const passwordField = key === "password" || key === "confirm";
    return (
      <div>
        <label htmlFor={key} className="mb-1.5 block text-sm font-semibold text-navy">{label}</label>
        <div className="relative">
          <input
            id={key}
            name={key}
            type={passwordField && !show ? "password" : type}
            value={v[key]}
            autoComplete={autoComplete}
            aria-invalid={!!bad(key)}
            aria-describedby={bad(key) ? `${key}-error` : undefined}
            onChange={(event) => setV({ ...v, [key]: event.target.value })}
            onBlur={() => setTouched({ ...touched, [key]: true })}
            className={`h-12 w-full rounded-xl border bg-white px-4 text-base ${passwordField ? "pr-12" : ""} ${bad(key) ? "border-red-500" : "border-navy/15"}`}
          />
          {key === "password" && (
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? "Hide passwords" : "Show passwords"}
              className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-navy/60"
            >
              {show ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          )}
        </div>
        {bad(key) && <p id={`${key}-error`} className="mt-1 text-xs font-medium text-red-700">{errors[key]}</p>}
      </div>
    );
  };
  const score = strength(v.password);

  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        {registered ? (
          <section role="status" className="w-full max-w-md space-y-3 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-extrabold">Check your inbox</h1>
            <p className="text-ink/80">We sent a verification link to <strong>{v.email.trim()}</strong>. Verify your address before signing in.</p>
            <p className="text-sm text-ink/60">The link expires in 24 hours. Check your spam folder if it does not arrive.</p>
            <Link href="/login" className="btn-primary mt-2 w-full">Return to sign in</Link>
          </section>
        ) : (
          <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
            <h1 className="text-2xl font-extrabold">{register ? "Create your account" : "Welcome back"}</h1>
            {(GOOGLE_ENABLED || APPLE_ENABLED) && (
              <>
                <label className="flex items-start gap-3 text-sm text-ink/80">
                  <input
                    type="checkbox"
                    checked={socialAgree}
                    onChange={(event) => setSocialAgree(event.target.checked)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-teal-deep"
                  />
                  <span>If this is a new account, I agree to the <Link href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-teal-deep underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-teal-deep underline">Privacy Policy</Link>.</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {GOOGLE_ENABLED && <button type="button" disabled={!socialAgree} className="btn-ghost w-full disabled:opacity-50" onClick={() => window.location.assign(`${BACKEND_URL}/oauth2/authorization/google?agreedToTerms=true`)}>Continue with Google</button>}
                  {APPLE_ENABLED && <button type="button" disabled={!socialAgree} className="btn-ghost w-full disabled:opacity-50" onClick={() => window.location.assign(`${BACKEND_URL}/oauth2/authorization/apple?agreedToTerms=true`)}>Continue with Apple</button>}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink/60">
                  <span className="h-px flex-1 bg-navy/15" />
                  <span>or continue with email</span>
                  <span className="h-px flex-1 bg-navy/15" />
                </div>
              </>
            )}
            {register && field("name", "Full name", "name")}
            {field("email", "Email", "email")}
            {field("password", "Password", register ? "new-password" : "current-password")}
            {register && v.password && (
              <div aria-live="polite">
                <div
                  className="h-1.5 rounded-full bg-navy/10"
                  role="meter"
                  aria-label="Password strength"
                  aria-valuemin={0}
                  aria-valuemax={2}
                  aria-valuenow={score}
                >
                  <div className={`h-full rounded-full transition-all ${LEVEL[score].color}`} />
                </div>
                <p className="mt-1 text-xs text-ink/70">Password strength: <strong>{LEVEL[score].text}</strong></p>
              </div>
            )}
            {register && field("confirm", "Confirm password", "new-password")}
            {register && (
              <>
                <div>
                  <label className="flex items-start gap-3 text-sm text-ink/80">
                    <input
                      id="agree"
                      type="checkbox"
                      checked={agree}
                      onChange={(event) => setAgree(event.target.checked)}
                      onBlur={() => setTouched({ ...touched, agree: true })}
                      aria-invalid={!!bad("agree")}
                      aria-describedby={bad("agree") ? "agree-error" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-teal-deep"
                    />
                    <span>I agree to the <Link href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-teal-deep underline">Terms of Service</Link> and <Link href="/privacy" target="_blank" rel="noreferrer" className="font-semibold text-teal-deep underline">Privacy Policy</Link>.</span>
                  </label>
                  {bad("agree") && <p id="agree-error" className="mt-1 text-xs font-medium text-red-700">{errors.agree}</p>}
                </div>
                <TurnstileChallenge onToken={setCaptchaToken} />
              </>
            )}
            {err && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
                {err}
                {register && /already exists/i.test(err) && <> <button type="button" onClick={() => { setRegister(false); setErr(""); }} className="underline">Sign in instead</button></>}
              </p>
            )}
            <button disabled={busy || (register && (!HAS_TURNSTILE || !captchaToken))} className="btn-primary w-full disabled:opacity-60">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />Please wait…</> : register ? <><UserPlus className="h-4 w-4" aria-hidden="true" />Create account</> : <><LogIn className="h-4 w-4" aria-hidden="true" />Sign in</>}
            </button>
            <button
              type="button"
              onClick={() => { setRegister(!register); setErr(""); setSubmitted(false); setTouched({}); setCaptchaToken(""); }}
              className="w-full text-center text-sm font-semibold text-teal-deep"
            >
              {register ? "Have an account? Sign in" : "New here? Create an account"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
