"use client";

import { useMemo } from "react";
import { GrafikBatang } from "@/components/dashboard/grafik-batang";
import { KartuGrafik } from "@/components/dashboard/kartu-grafik";
import { ringkasPerWilayah, saring } from "@/lib/dashboard/penyaluran";

/** Perbandingan dana antar kecamatan (enam teratas). */
export function GrafikWilayah() {
  const data = useMemo(() => {
    const baris = saring({
      wilayah: "semua",
      program: "semua",
      periode: "semua",
    });
    return [...ringkasPerWilayah(baris).values()]
      .sort((a, b) => b.dana - a.dana)
      .slice(0, 6)
      .map((wilayah) => ({
        label: wilayah.nama,
        nilai: wilayah.dana,
        keterangan: wilayah.kota,
      }));
  }, []);

  return (
    <KartuGrafik
      judul="Perbandingan wilayah"
      keterangan="Enam kecamatan dengan penyaluran terbesar."
    >
      <GrafikBatang data={data} />
    </KartuGrafik>
  );
}
