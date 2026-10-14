// Dev-only seed: creates a seed admin, phone brands/models, and sample listings through the real API.
// Usage (backend running, Docker Postgres up):  node scripts/seed.mjs
import { execSync } from "node:child_process";

const API = process.env.API_URL || "http://localhost:8080";
if (!/localhost|127\.0\.0\.1/.test(API) && !process.argv.includes("--force")) {
  console.error("Refusing to seed a non-local API (it creates an admin with a known password). Use --force only if you mean it."); process.exit(1);
}
const EMAIL = "seed-admin@auctiva.local", PASS = "Auctiva#Seed2026";
const call = async (path, body, token) => {
  const r = await fetch(API + path, { method: body ? "POST" : "GET", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); return { ok: r.ok, status: r.status, data: t ? JSON.parse(t) : null };
};

await call("/api/auth/register", { email: EMAIL, password: PASS, fullName: "Seed Admin" }); // 409 if it already exists: fine
execSync(`docker exec infra-postgres-1 psql -U auctiva -d auctiva -c "UPDATE users SET role='ADMIN' WHERE email='${EMAIL}';"`, { stdio: "ignore" });
const login = await call("/api/auth/login", { email: EMAIL, password: PASS });
if (!login.ok) { console.error("Login failed:", login.data); process.exit(1); }
const token = login.data.token;

const models = [["Apple", "iPhone 14 Pro", "256GB", 2022], ["Apple", "iPhone 12", "128GB", 2020], ["Samsung", "Galaxy S24", "256GB", 2024], ["Samsung", "Galaxy A54", "128GB", 2023], ["Google", "Pixel 8", "128GB", 2023], ["Tecno", "Camon 30 Pro", "256GB", 2024], ["Infinix", "Note 40", "128GB", 2024], ["Xiaomi", "Redmi Note 13", "128GB", 2024]];
for (const b of new Set(models.map((m) => m[0]))) await call("/api/catalog/brands", { name: b }, token);
const brands = Object.fromEntries((await call("/api/catalog/brands")).data.map((b) => [b.name, b.id]));
for (const [b, name, variant, releaseYear] of models) await call("/api/catalog/device-models", { brandId: brands[b], name, variant, releaseYear }, token);
const dm = (await call("/api/catalog/device-models")).data;
const id = (name) => dm.find((m) => m.name === name).id;

if ((await call("/api/listings")).data.length > 0) { console.log("Listings already exist, skipping listing seed."); process.exit(0); }
const d = "Fully working, tested before listing. Charger included.";
const listings = [
  ["iPhone 14 Pro", "iPhone 14 Pro 256GB, battery 91%", "A", 118000, "Nairobi"], ["iPhone 12", "iPhone 12 128GB, light wear", "B_PLUS", 42000, "Nakuru"],
  ["Galaxy S24", "Samsung Galaxy S24 256GB, like new", "A_PLUS", 65000, "Mombasa"], ["Galaxy A54", "Galaxy A54 128GB", "B", 28000, "Kisumu"],
  ["Pixel 8", "Google Pixel 8 128GB, boxed", "A_PLUS", 58000, "Nairobi"], ["Camon 30 Pro", "Tecno Camon 30 Pro 256GB", "B_PLUS", 28500, "Eldoret"],
  ["Note 40", "Infinix Note 40, scratched screen", "C", 17500, "Thika"], ["Redmi Note 13", "Redmi Note 13 128GB", "A", 22000, "Nairobi"],
];
for (const [model, title, conditionGrade, price, location] of listings) {
  const r = await call("/api/listings", { deviceModelId: id(model), title, description: d, conditionGrade, price, currency: "KES", location }, token);
  console.log(r.ok ? "created" : `FAILED ${r.status}`, title);
}
console.log(`Done. Seed admin: ${EMAIL} / ${PASS}  (dev only)`);
