export type Grade = "A_PLUS" | "A" | "B_PLUS" | "B" | "C" | "D" | "PARTS_ONLY";
export const GRADE_LABEL: Record<Grade, string> = { A_PLUS: "A+", A: "A", B_PLUS: "B+", B: "B", C: "C", D: "D", PARTS_ONLY: "Parts only" };
export const CONDITION_GRADES: Grade[] = ["A_PLUS", "A", "B_PLUS", "B", "C", "D"];
export type Category = "SMARTPHONE" | "LAPTOP" | "TABLET" | "WATCH" | "BLUETOOTH_SPEAKER" | "POWERBANK";
export const CATEGORY_LABEL: Record<Category, string> = {
  SMARTPHONE: "Phones",
  LAPTOP: "Laptops",
  TABLET: "Tablets",
  WATCH: "Watches",
  BLUETOOTH_SPEAKER: "Bluetooth Speakers",
  POWERBANK: "Powerbanks",
};
export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
export type ListingType = "BRAND_NEW" | "REFURBISHED" | "FAIRLY_USED" | "PARTS_ONLY";
export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  BRAND_NEW: "Brand New",
  REFURBISHED: "Refurbished",
  FAIRLY_USED: "Fairly Used",
  PARTS_ONLY: "Parts Only",
};
export const LISTING_TYPES = Object.keys(LISTING_TYPE_LABEL) as ListingType[];
export type DeviceModel = { id: string; brandName: string; name: string; variant: string | null; releaseYear: number | null; category: Category };
export type Listing = { id: string; sellerId: string; deviceModel: DeviceModel; title: string; description: string | null; listingType: ListingType; conditionGrade: Grade | null; price: number; currency: string; location: string | null; status: string; createdAt: string; imageUrls?: string[] };
export type CreateListingInput = {
  deviceModelId: string;
  title: string;
  description?: string;
  listingType: ListingType;
  conditionGrade: Grade | null;
  price: number;
  currency: string;
  location?: string;
  imei1?: string;
};
export type Auth = { token: string; email: string; role: string };

// Server components call the backend directly and cache for 30s (fast repeat visits).
const SERVER = process.env.BACKEND_URL ?? "http://localhost:8080";
async function serverGet<T>(path: string): Promise<T | null> {
  try { const r = await fetch(`${SERVER}${path}`, { next: { revalidate: 30 } }); return r.ok ? ((await r.json()) as T) : null; } catch { return null; }
}
export const getListings = () => serverGet<Listing[]>("/api/listings");
export const getListing = (id: string) => serverGet<Listing>(`/api/listings/${encodeURIComponent(id)}`);
export const getCatalogModels = () => serverGet<(DeviceModel & { brandId: string })[]>("/api/catalog/device-models");

// Browser calls go through the same-origin /api rewrite (see next.config.js).
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
async function call<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const r = await fetch(path, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, data?.error ?? (data ? Object.values(data).join(", ") : r.status === 401 || r.status === 403 ? "Your session has expired. Please sign in again." : `Request failed (${r.status})`));
  return data as T;
}
export const login = (email: string, password: string) => call<Auth>("/api/auth/login", { email, password });
export const registerUser = (
  email: string,
  password: string,
  fullName: string,
  turnstileToken: string,
) => call<{ message: string }>("/api/auth/register", {
  email, password, fullName, turnstileToken, agreedToTerms: true,
});
export const verifyEmail = (token: string) =>
  call<{ message: string }>("/api/auth/verify-email", { token });
export const getDeviceModels = (category?: Category, brandId?: string) => {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (brandId) params.set("brandId", brandId);
  return call<(DeviceModel & { brandId: string })[]>(`/api/catalog/device-models${params.size ? `?${params}` : ""}`);
};
export const createListing = (token: string, data: CreateListingInput) => call<Listing>("/api/listings", data, token);
export async function uploadListingImages(token: string, listingId: string, files: File[]) {
  const body = new FormData();
  files.forEach((file) => body.append("images", file));
  const response = await fetch(`/api/listings/${encodeURIComponent(listingId)}/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data?.message ?? `Photo upload failed (${response.status})`);
  return data as string[];
}
