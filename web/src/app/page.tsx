import Link from "next/link";
import { ArrowRight, BadgeCheck, Coins, MapPin, ScanLine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getListings } from "@/lib/api";

const points = [
  { Icon: BadgeCheck, title: "Honest grades", text: "Every phone is graded A+ to Parts only, with its condition disclosed." },
  { Icon: ScanLine, title: "IMEI on file", text: "Sellers record the IMEI so a device can be checked." },
  { Icon: Coins, title: "Clear pricing", text: "Prices in KES, shown up front." },
  { Icon: MapPin, title: "Local sellers", text: "Browse phones from sellers across Kenya." },
];

export default async function Home() {
  const listings = await getListings();
  const latest = [...(listings ?? [])].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 8);
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-b from-navy-soft to-white">
          <div className="container-page section grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold">Buy and sell phones with the condition spelled out.</h1>
              <p className="mt-5 max-w-xl text-base text-ink/75 sm:text-lg">Browse smartphones graded A+ to Parts only, with details recorded up front, or list your own in minutes.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/phones" className="btn-primary">Browse phones <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/sell" className="btn-accent">Sell your phone</Link>
              </div>
            </div>
            <ul className="grid grid-cols-2 gap-4">
              {points.map(({ Icon, title, text }) => (
                <li key={title} className="rounded-2xl bg-white p-5 shadow-card">
                  <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-soft text-teal-deep"><Icon className="h-5 w-5" /></span>
                  <h3 className="text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-ink/70">{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="container-page section">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold sm:text-3xl">Fresh listings</h2>
            <Link href="/phones" className="text-sm font-semibold text-teal-deep hover:underline">View all</Link>
          </div>
          {listings === null ? <p role="alert" className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">We couldn&apos;t load listings right now. Please try again shortly.</p>
            : latest.length === 0 ? <p className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">No listings yet. <Link href="/sell" className="font-semibold text-teal-deep underline">Be the first to sell.</Link></p>
            : <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">{latest.map((l) => <ProductCard key={l.id} l={l} />)}</div>}
        </section>
      </main>
      <Footer />
    </>
  );
}
