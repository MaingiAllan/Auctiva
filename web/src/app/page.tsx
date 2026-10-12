import { ArrowRight, BadgeCheck, ScanLine, ShieldCheck, Truck, Wallet, Gavel, Repeat } from "lucide-react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { products } from "@/lib/sample-data";

const trust = [
  { Icon: ScanLine, title: "IMEI checked", text: "Every device screened against stolen-phone lists." },
  { Icon: BadgeCheck, title: "Partner inspected", text: "Technician-verified condition grades you can trust." },
  { Icon: Wallet, title: "M-PESA ready", text: "Pay the way Kenya already pays." },
  { Icon: Truck, title: "Tracked delivery", text: "Follow your phone from seller to doorstep." },
];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-navy-soft to-white">
          <div className="container-page section grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-soft px-3 py-1 text-xs font-semibold text-teal-deep">
                <ShieldCheck className="h-4 w-4" /> Verified smartphones, Kenya
              </p>
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold">Buy, sell and bid on phones you can trust.</h1>
              <p className="mt-5 max-w-xl text-base text-ink/75 sm:text-lg">Every listing is IMEI-screened and graded honestly. Pay with M-PESA, track delivery, and shop with protection.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="/phones" className="btn-primary">Browse phones <ArrowRight className="h-4 w-4" /></a>
                <a href="#" className="btn-accent"><Gavel className="h-4 w-4" /> Live auctions</a>
                <a href="#" className="btn-ghost"><Repeat className="h-4 w-4" /> Trade in</a>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {trust.map(({ Icon, title, text }) => (
                <li key={title} className="rounded-2xl bg-white p-5 shadow-card">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-teal-deep"><Icon className="h-5 w-5" /></span>
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Listings */}
        <section id="phones" className="container-page section">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Fresh listings</h2>
            <a href="/phones" className="text-sm font-semibold text-teal-deep hover:underline">View all</a>
          </div>
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
            {products.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* Trade-in band */}
        <section className="container-page pb-16 sm:pb-24">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-navy p-8 sm:flex-row sm:items-center sm:p-12">
            <div>
              <h2 className="!text-white text-2xl font-extrabold sm:text-3xl">Got an old phone? Get an offer today.</h2>
              <p className="mt-2 max-w-xl text-white/80">Estimate its value in a minute, then drop it at a partner centre.</p>
            </div>
            <a href="#" className="btn bg-white text-navy hover:bg-teal-soft">Start trade-in <ArrowRight className="h-4 w-4" /></a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
