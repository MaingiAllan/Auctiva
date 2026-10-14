export type Grade = "A_PLUS" | "A" | "B_PLUS" | "B" | "C" | "D" | "PARTS_ONLY";
export const GRADE_LABEL: Record<Grade, string> = { A_PLUS: "A+", A: "A", B_PLUS: "B+", B: "B", C: "C", D: "D", PARTS_ONLY: "Parts only" };
export type DeviceModel = { id: string; brandName: string; name: string; variant: string | null; releaseYear: number | null };
export type Listing = { id: string; sellerId: string; deviceModel: DeviceModel; title: string; description: string | null; conditionGrade: Grade; price: number; currency: string; location: string | null; status: string; createdAt: string };
export type Auth = { token: string; email: string; role: string };

// Server components call the backend directly and cache for 30s (fast repeat visits).
const SERVER = process.env.BACKEND_URL ?? "http://localhost:8080";
async function serverGet<T>(path: string): Promise<T | null> {
  try { const r = await fetch(`${SERVER}${path}`, { next: { revalidate: 30 } }); return r.ok ? ((await r.json()) as T) : null; } catch { return null; }
}
export const getListings = () => serverGet<Listing[]>("/api/listings");
export const getListing = (id: string) => serverGet<Listing>(`/api/listings/${encodeURIComponent(id)}`);

// Browser calls go through the same-origin /api rewrite (see next.config.js).
export class ApiError extends Error { constructor(public status: number, message: string) { super(message); } }
async function call<T>(path: string, body?: unknown, token?: string): Promise<T> {
  const r = await fetch(path, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new ApiError(r.status, data?.error ?? (data ? Object.values(data).join(", ") : r.status === 401 || r.status === 403 ? "Your session has expired. Please sign in again." : `Request failed (${r.status})`));
  return data as T;
}
export const login = (email: string, password: string) => call<Auth>("/api/auth/login", { email, password });
export const registerUser = (email: string, password: string, fullName: string) => call<Auth>("/api/auth/register", { email, password, fullName });
export const getDeviceModels = () => call<(DeviceModel & { brandId: string })[]>("/api/catalog/device-models");
export const createListing = (token: string, data: Record<string, unknown>) => call<Listing>("/api/listings", data, token);
