import Link from "next/link";

const links = [["About", "/about"], ["Help & FAQ", "/help"], ["Terms", "/terms"], ["Privacy", "/privacy"]];
export default function Footer() {
  return (
    <footer className="border-t border-navy/10 pb-[env(safe-area-inset-bottom)]">
      <div className="container-page flex flex-col gap-6 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-display font-bold text-navy">AUCTIVA · Community Market Place</p><p className="mt-1 text-ink/60">© {new Date().getFullYear()} Auctiva. All rights reserved.</p></div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(([l, h]) => <Link key={h} href={h} className="font-medium text-navy hover:underline">{l}</Link>)}
        </nav>
      </div>
    </footer>
  );
}
