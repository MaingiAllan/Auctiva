"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import {
  CATEGORY_LABEL,
  CATEGORIES,
  CONDITION_GRADES,
  GRADE_LABEL,
  LISTING_TYPE_LABEL,
  LISTING_TYPES,
  type Category,
  type DeviceModel,
  type Grade,
  type Listing,
  type ListingType,
} from "@/lib/api";

const PAGE = 8;
export default function PhonesClient({
  listings,
  models,
  initialQ,
}: {
  listings: Listing[];
  models: DeviceModel[];
  initialQ: string;
}) {
  const [category, setCategory] = useState<Category>("SMARTPHONE");
  const [brand, setBrand] = useState("All");
  const [q, setQ] = useState(initialQ);
  const [listingType, setListingType] = useState<ListingType | "All">("All");
  const [grade, setGrade] = useState<Grade | "All">("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const setFilter = <T,>(setValue: (value: T) => void) => (value: T) => {
    setValue(value);
    setPage(1);
  };
  const categoryBrands = useMemo(
    () => Array.from(new Set(models.filter((model) => model.category === category).map((model) => model.brandName))).sort(),
    [models, category],
  );
  const invalidRange = minPrice !== "" && maxPrice !== "" && Number(minPrice) > Number(maxPrice);
  const isBrandNew = listingType === "BRAND_NEW";
  const isPartsOnly = listingType === "PARTS_ONLY";

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return listings
      .filter((listing) => listing.deviceModel.category === category)
      .filter((listing) => brand === "All" || listing.deviceModel.brandName === brand)
      .filter((listing) => listingType === "All" || listing.listingType === listingType)
      .filter((listing) => grade === "All" || listing.conditionGrade === grade)
      .filter((listing) => minPrice === "" || listing.price >= Number(minPrice))
      .filter((listing) => maxPrice === "" || listing.price <= Number(maxPrice))
      .filter((listing) => !term || `${listing.title} ${listing.deviceModel.brandName} ${listing.deviceModel.name}`.toLowerCase().includes(term))
      .sort((a, b) => sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [listings, category, brand, listingType, grade, minPrice, maxPrice, q, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const currentPage = Math.min(page, pages);
  const field = "h-11 w-full rounded-xl border border-navy/15 bg-white px-3 text-sm";

  function changeCategory(value: Category) {
    setCategory(value);
    setBrand("All");
    setPage(1);
  }

  function changeListingType(value: ListingType | "All") {
    setListingType(value);
    if (value === "BRAND_NEW" || value === "PARTS_ONLY") setGrade("All");
    setPage(1);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Marketplace <span className="text-base font-medium text-ink/60">({list.length})</span></h1>
        <div className="flex items-center gap-2">
          <button className="btn-ghost lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="marketplace-filters"><SlidersHorizontal className="h-4 w-4" aria-hidden="true" />Filters</button>
          <label className="sr-only" htmlFor="sort">Sort listings</label>
          <select id="sort" value={sort} onChange={(event) => setFilter(setSort)(event.target.value)} className={`${field} !w-auto`}>
            <option value="new">Newest</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside id="marketplace-filters" className={`${open ? "block" : "hidden"} space-y-5 rounded-2xl border border-navy/10 bg-white p-5 lg:block lg:self-start`} aria-label="Marketplace filters">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-semibold text-navy">Category</label>
            <select id="category" className={field} value={category} onChange={(event) => changeCategory(event.target.value as Category)}>
              {CATEGORIES.map((item) => <option key={item} value={item}>{CATEGORY_LABEL[item]}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fq" className="mb-1.5 block text-sm font-semibold text-navy">Search</label>
            <input id="fq" type="search" value={q} onChange={(event) => setFilter(setQ)(event.target.value)} className={field} placeholder="Model or brand" />
          </div>
          <div>
            <label htmlFor="brand" className="mb-1.5 block text-sm font-semibold text-navy">Brand</label>
            <select id="brand" className={field} value={brand} onChange={(event) => setFilter(setBrand)(event.target.value)}>
              <option value="All">All brands</option>
              {categoryBrands.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold text-navy">Listing type</legend>
            <div className="flex flex-wrap gap-2">
              {(["All", ...LISTING_TYPES] as (ListingType | "All")[]).map((type) => (
                <button key={type} type="button" onClick={() => changeListingType(type)} aria-pressed={listingType === type}
                  className={`min-h-[40px] rounded-lg border px-3 text-sm font-medium ${listingType === type ? "border-teal-deep bg-teal-soft text-teal-deep" : "border-navy/20 text-navy"}`}>
                  {type === "All" ? "All" : LISTING_TYPE_LABEL[type]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-1.5 block text-sm font-semibold text-navy">
              Condition grade {isBrandNew && <span className="font-normal text-ink/60">(not applicable to Brand New)</span>}
              {isPartsOnly && <span className="font-normal text-ink/60">(set by Parts Only type)</span>}
            </legend>
            <div className="flex flex-wrap gap-2">
              {(["All", ...CONDITION_GRADES] as (Grade | "All")[]).map((item) => (
                <button key={item} type="button" disabled={isBrandNew || isPartsOnly} onClick={() => setFilter(setGrade)(item)}
                  aria-pressed={grade === item} className={`min-h-[40px] rounded-lg border px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${grade === item ? "border-teal-deep bg-teal-soft text-teal-deep" : "border-navy/20 text-navy"}`}>
                  {item === "All" ? "All" : GRADE_LABEL[item]}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-navy">Price range (Ksh)</span>
            <div className="flex items-center gap-2">
              <label className="sr-only" htmlFor="min-price">Minimum price</label>
              <input id="min-price" type="number" min="0" inputMode="numeric" value={minPrice} onChange={(event) => setFilter(setMinPrice)(event.target.value)} className={field} placeholder="Min" />
              <span aria-hidden="true" className="text-ink/60">–</span>
              <label className="sr-only" htmlFor="max-price">Maximum price</label>
              <input id="max-price" type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(event) => setFilter(setMaxPrice)(event.target.value)} className={field} placeholder="Max" />
            </div>
            {invalidRange && <p role="alert" className="mt-1 text-xs font-medium text-red-700">Minimum price must not exceed maximum price.</p>}
          </div>
        </aside>
        <section aria-live="polite">
          {list.length === 0 ? <p className="rounded-2xl bg-navy-soft p-10 text-center text-ink/70">No listings match these filters.</p> : <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">{list.slice((currentPage - 1) * PAGE, currentPage * PAGE).map((listing) => <ProductCard key={listing.id} l={listing} />)}</div>}
          {pages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
              <button className="btn-ghost !px-3" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, index) => <button key={index} onClick={() => setPage(index + 1)} aria-current={currentPage === index + 1 ? "page" : undefined} className={`btn !px-0 w-11 ${currentPage === index + 1 ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}>{index + 1}</button>)}
              <button className="btn-ghost !px-3" disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
