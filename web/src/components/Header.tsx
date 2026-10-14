"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links: [string, string][] = [["Phones", "/phones"], ["Sell", "/sell"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-white/90 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="container-page flex h-16 items-center gap-3 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Auctiva home">
          <Image src="/logo-icon.png" alt="" width={40} height={40} priority className="h-9 w-9 sm:h-10 sm:w-10" />
          <span className="font-display text-lg font-extrabold tracking-tight text-navy sm:text-xl">AUCTIVA</span>
        </Link>
        <form role="search" action="/phones" className="relative hidden min-w-0 flex-1 md:block lg:max-w-xl">
          <label htmlFor="q" className="sr-only">Search phones</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy/50" />
          <input id="q" name="q" type="search" placeholder="Search iPhone, Samsung, Tecno…" className="h-11 w-full rounded-xl border border-navy/15 bg-navy-soft/60 pl-10 pr-4 text-sm placeholder:text-navy/50 focus:bg-white" />
        </form>
        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map(([l, h]) => <Link key={l} href={h} className="rounded-lg px-3 py-2 text-sm font-medium text-navy hover:bg-navy-soft">{l}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link href="/phones" className="btn-ghost !min-w-[44px] !px-0 md:hidden" aria-label="Search"><Search className="h-5 w-5" /></Link>
          {user
            ? <button onClick={signOut} className="btn-ghost hidden sm:inline-flex" title={user.email}><LogOut className="h-4 w-4" />Sign out</button>
            : <Link href="/login" className="btn-primary hidden sm:inline-flex"><User className="h-4 w-4" />Sign in</Link>}
          <button onClick={() => setOpen(!open)} className="btn-ghost !min-w-[44px] !px-0 lg:hidden" aria-expanded={open} aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-navy/10 bg-white lg:hidden" aria-label="Mobile">
          <div className="container-page grid gap-1 py-3">
            {links.map(([l, h]) => <Link key={l} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 font-medium text-navy hover:bg-navy-soft">{l}</Link>)}
            {user ? <button onClick={signOut} className="btn-ghost mt-2 sm:hidden">Sign out</button> : <Link href="/login" className="btn-primary mt-2 sm:hidden">Sign in</Link>}
          </div>
        </nav>
      )}
    </header>
  );
}
