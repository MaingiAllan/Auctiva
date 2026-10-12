// Placeholder data until pages are wired to GET /api/listings.
export type Product = { id: string; title: string; brand: string; price: number; grade: string; condition: string; storage: string; location: string; verified: boolean; img: string; rating: number; reviews: number; seller: string; battery: number; description: string };
const d = "Fully tested, IMEI-checked and graded by a partner technician. Includes charger. Inspection welcome before purchase.";
const base: Omit<Product, "id">[] = [
  { title: "iPhone 14 Pro 256GB", brand: "Apple", price: 118000, grade: "A", condition: "Used", storage: "256GB", location: "Nairobi", verified: true, img: "#17375E", rating: 4.8, reviews: 32, seller: "Mobi Hub", battery: 91, description: d },
  { title: "Samsung Galaxy S24 256GB", brand: "Samsung", price: 65000, grade: "A", condition: "Used", storage: "256GB", location: "Mombasa", verified: true, img: "#0E7C86", rating: 4.7, reviews: 18, seller: "Coast Phones", battery: 94, description: d },
  { title: "Tecno Camon 30 Pro", brand: "Tecno", price: 28500, grade: "B+", condition: "Used", storage: "256GB", location: "Kisumu", verified: false, img: "#22A9A9", rating: 4.2, reviews: 9, seller: "Lakeside Tech", battery: 88, description: d },
  { title: "iPhone 12 128GB", brand: "Apple", price: 42000, grade: "B", condition: "Refurbished", storage: "128GB", location: "Nakuru", verified: true, img: "#0F2744", rating: 4.5, reviews: 41, seller: "Rift Refurb", battery: 85, description: d },
  { title: "Google Pixel 8", brand: "Google", price: 58000, grade: "A+", condition: "New", storage: "128GB", location: "Nairobi", verified: true, img: "#0E7C86", rating: 4.9, reviews: 12, seller: "Mobi Hub", battery: 100, description: d },
  { title: "Infinix Note 40", brand: "Infinix", price: 21000, grade: "B", condition: "Used", storage: "128GB", location: "Eldoret", verified: false, img: "#17375E", rating: 4.1, reviews: 6, seller: "North Rift Mobiles", battery: 82, description: d },
];
export const products: Product[] = [...base, ...base.map((p) => ({ ...p, title: p.title + " · Black", price: Math.round((p.price * 0.92) / 500) * 500, location: "Nairobi" }))].map((p, i) => ({ ...p, id: String(i + 1) }));
