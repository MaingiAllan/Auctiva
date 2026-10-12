import { notFound } from "next/navigation";
import { MapPin, MessageCircle, ShieldCheck, Store } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/ProductGallery";
import RatingStars from "@/components/RatingStars";
import { products } from "@/lib/sample-data";
import { kes } from "@/lib/format";

export function generateStaticParams() { return products.map((p) => ({ id: p.id })); }

export default function ProductPage({ params }: { params: { id: string } }) {
  const p = products.find((x) => x.id === params.id);
  if (!p) notFound();
  const specs = [["Brand", p.brand], ["Condition", `${p.condition} · Grade ${p.grade}`], ["Storage", p.storage], ["Battery health", `${p.battery}%`], ["IMEI check", p.verified ? "Passed" : "Not yet verified"]];
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery color={p.img} verified={p.verified} />
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{p.title}</h1>
            <p className="mt-3 text-3xl font-extrabold text-navy">{kes(p.price)}</p>
            <p className="mt-2 flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{p.location}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary flex-1">Buy now</button>
              <button className="btn-accent flex-1"><MessageCircle className="h-4 w-4" />Contact seller</button>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-teal-soft p-3 text-sm text-teal-deep"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />Protected payment and tracked delivery apply to this listing.</p>
            <h2 className="mt-8 text-lg font-bold">Specifications</h2>
            <dl className="mt-3 divide-y divide-navy/10 rounded-xl border border-navy/10">
              {specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm"><dt className="text-ink/60">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>)}
            </dl>
            <h2 className="mt-8 text-lg font-bold">Description</h2>
            <p className="mt-2 text-ink/75">{p.description}</p>
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-navy/10 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-soft text-navy"><Store className="h-6 w-6" /></span>
              <div><p className="font-bold text-navy">{p.seller}</p><RatingStars value={p.rating} count={p.reviews} /></div>
            </div>
          </div>
        </div>
        <section className="mt-14" aria-labelledby="rev">
          <h2 id="rev" className="text-xl font-extrabold">Reviews</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {["Matched the description and arrived well packed.", "Seller replied quickly. Battery health was as stated."].map((t, i) => (
              <article key={i} className="rounded-2xl border border-navy/10 p-5"><RatingStars value={5 - i * 0.5} /><p className="mt-2 text-sm text-ink/75">{t}</p><p className="mt-2 text-xs font-semibold text-teal-deep">Verified buyer · sample review</p></article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
