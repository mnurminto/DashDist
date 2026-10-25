import type { Metadata } from "next";
import Link from "next/link";
import {
  ChartNoAxesCombined,
  Map,
  Settings2,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { DashboardUtama } from "@/components/dashboard/dashboard-utama";
import { Button } from "@/components/ui/button";
import { TERAKHIR_DIPERBARUI } from "@/lib/dashboard/mock-data";
import { formatWaktu } from "@/lib/dashboard/format";

export const metadata: Metadata = { title: "Peta Sebaran Bantuan" };

const RAIL = [
  { href: "#ringkasan", label: "Ringkasan", ikon: ChartNoAxesCombined },
  { href: "#peta", label: "Peta sebaran", ikon: Map },
  { href: "#filter", label: "Filter", ikon: SlidersHorizontal },
  { href: "#wilayah", label: "Wilayah", ikon: Users },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Rail ikon kiri, seperti referensi */}
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
            return (
              <a
                key={item.href}
                href={item.href}
                aria-label={item.label}
                title={item.label}
                className="flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Ikon className="size-[18px]" aria-hidden="true" />
              </a>
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

            <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
              {["Ringkasan", "Peta", "Filter"].map((label, i) => (
                <a
                  key={label}
                  href={["#ringkasan", "#peta", "#filter"][i]}
                  className="transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-muted-foreground sm:inline">
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
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
                Baznas Bazis · Provinsi DKI Jakarta
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
                Peta sebaran bantuan
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Lihat di kecamatan mana bantuan paling banyak disalurkan. Klik
                satu wilayah untuk membaca ringkasannya.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground">
                Data contoh
              </span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
                46 kecamatan
              </span>
            </div>
          </div>

          <DashboardUtama />

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
            <span>Batas wilayah: BPS via HDX (ODbL)</span>
            <span>Angka masih data contoh, belum tersambung ke database.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
