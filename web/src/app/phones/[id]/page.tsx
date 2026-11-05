import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutButton from "@/components/CheckoutButton";
import { CATEGORY_LABEL, GRADE_LABEL, LISTING_TYPE_LABEL, getListing } from "@/lib/api";
import { kes } from "@/lib/format";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const l = await getListing(params.id);
  if (!l) notFound();
  const m = l.deviceModel;
  const specs: [string, string][] = [["Category", CATEGORY_LABEL[m.category]], ["Brand", m.brandName], ["Model", m.name], ["Variant", m.variant ?? "—"], ["Release year", m.releaseYear ? String(m.releaseYear) : "—"], ["Listing type", LISTING_TYPE_LABEL[l.listingType]], ["Condition grade", l.conditionGrade ? GRADE_LABEL[l.conditionGrade] : "Not applicable"], ["Listed", new Date(l.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })]];
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-navy-dark sm:aspect-[4/3]">
            {l.imageUrls?.[0] ? <Image src={l.imageUrls[0]} alt={l.title} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" /> : <><Smartphone className="h-20 w-20 text-white/25" aria-hidden /><span className="sr-only">No photo yet</span></>}
          </div>
          {(l.imageUrls?.length ?? 0) > 1 && <div className="mt-3 grid grid-cols-4 gap-3">{l.imageUrls?.slice(1).map((url, index) => <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-navy-soft"><Image src={url} alt={`${l.title}, photo ${index + 2}`} fill sizes="25vw" className="object-cover" /></div>)}</div>}
          <div>
            <span className="rounded-lg bg-teal-soft px-2 py-1 text-xs font-bold text-teal-deep">{LISTING_TYPE_LABEL[l.listingType]}{l.conditionGrade ? ` · Grade ${GRADE_LABEL[l.conditionGrade]}` : ""}</span>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{l.title}</h1>
            <p className="mt-3 text-3xl font-extrabold text-navy">{kes(l.price, l.currency)}</p>
            {l.location && <p className="mt-2 flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{l.location}</p>}
            <CheckoutButton listingId={l.id} status={l.status} />
            <p className="mt-3 text-xs text-ink/55">Seller messaging and buyer protection are coming soon.</p>
            <h2 className="mt-8 text-lg font-bold">Specifications</h2>
            <dl className="mt-3 divide-y divide-navy/10 rounded-xl border border-navy/10">{specs.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm"><dt className="text-ink/60">{k}</dt><dd className="font-semibold text-navy">{v}</dd></div>)}</dl>
            {l.description && <><h2 className="mt-8 text-lg font-bold">Description</h2><p className="mt-2 whitespace-pre-line text-ink/75">{l.description}</p></>}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
