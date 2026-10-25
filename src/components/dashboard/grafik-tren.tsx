"use client";

import { useState } from "react";
import { ChartSpline } from "lucide-react";
import { KartuGrafik } from "@/components/dashboard/kartu-grafik";
import { PemilihTampilan } from "@/components/dashboard/pemilih-tampilan";

const RENTANG = [
  { nilai: "bulanan", label: "Bulanan" },
  { nilai: "tahunan", label: "Tahunan" },
] as const;

type Rentang = (typeof RENTANG)[number]["nilai"];

/**
 * Kartu tren penyaluran. Pemilih tampilan menentukan apakah grafik dihitung
 * per bulan atau per tahun.
 */
export function GrafikTren() {
  const [rentang, setRentang] = useState<Rentang>("bulanan");

  return (
    <KartuGrafik
      judul="Tren penyaluran"
      keterangan={
        rentang === "bulanan"
          ? "Total dana yang disalurkan setiap bulan."
          : "Total dana per tahun, untuk melihat arah jangka panjang."
      }
      aksi={
        <PemilihTampilan
          label="Rentang grafik"
          opsi={RENTANG}
          nilai={rentang}
          onUbah={setRentang}
        />
      }
      className="xl:col-span-2"
    >
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40">
        <div className="flex flex-col items-center gap-2 text-center">
          <ChartSpline
            className="size-5 text-muted-foreground/50"
            aria-hidden="true"
          />
          <p className="text-[11px] text-muted-foreground">
            Menyiapkan grafik {rentang}…
          </p>
        </div>
      </div>
    </KartuGrafik>
  );
}
