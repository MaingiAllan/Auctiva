import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PhonesClient from "@/components/PhonesClient";
import { getListings } from "@/lib/api";

// Dynamic so ?q= from the header search is honoured; the data fetch itself is still cached for 30s.
export const dynamic = "force-dynamic";

export default async function Phones({ searchParams }: { searchParams: { q?: string } }) {
  const listings = await getListings();
  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        {listings === null ? <p role="alert" className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">We couldn&apos;t load listings right now. Please try again shortly.</p> : <PhonesClient listings={listings} initialQ={searchParams.q ?? ""} />}
      </main>
      <Footer />
    </>
  );
}
