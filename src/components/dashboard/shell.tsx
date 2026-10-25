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
import { WaktuPembaruan } from "@/components/dashboard/waktu-pembaruan";
import { NotifikasiPembaruan } from "@/components/dashboard/notifikasi-pembaruan";
import { useSesiTiruan } from "@/lib/dashboard/use-sesi";
import { cn } from "cn";

const RAIL = [
  { href: "/", label: "Peta sebaran", ikon: Map },
  { href: "/grafik", label: "Grafik bantuan", ikon: ChartNoAxesCombined },
  { href: "/#filter", label: "Filter", ikon: SlidersHorizontal },
  { href: "/#wilayah", label: "Wilayah", ikon: Users },
] as const;

const RAIL_STAF = [
  { href: "/pengguna", label: "Daftar pengguna", ikon: Users },
] as const;

const NAV = [
  { href: "/#ringkasan", label: "Ringkasan" },
  { href: "/", label: "Peta" },
  { href: "/grafik", label: "Grafik" },
  { href: "/#filter", label: "Filter" },
] as const;

const NAV_STAF = [{ href: "/pengguna", label: "Pengguna" }] as const;

function aktifSaatIni(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href;
}

/** Kerangka halaman dashboard: rail ikon, header, dan area konten. */
export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sesi = useSesiTiruan();
  const rail = sesi?.peran === "staf" ? [...RAIL, ...RAIL_STAF] : RAIL;
  const nav = sesi?.peran === "staf" ? [...NAV, ...NAV_STAF] : NAV;

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
          {rail.map((item) => {
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
              {nav.map((item) => {
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
              <WaktuPembaruan
                waktu={TERAKHIR_DIPERBARUI}
                className="hidden sm:flex"
              />
              <NotifikasiPembaruan />
              <div
                className="hidden size-8 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-semibold text-foreground sm:flex"
                aria-hidden="true"
              >
                BB
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/masuk">Masuk</Link>
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
