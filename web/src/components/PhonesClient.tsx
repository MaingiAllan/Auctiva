"use client";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import { GRADE_LABEL, type Grade, type Listing } from "@/lib/api";
import { kes } from "@/lib/format";

const PAGE = 8;
// Filtering happens in the browser on the already-loaded list, so every change is instant (no network round-trip).
export default function PhonesClient({ listings, initialQ }: { listings: Listing[]; initialQ: string }) {
  const ceiling = Math.max(10000, ...listings.map((l) => Math.ceil(l.price / 5000) * 5000));
  const brands = ["All", ...Array.from(new Set(listings.map((l) => l.deviceModel.brandName))).sort()];
  const [q, setQ] = useState(initialQ);
  const [brand, setBrand] = useState("All");
  const [grade, setGrade] = useState<Grade | "All">("All");
  const [max, setMax] = useState(ceiling);
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const set = <T,>(f: (v: T) => void) => (v: T) => { f(v); setPage(1); };

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const r = listings.filter((l) => (brand === "All" || l.deviceModel.brandName === brand) && (grade === "All" || l.conditionGrade === grade) && l.price <= max && (!t || `${l.title} ${l.deviceModel.brandName} ${l.deviceModel.name}`.toLowerCase().includes(t)));
    return r.sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [listings, q, brand, grade, max, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const cur = Math.min(page, pages);
  const field = "h-11 w-full rounded-xl border border-navy/15 bg-white px-3 text-sm";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Phones <span className="text-base font-medium text-ink/60">({list.length})</span></h1>
        <div className="flex items-center gap-2">
          <button className="btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open}><SlidersHorizontal className="h-4 w-4" />Filters</button>
          <label className="sr-only" htmlFor="sort">Sort</label>
          <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className={`${field} !w-auto`}><option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside className={`${open ? "block" : "hidden"} space-y-5 rounded-2xl border border-navy/10 bg-white p-5 lg:block lg:self-start`} aria-label="Filters">
          <div><label htmlFor="fq" className="mb-1.5 block text-sm font-semibold text-navy">Search</label><input id="fq" type="search" value={q} onChange={(e) => set(setQ)(e.target.value)} className={field} placeholder="Model or brand" /></div>
          <div><label htmlFor="brand" className="mb-1.5 block text-sm font-semibold text-navy">Brand</label><select id="brand" className={field} value={brand} onChange={(e) => set(setBrand)(e.target.value)}>{brands.map((b) => <option key={b}>{b}</option>)}</select></div>
          <div><span className="mb-1.5 block text-sm font-semibold text-navy">Condition grade</span>
            <div className="flex flex-wrap gap-2">{(["All", ...Object.keys(GRADE_LABEL)] as (Grade | "All")[]).map((g) => <button key={g} onClick={() => set(setGrade)(g)} aria-pressed={grade === g} className={`min-h-[40px] rounded-lg border px-3 text-sm font-medium ${grade === g ? "border-navy bg-navy text-white" : "border-navy/20 text-navy"}`}>{g === "All" ? "All" : GRADE_LABEL[g]}</button>)}</div></div>
          <div><label htmlFor="max" className="mb-1.5 flex justify-between text-sm font-semibold text-navy">Max price <span className="font-medium text-teal-deep">{kes(max)}</span></label><input id="max" type="range" min={5000} max={ceiling} step={5000} value={max} onChange={(e) => set(setMax)(+e.target.value)} className="w-full accent-[#0E7C86]" /></div>
        </aside>
        <section>
          {list.length === 0 ? <p className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">No phones match these filters.</p> : <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">{list.slice((cur - 1) * PAGE, cur * PAGE).map((l) => <ProductCard key={l.id} l={l} />)}</div>}
          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button className="btn-ghost !px-3" disabled={cur === 1} onClick={() => setPage(cur - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => <button key={i} onClick={() => setPage(i + 1)} aria-current={cur === i + 1} className={`btn !px-0 w-11 ${cur === i + 1 ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}>{i + 1}</button>)}
              <button className="btn-ghost !px-3" disabled={cur === pages} onClick={() => setPage(cur + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
