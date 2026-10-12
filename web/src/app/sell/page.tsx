"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";

const grades = ["A+", "A", "B+", "B", "C", "D", "Parts only"];
export default function Sell() {
  const [done, setDone] = useState(false);
  const f = "h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base";
  const L = ({ id, t }: { id: string; t: string }) => <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">{t}</label>;
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <form onSubmit={(e) => { e.preventDefault(); setDone(true); }} className="mx-auto max-w-3xl space-y-8">
          <div><h1 className="text-2xl font-extrabold sm:text-3xl">Sell a phone</h1><p className="mt-1 text-ink/70">Honest photos and details sell faster and avoid disputes.</p></div>
          <section className="space-y-3"><h2 className="text-lg font-bold">1. Photos</h2><ImageUploader /></section>
          <section className="space-y-4"><h2 className="text-lg font-bold">2. Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><L id="t" t="Title" /><input id="t" required className={f} placeholder="e.g. Samsung Galaxy S24 256GB" /></div>
              <div><L id="g" t="Condition grade" /><select id="g" className={f}>{grades.map((g) => <option key={g}>{g}</option>)}</select></div>
              <div><L id="pr" t="Price (KES)" /><input id="pr" type="number" min={1} required inputMode="numeric" className={f} /></div>
              <div><L id="im" t="IMEI (dial *#06#)" /><input id="im" inputMode="numeric" maxLength={15} className={f} /></div>
              <div><L id="lo" t="Location" /><input id="lo" required className={f} placeholder="e.g. Nairobi" /></div>
              <div className="sm:col-span-2"><L id="d" t="Description" /><textarea id="d" rows={5} className={`${f} h-auto py-3`} placeholder="Mention any defects, what is included, and whether the price is negotiable." /></div>
            </div>
          </section>
          <button className="btn-primary w-full sm:w-auto">Publish listing</button>
          {done && <p role="status" className="rounded-xl bg-teal-soft p-3 text-sm text-teal-deep">Form works. Publishing to the Auctiva API comes next.</p>}
        </form>
      </main>
      <Footer />
    </>
  );
}
