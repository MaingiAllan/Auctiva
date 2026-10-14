import { notFound } from "next/navigation";
import { MapPin, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { GRADE_LABEL, getListing } from "@/lib/api";
import { kes } from "@/lib/format";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const l = await getListing(params.id);
  if (!l) notFound();
  const m = l.deviceModel;
  const specs: [string, string][] = [["Brand", m.brandName], ["Model", m.name], ["Variant", m.variant ?? "—"], ["Release year", m.releaseYear ? String(m.releaseYear) : "—"], ["Condition grade", GRADE_LABEL[l.conditionGrade]], ["Listed", new Date(l.createdAt).toLocaleDateString("en-KE", { dateStyle: "medium" })]];
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-dark sm:aspect-[4/3]"><Smartphone className="h-20 w-20 text-white/25" aria-hidden /><span className="sr-only">No photo yet</span></div>
          <div>
            <span className="rounded-lg bg-teal-soft px-2 py-1 text-xs font-bold text-teal-deep">Grade {GRADE_LABEL[l.conditionGrade]}</span>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{l.title}</h1>
            <p className="mt-3 text-3xl font-extrabold text-navy">{kes(l.price, l.currency)}</p>
            {l.location && <p className="mt-2 flex items-center gap-1 text-sm text-ink/60"><MapPin className="h-4 w-4" />{l.location}</p>}
            <p className="mt-5 rounded-xl bg-navy-soft p-3 text-sm text-ink/75">Checkout and seller messaging are coming soon.</p>
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
