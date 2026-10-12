export default function Footer() {
  return (
    <footer className="border-t border-navy/10 pb-[env(safe-area-inset-bottom)]">
      <div className="container-page flex flex-col gap-2 py-8 text-sm text-ink/60 sm:flex-row sm:justify-between">
        <p className="font-display font-bold text-navy">AUCTIVA · Community Market Place</p>
        <p>© {new Date().getFullYear()} Auctiva. All rights reserved.</p>
      </div>
    </footer>
  );
}
