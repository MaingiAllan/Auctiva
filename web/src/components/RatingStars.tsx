import { Star } from "lucide-react";
export default function RatingStars({ value, count }: { value: number; count?: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-navy/20"}`} />)}
      <span className="ml-1 text-sm font-semibold text-navy">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-sm text-ink/60">({count})</span>}
    </span>
  );
}
