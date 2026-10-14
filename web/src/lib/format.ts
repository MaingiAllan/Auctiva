export const kes = (n: number, currency = "KES") => new Intl.NumberFormat("en-KE", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
