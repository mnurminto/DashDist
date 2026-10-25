import type { Metadata } from "next";
import { DashboardUtama } from "@/components/dashboard/dashboard-utama";
import { Shell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Peta Sebaran Bantuan" };

export default function DashboardPage() {
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Baznas Bazis · Provinsi DKI Jakarta
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
            Peta sebaran bantuan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Lihat di kecamatan mana bantuan paling banyak disalurkan. Klik satu
            wilayah untuk membaca ringkasannya.
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
    </Shell>
  );
}
