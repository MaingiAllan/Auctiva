// Brand-coloured basket catching fruit. Pure SVG + CSS (see globals.css), so it renders instantly.
export default function BasketLoader({ label = "Loading Auctiva" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-5">
      <svg viewBox="0 0 200 200" className="h-40 w-40 sm:h-48 sm:w-48" aria-hidden="true">
        <ellipse cx="100" cy="186" rx="52" ry="6" fill="#17375E" opacity=".12" />
        <g className="basket">
          {/* back handle + rim */}
          <path d="M62 112 C62 52 138 52 138 112" fill="none" stroke="#22A9A9" strokeWidth="9" strokeLinecap="round" />
          <rect x="44" y="108" width="112" height="9" rx="4.5" fill="#17375E" />
          {/* fruit sits between rim and front of basket */}
          <g className="fruit" style={{ animationDelay: "0s" }}><circle cx="78" cy="104" r="15" fill="#E5484D" /><path d="M78 90 q4-9 11-9" stroke="#0E7C86" strokeWidth="3.5" fill="none" strokeLinecap="round" /></g>
          <g className="fruit" style={{ animationDelay: ".9s" }}><circle cx="120" cy="104" r="15" fill="#F59E0B" /><circle cx="115" cy="99" r="3.5" fill="#fff" opacity=".35" /></g>
          <g className="fruit" style={{ animationDelay: "1.8s" }}><ellipse cx="100" cy="94" rx="14" ry="12" fill="#F2D33C" /><circle cx="95" cy="90" r="3" fill="#fff" opacity=".4" /></g>
          {/* front of basket, woven pattern in brand colours */}
          <path d="M48 114 H152 L140 170 Q138 178 130 178 H70 Q62 178 60 170 Z" fill="#17375E" />
          <path d="M58 128 H142 M62 144 H138 M66 160 H134" stroke="#fff" strokeWidth="3" opacity=".9" />
          <path d="M80 117 V176 M100 117 V178 M120 117 V176" stroke="#22A9A9" strokeWidth="4" />
        </g>
      </svg>
      <p className="font-display text-sm font-semibold tracking-wide text-navy">
        {label}
        <span className="dot ml-0.5">.</span><span className="dot" style={{ animationDelay: ".2s" }}>.</span><span className="dot" style={{ animationDelay: ".4s" }}>.</span>
      </p>
    </div>
  );
}
