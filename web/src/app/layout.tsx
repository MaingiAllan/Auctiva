import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";
import "./globals.css";
import Splash from "@/components/Splash";

export const metadata: Metadata = {
  title: { default: "Auctiva — Community Market Place", template: "%s | Auctiva" },
  description: "Buy, sell and bid on verified smartphones in Kenya. IMEI-checked, inspected, delivered.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#17375E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Splash />
        {children}
      </body>
    </html>
  );
}
