"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartNoAxesCombined,
  Map,
  Settings2,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { TERAKHIR_DIPERBARUI } from "@/lib/dashboard/mock-data";
import { formatWaktu } from "@/lib/dashboard/format";
import { cn } from "cn";

const RAIL = [
  { href: "/", label: "Peta sebaran", ikon: Map },
  { href: "/grafik", label: "Grafik bantuan", ikon: ChartNoAxesCombined },
  { href: "/#filter", label: "Filter", ikon: SlidersHorizontal },
  { href: "/#wilayah", label: "Wilayah", ikon: Users },
] as const;

const NAV = [
  { href: "/#ringkasan", label: "Ringkasan" },
  { href: "/", label: "Peta" },
  { href: "/grafik", label: "Grafik" },
  { href: "/#filter", label: "Filter" },
] as const;

function aktifSaatIni(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href;
}

/** Kerangka halaman dashboard: rail ikon, header, dan area konten. */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <aside
        aria-label="Navigasi utama"
        className="fixed top-0 left-0 z-40 hidden h-full w-16 flex-col items-center border-r border-border/70 bg-card/30 py-5 backdrop-blur lg:flex"
      >
        <Link
          href="/"
          aria-label="Beranda"
          className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          <span className="text-sm font-bold">BB</span>
        </Link>
        <nav className="mt-8 flex flex-1 flex-col items-center gap-1.5">
          {RAIL.map((item) => {
            const Ikon = item.ikon;
            const aktif = aktifSaatIni(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={aktif ? "page" : undefined}
                title={item.label}
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  aktif
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <Ikon className="size-[18px]" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          aria-label="Pengaturan"
          title="Pengaturan"
          className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Settings2 className="size-[18px]" aria-hidden="true" />
        </button>
      </aside>

      <div className="lg:pl-16">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3 sm:px-8">
            <Brand />

            <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
              {NAV.map((item) => {
                const aktif = aktifSaatIni(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={aktif ? "page" : undefined}
                    className={cn(
                      "rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      aktif
                        ? "font-medium text-foreground"
                        : "hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                <span className="relative flex size-1.5" aria-hidden="true">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
                </span>
                Diperbarui {formatWaktu(TERAKHIR_DIPERBARUI)}
              </span>
              <div
                className="hidden size-8 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-semibold text-foreground sm:flex"
                aria-hidden="true"
              >
                BB
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Masuk</Link>
              </Button>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
