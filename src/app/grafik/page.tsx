import type { Metadata } from "next";
import { ChartSpline } from "lucide-react";
import { GrafikTren } from "@/components/dashboard/grafik-tren";
import { KartuGrafik } from "@/components/dashboard/kartu-grafik";
import { Shell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Grafik Jumlah Bantuan" };

/** Ruang grafik sementara; diisi oleh komponen grafik pada langkah berikutnya. */
function SlotGrafik({ tinggi = "h-72" }: { tinggi?: string }) {
  return (
    <div
      className={`flex ${tinggi} items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40`}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <ChartSpline
          className="size-5 text-muted-foreground/50"
          aria-hidden="true"
        />
        <p className="text-[11px] text-muted-foreground">Menyiapkan grafik…</p>
      </div>
    </div>
  );
}

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

        <KartuGrafik
          judul="Perbandingan wilayah"
          keterangan="Kecamatan dengan penyaluran terbesar."
        >
          <SlotGrafik tinggi="h-80" />
        </KartuGrafik>

        <KartuGrafik
          judul="Distribusi per program"
          keterangan="Porsi dana untuk setiap jenis program bantuan."
          className="xl:col-span-3"
        >
          <SlotGrafik tinggi="h-64" />
        </KartuGrafik>
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <span>Batas wilayah: BPS via HDX (ODbL)</span>
        <span>Angka masih data contoh, belum tersambung ke database.</span>
      </footer>
    </Shell>
  );
}
