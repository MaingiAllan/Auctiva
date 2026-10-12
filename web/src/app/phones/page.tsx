"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/sample-data";
import { kes } from "@/lib/format";

const PAGE = 6;
const brands = ["All", ...Array.from(new Set(products.map((p) => p.brand)))];
const conditions = ["All", "New", "Used", "Refurbished"];

export default function Phones() {
  const [brand, setBrand] = useState("All");
  const [cond, setCond] = useState("All");
  const [max, setMax] = useState(120000);
  const [verified, setVerified] = useState(false);
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  const list = useMemo(() => {
    const r = products.filter((p) => (brand === "All" || p.brand === brand) && (cond === "All" || p.condition === cond) && p.price <= max && (!verified || p.verified));
    return sort === "low" ? [...r].sort((a, b) => a.price - b.price) : sort === "high" ? [...r].sort((a, b) => b.price - a.price) : sort === "rating" ? [...r].sort((a, b) => b.rating - a.rating) : r;
  }, [brand, cond, max, verified, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages);
  const reset = <T,>(f: (v: T) => void) => (v: T) => { f(v); setPage(1); };
  const field = "h-11 w-full rounded-xl border border-navy/15 bg-white px-3 text-sm";

  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold sm:text-3xl">Phones <span className="text-base font-medium text-ink/60">({list.length})</span></h1>
          <div className="flex items-center gap-2">
            <button className="btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}><SlidersHorizontal className="h-4 w-4" />Filters</button>
            <label className="sr-only" htmlFor="sort">Sort</label>
            <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className={`${field} !w-auto`}>
              <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="rating">Top rated</option>
            </select>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside className={`${open ? "block" : "hidden"} space-y-5 rounded-2xl border border-navy/10 bg-white p-5 lg:block lg:self-start`} aria-label="Filters">
            <div><label className="mb-1.5 block text-sm font-semibold text-navy" htmlFor="brand">Brand</label>
              <select id="brand" className={field} value={brand} onChange={(e) => reset(setBrand)(e.target.value)}>{brands.map((b) => <option key={b}>{b}</option>)}</select></div>
            <div><span className="mb-1.5 block text-sm font-semibold text-navy">Condition</span>
              <div className="flex flex-wrap gap-2">{conditions.map((c) => <button key={c} onClick={() => reset(setCond)(c)} aria-pressed={cond === c} className={`min-h-[40px] rounded-lg border px-3 text-sm font-medium ${cond === c ? "border-navy bg-navy text-white" : "border-navy/20 text-navy"}`}>{c}</button>)}</div></div>
            <div><label className="mb-1.5 flex justify-between text-sm font-semibold text-navy" htmlFor="max">Max price <span className="font-medium text-teal-deep">{kes(max)}</span></label>
              <input id="max" type="range" min={15000} max={120000} step={5000} value={max} onChange={(e) => reset(setMax)(+e.target.value)} className="w-full accent-[#0E7C86]" /></div>
            <label className="flex min-h-[44px] items-center gap-3 text-sm font-medium text-navy"><input type="checkbox" checked={verified} onChange={(e) => reset(setVerified)(e.target.checked)} className="h-5 w-5 accent-[#0E7C86]" />Verified only</label>
          </aside>
          <section>
            {list.length === 0 ? <p className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">No phones match these filters. Try widening your search.</p> : (
              <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">{list.slice((cur - 1) * PAGE, cur * PAGE).map((p) => <ProductCard key={p.id} p={p} />)}</div>
            )}
            {pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
                <button className="btn-ghost !px-3" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: pages }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} aria-current={cur === i + 1} className={`btn !px-0 w-11 ${cur === i + 1 ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}>{i + 1}</button>)}
                <button className="btn-ghost !px-3" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
              </nav>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
