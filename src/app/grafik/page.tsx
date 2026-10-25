import type { Metadata } from "next";
import { GrafikProgram } from "@/components/dashboard/grafik-program";
import { GrafikTren } from "@/components/dashboard/grafik-tren";
import { GrafikWilayah } from "@/components/dashboard/grafik-wilayah";
import { Shell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Grafik Jumlah Bantuan" };

export default function GrafikPage() {
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Analisis penyaluran
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
            Grafik jumlah bantuan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Tren bulanan, perbandingan antar wilayah, dan distribusi per program
            dalam satu halaman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground">
            Data contoh
          </span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            2024–2026
          </span>
        </div>
      </div>

      <section
        aria-label="Grafik jumlah bantuan"
        className="mt-7 grid gap-4 xl:grid-cols-3"
      >
        <GrafikTren />
        <GrafikWilayah />
        <GrafikProgram />
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <span>Batas wilayah: BPS via HDX (ODbL)</span>
        <span>Angka masih data contoh, belum tersambung ke database.</span>
      </footer>
    </Shell>
  );
}
