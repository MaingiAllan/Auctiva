import Link from "next/link";
import { MapPin, Smartphone } from "lucide-react";
import { kes } from "@/lib/format";
import { GRADE_LABEL, type Listing } from "@/lib/api";

export default function ProductCard({ l }: { l: Listing }) {
  return (
    <Link href={`/phones/${l.id}`} className="group overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-card transition duration-200 hover:-translate-y-1">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-navy to-navy-dark">
        <Smartphone className="h-12 w-12 text-white/25" aria-hidden />
        <span className="absolute left-3 top-3 rounded-lg bg-white px-2 py-1 text-xs font-bold text-navy">Grade {GRADE_LABEL[l.conditionGrade]}</span>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold text-teal-deep">{l.deviceModel.brandName}</p>
        <h3 className="line-clamp-1 text-base font-bold">{l.title}</h3>
        <p className="mt-1 text-lg font-extrabold text-navy">{kes(l.price, l.currency)}</p>
        {l.location && <p className="mt-2 flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{l.location}</p>}
      </div>
    </Link>
  );
}
