import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

/**
 * Terapkan tema tersimpan sebelum halaman dilukis, supaya tidak ada kedipan
 * terang saat pengguna memilih mode gelap.
 */
const SKRIP_TEMA = `(function(){try{var t=localStorage.getItem("baznas.tema");if(t==="gelap"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark";}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SKRIP_TEMA }} />
      </head>
      <body>
        <Providers>
          <a
            href="#main-content"
            className="sr-only z-50 rounded-md bg-foreground p-3 text-background focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          >
            Skip to content
          </a>
          {children}
        </Providers>
      </body>
    </html>
  );
}
