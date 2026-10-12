"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Star, X } from "lucide-react";

const MAX = 8, OK = ["image/jpeg", "image/png", "image/webp"], MB = 5;
type Img = { id: string; url: string };

export default function ImageUploader() {
  const [imgs, setImgs] = useState<Img[]>([]);
  const [cover, setCover] = useState(0);
  const [err, setErr] = useState("");
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);

  const add = (files: FileList | null) => {
    if (!files) return;
    let msg = "";
    const next = [...imgs];
    for (const f of Array.from(files)) {
      if (next.length >= MAX) { msg = `Up to ${MAX} photos.`; break; }
      if (!OK.includes(f.type)) { msg = "Use JPEG, PNG or WebP photos."; continue; }
      if (f.size > MB * 1024 * 1024) { msg = `Each photo must be under ${MB}MB.`; continue; }
      const url = URL.createObjectURL(f); urls.current.push(url);
      next.push({ id: url, url });
    }
    setErr(msg); setImgs(next);
  };
  const btn = "btn-ghost cursor-pointer";
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <label className={btn}><ImagePlus className="h-4 w-4" />Choose photos<input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} /></label>
        <label className={btn}><Camera className="h-4 w-4" />Take a photo<input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ""; }} /></label>
      </div>
      <p className="mt-2 text-xs text-ink/60">Up to {MAX} clear photos. Show the front, back, any damage and what is in the box.</p>
      {err && <p role="alert" className="mt-2 text-sm font-medium text-red-700">{err}</p>}
      {imgs.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {imgs.map((im, n) => (
            <li key={im.id} className={`relative aspect-square overflow-hidden rounded-xl border-2 ${cover === n ? "border-teal-deep" : "border-navy/10"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt={`Photo ${n + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => setCover(n)} aria-label="Set as cover" className="absolute bottom-1.5 left-1.5 flex h-9 items-center gap-1 rounded-lg bg-white/95 px-2 text-xs font-semibold text-navy"><Star className={`h-4 w-4 ${cover === n ? "fill-amber-400 text-amber-400" : ""}`} />{cover === n ? "Cover" : ""}</button>
              <button type="button" onClick={() => { setImgs(imgs.filter((_, k) => k !== n)); setCover(0); }} aria-label="Remove photo" className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-navy"><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
