"use client";

import { useMemo, useState } from "react";
import { GrafikGaris } from "@/components/dashboard/grafik-garis";
import { KartuGrafik } from "@/components/dashboard/kartu-grafik";
import { PemilihTampilan } from "@/components/dashboard/pemilih-tampilan";
import { formatRupiah } from "@/lib/dashboard/format";
import {
  ringkasBulanan,
  ringkasTahunan,
  saring,
} from "@/lib/dashboard/penyaluran";

const RENTANG = [
  { nilai: "bulanan", label: "Bulanan" },
  { nilai: "tahunan", label: "Tahunan" },
] as const;

type Rentang = (typeof RENTANG)[number]["nilai"];

/**
 * Kartu tren penyaluran. Pemilih tampilan menentukan apakah grafik dihitung
 * per bulan (seluruh periode) atau per tahun.
 */
export function GrafikTren() {
  const [rentang, setRentang] = useState<Rentang>("bulanan");

  const baris = useMemo(
    () => saring({ wilayah: "semua", program: "semua", periode: "semua" }),
    [],
  );

  const data = useMemo(() => {
    const titik =
      rentang === "bulanan" ? ringkasBulanan(baris) : ringkasTahunan(baris);
    return titik.map((item) => ({ label: item.label, nilai: item.dana }));
  }, [baris, rentang]);

  const total = data.reduce((jumlah, titik) => jumlah + titik.nilai, 0);

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
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
        <p className="text-xl font-semibold tracking-tight tabular-nums">
          {formatRupiah(total)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          total {rentang === "bulanan" ? "seluruh bulan" : "seluruh tahun"}
        </p>
      </div>
      <GrafikGaris
        data={data}
        ringkasan={`Tren dana ${rentang} dari ${data[0]?.label ?? "-"} sampai ${data[data.length - 1]?.label ?? "-"}.`}
      />
    </KartuGrafik>
  );
}
