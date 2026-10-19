import Header from "./Header";
import Footer from "./Footer";

export default function InfoPage({ title, draft, children }: { title: string; draft?: boolean; children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <article className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          {draft && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Draft: to be reviewed by Kenyan legal counsel before launch.</p>}
          <div className="mt-6 space-y-4 text-ink/80 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-navy [&_li]:ml-5 [&_li]:list-disc">{children}</div>
        </article>
      </main>
      <Footer />
    </>
  );
}
