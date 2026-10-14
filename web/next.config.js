// Browsers call /api/* on the SAME origin and Next proxies it to the backend: no CORS and no preflight round-trip.
const BACKEND = process.env.BACKEND_URL || "http://localhost:8080";
module.exports = {
  reactStrictMode: true, poweredByHeader: false, compress: true,
  async rewrites() { return [{ source: "/api/:path*", destination: `${BACKEND}/api/:path*` }]; },
};
