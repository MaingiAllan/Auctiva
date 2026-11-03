import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/montserrat";
import "./globals.css";
import Splash from "@/components/Splash";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: { default: "Auctiva — Community Market Place", template: "%s | Auctiva" },
  description: "Buy, sell and bid on verified smartphones in Kenya. IMEI-checked, inspected, delivered.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#17375E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              const preference = localStorage.getItem("auctiva-theme");
              const dark = preference === "dark" || (preference !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
              document.documentElement.classList.toggle("dark", dark);
              document.documentElement.style.colorScheme = dark ? "dark" : "light";
            } catch (error) {
              console.error("Could not initialize the saved theme preference.", error);
            }`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Splash />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
