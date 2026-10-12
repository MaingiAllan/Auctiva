"use client";
import { useState } from "react";
import { BadgeCheck } from "lucide-react";

// Sample panels stand in for real photos; swap for <Image> once listings return image URLs.
export default function ProductGallery({ color, verified }: { color: string; verified: boolean }) {
  const labels = ["Front", "Back", "Condition", "Box & accessories"];
  const [i, setI] = useState(0);
  const shade = ["", "99", "cc", "77"];
  return (
    <div>
      <div className="relative flex aspect-square items-center justify-center rounded-2xl text-lg font-semibold text-white/80 sm:aspect-[4/3]" style={{ background: `linear-gradient(135deg, ${color}${shade[i]}, #0F2744)` }}>
        {labels[i]}
        {verified && <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-teal-deep px-2 py-1 text-xs font-semibold text-white"><BadgeCheck className="h-3.5 w-3.5" />Verified</span>}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {labels.map((l, n) => <button key={l} onClick={() => setI(n)} aria-label={l} aria-current={i === n} className={`aspect-square rounded-xl border-2 ${i === n ? "border-teal-deep" : "border-transparent"}`} style={{ background: `linear-gradient(135deg, ${color}${shade[n]}, #0F2744)` }} />)}
      </div>
    </div>
  );
}
