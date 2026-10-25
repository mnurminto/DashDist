"use client";

import { useMemo } from "react";
import { GrafikBatang } from "@/components/dashboard/grafik-batang";
import { KartuGrafik } from "@/components/dashboard/kartu-grafik";
import { PROGRAM } from "@/lib/dashboard/mock-data";
import { saring } from "@/lib/dashboard/penyaluran";

/** Porsi dana tiap program bantuan terhadap total penyaluran. */
export function GrafikProgram() {
  const data = useMemo(() => {
    const baris = saring({
      wilayah: "semua",
      program: "semua",
      periode: "semua",
    });
    const danaPerProgram = new Map<string, number>();

    for (const item of baris) {
      danaPerProgram.set(
        item.program,
        (danaPerProgram.get(item.program) ?? 0) + item.dana,
      );
    }

    const total = [...danaPerProgram.values()].reduce(
      (jumlah, nilai) => jumlah + nilai,
      0,
    );

    return PROGRAM.map((program) => {
      const nilai = danaPerProgram.get(program.id) ?? 0;
      const share = total > 0 ? (nilai / total) * 100 : 0;
      return {
        label: program.nama,
        nilai,
        keterangan: `${share.toLocaleString("id-ID", {
          maximumFractionDigits: 1,
        })}% dari total`,
      };
    })
      .filter((item) => item.nilai > 0)
      .sort((a, b) => b.nilai - a.nilai);
  }, []);

  return (
    <KartuGrafik
      judul="Distribusi per program"
      keterangan="Porsi dana untuk setiap jenis program bantuan."
      className="xl:col-span-3"
    >
      <GrafikBatang data={data} bernomor={false} />
    </KartuGrafik>
  );
}
