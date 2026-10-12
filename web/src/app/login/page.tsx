"use client";
import { useState } from "react";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Login() {
  const [register, setRegister] = useState(false);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const field = "h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base";
  return (
    <>
      <Header />
      <main className="container-page flex min-h-[70dvh] items-center justify-center py-10">
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="w-full max-w-md space-y-4 rounded-3xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
          <h1 className="text-2xl font-extrabold">{register ? "Create your account" : "Welcome back"}</h1>
          <p className="text-sm text-ink/70">{register ? "Join to buy, sell and bid on verified phones." : "Sign in to manage your listings, messages and purchases."}</p>
          {register && <div><label htmlFor="n" className="mb-1.5 block text-sm font-semibold text-navy">Full name</label><input id="n" required autoComplete="name" className={field} /></div>}
          <div><label htmlFor="e" className="mb-1.5 block text-sm font-semibold text-navy">Email</label><input id="e" type="email" required autoComplete="email" className={field} /></div>
          <div><label htmlFor="p" className="mb-1.5 block text-sm font-semibold text-navy">Password</label>
            <div className="relative"><input id="p" type={show ? "text" : "password"} required minLength={8} autoComplete={register ? "new-password" : "current-password"} className={`${field} pr-12`} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center text-navy/60">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            {register && <p className="mt-1 text-xs text-ink/60">At least 8 characters.</p>}</div>
          <button className="btn-primary w-full">{register ? <><UserPlus className="h-4 w-4" />Create account</> : <><LogIn className="h-4 w-4" />Sign in</>}</button>
          {done && <p role="status" className="rounded-xl bg-teal-soft p-3 text-sm text-teal-deep">Form works. Not yet connected to the Auctiva API.</p>}
          <button type="button" onClick={() => { setRegister(!register); setDone(false); }} className="w-full text-center text-sm font-semibold text-teal-deep">{register ? "Have an account? Sign in" : "New here? Create an account"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
