import Link from "next/link";
import { BadgeCheck, MapPin } from "lucide-react";
import { kes } from "@/lib/format";
import type { Product } from "@/lib/sample-data";
import RatingStars from "./RatingStars";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/phones/${p.id}`} className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card transition duration-200 hover:-translate-y-1">
      <div className="relative aspect-[4/3]" style={{ background: `linear-gradient(135deg, ${p.img}, #0F2744)` }}>
        <span className="absolute left-3 top-3 rounded-lg bg-white px-2 py-1 text-xs font-bold text-navy">Grade {p.grade}</span>
        {p.verified && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-teal-deep px-2 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-bold">{p.title}</h3>
        <p className="mt-1 text-lg font-extrabold text-navy">{kes(p.price)}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-sm text-ink/60">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{p.location}</span>
          <RatingStars value={p.rating} />
        </div>
      </div>
    </Link>
  );
}
