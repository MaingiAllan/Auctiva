"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImageUploader from "@/components/ImageUploader";
import {
  ApiError,
  CATEGORIES,
  CATEGORY_LABEL,
  CONDITION_GRADES,
  GRADE_LABEL,
  LISTING_TYPE_LABEL,
  LISTING_TYPES,
  createListing,
  getDeviceModels,
  uploadListingImages,
  type Category,
  type DeviceModel,
  type ListingType,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

const f = "h-12 w-full rounded-xl border border-navy/15 bg-white px-4 text-base";
const L = ({ id, t }: { id: string; t: string }) => <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">{t}</label>;

export default function Sell() {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();
  const [models, setModels] = useState<DeviceModel[]>([]);
  const [category, setCategory] = useState<Category>("SMARTPHONE");
  const [brand, setBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [listingType, setListingType] = useState<ListingType>("FAIRLY_USED");
  const [photos, setPhotos] = useState<File[]>([]);
  const [publishedListingId, setPublishedListingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { getDeviceModels().then((items) => {
    setModels(items);
    setBrand(Array.from(new Set(items.filter((item) => item.category === "SMARTPHONE").map((item) => item.brandName))).sort()[0] ?? "");
  }).catch(() => setErr("Couldn't load marketplace models. Refresh to retry.")); }, []);
  const categoryModels = models.filter((model) => model.category === category);
  const brands = Array.from(new Set(categoryModels.map((model) => model.brandName))).sort();
  const brandModels = categoryModels.filter((model) => model.brandName === brand);
  const isBrandNew = listingType === "BRAND_NEW";
  const isPartsOnly = listingType === "PARTS_ONLY";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!user) return;
    setErr(""); setBusy(true);
    const form = e.currentTarget;
    const v = (k: string) => String(new FormData(form).get(k) ?? "").trim();
    let listingWasPublished = Boolean(publishedListingId);
    try {
      let listingId = publishedListingId;
      if (!listingId) {
        const grade = isBrandNew ? null : isPartsOnly ? "PARTS_ONLY" : CONDITION_GRADES.find((item) => item === v("grade"));
        if (grade === undefined) {
          setErr("Choose a condition grade for this listing.");
          setBusy(false);
          return;
        }
        const listing = await createListing(user.token, {
          deviceModelId: v("model"),
          title: v("title"),
          description: v("description") || undefined,
          listingType,
          conditionGrade: grade,
          price: Number(v("price")),
          currency: "KES",
          location: v("location") || undefined,
          imei1: v("imei") || undefined,
        });
        listingId = listing.id;
        listingWasPublished = true;
        setPublishedListingId(listingId);
      }
      if (photos.length) await uploadListingImages(user.token, listingId, photos);
      router.push(`/phones/${listingId}`);
    } catch (x) {
      if (x instanceof ApiError && (x.status === 401 || x.status === 403)) signOut();
      setErr(listingWasPublished ? `Your listing was published, but its photos could not be saved: ${(x as Error).message}. Submit again to retry.` : (x as Error).message);
    } finally { setBusy(false); }
  }
  if (ready && !user) return (<><Header /><main className="container-page section text-center"><h1 className="text-2xl font-extrabold">Sign in to sell</h1><p className="mt-2 text-ink/70">You need an account to publish a listing.</p><Link href="/login" className="btn-primary mt-6">Sign in</Link></main><Footer /></>);

  return (
    <>
      <Header />
      <main className="container-page section !pt-8 sm:!pt-10">
        <form onSubmit={submit} className="mx-auto max-w-3xl space-y-8">
          <div><h1 className="text-2xl font-extrabold sm:text-3xl">Sell an item</h1><p className="mt-1 text-ink/70">Honest details sell faster and avoid disputes.</p></div>
          <section className="space-y-3"><h2 className="text-lg font-bold">1. Photos</h2><ImageUploader onChange={setPhotos} /><p className="text-xs text-ink/60">JPEG, PNG or WebP, up to 5MB each.</p></section>
          <section className="space-y-4"><h2 className="text-lg font-bold">2. Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><L id="category" t="Category" /><select id="category" required className={f} value={category} onChange={(event) => {
                const nextCategory = event.target.value as Category;
                const nextBrands = Array.from(new Set(models.filter((model) => model.category === nextCategory).map((model) => model.brandName))).sort();
                setCategory(nextCategory);
                setBrand(nextBrands[0] ?? "");
                setSelectedModel("");
              }}>{CATEGORIES.map((item) => <option key={item} value={item}>{CATEGORY_LABEL[item]}</option>)}</select></div>
              <div><L id="brand" t="Brand" /><select id="brand" required className={f} value={brand} onChange={(event) => { setBrand(event.target.value); setSelectedModel(""); }}><option value="" disabled>Select a brand</option>{brands.map((item) => <option key={item}>{item}</option>)}</select></div>
              <div className="sm:col-span-2"><L id="model" t="Model" /><select id="model" name="model" required className={f} value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)}><option value="" disabled>Select a model</option>{brandModels.map((model) => <option key={model.id} value={model.id}>{model.name}{model.variant ? ` ${model.variant}` : ""}</option>)}</select></div>
              <div className="sm:col-span-2"><L id="title" t="Title" /><input id="title" name="title" required className={f} placeholder="e.g. Clean Galaxy S24, barely used" /></div>
              <div className="sm:col-span-2"><L id="listingType" t="Listing type" /><select id="listingType" required className={f} value={listingType} onChange={(event) => setListingType(event.target.value as ListingType)}>{LISTING_TYPES.map((item) => <option key={item} value={item}>{LISTING_TYPE_LABEL[item]}</option>)}</select></div>
              {isBrandNew ? <p className="sm:col-span-2 text-sm text-ink/60">Condition grade does not apply to a brand-new item.</p> : isPartsOnly ? <p className="sm:col-span-2 text-sm text-ink/60">The condition grade will be set to Parts only.</p> : <div><L id="grade" t="Condition grade" /><select id="grade" name="grade" required className={f} defaultValue="A">{CONDITION_GRADES.map((key) => <option key={key} value={key}>{GRADE_LABEL[key]}</option>)}</select></div>}
              <div><L id="price" t="Price (KES)" /><input id="price" name="price" type="number" min={1} required inputMode="numeric" className={f} /></div>
              <div><L id="imei" t="IMEI (dial *#06#)" /><input id="imei" name="imei" inputMode="numeric" pattern="\d{15}" maxLength={15} title="15 digits" className={f} /></div>
              <div><L id="location" t="Location" /><input id="location" name="location" className={f} placeholder="e.g. Nairobi" /></div>
              <div className="sm:col-span-2"><L id="description" t="Description" /><textarea id="description" name="description" rows={5} className={`${f} h-auto py-3`} placeholder="Mention any defects, what is included, and whether the price is negotiable." /></div>
            </div>
          </section>
          {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
          <button disabled={busy} className="btn-primary w-full disabled:opacity-60 sm:w-auto">{busy ? "Publishing…" : publishedListingId ? "Retry photo upload" : "Publish listing"}</button>
        </form>
      </main>
      <Footer />
    </>
  );
}
