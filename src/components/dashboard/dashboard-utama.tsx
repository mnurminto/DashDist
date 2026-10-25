"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JakartaMap } from "@/components/dashboard/jakarta-map";
import { PetaLegenda } from "@/components/dashboard/peta-legenda";
import { StatistikUtama } from "@/components/dashboard/statistik-utama";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { SKALA } from "@/lib/dashboard/mock-data";
import { buatSkala } from "@/lib/dashboard/skala-warna";
import {
  FILTER_AWAL,
  ringkasPerWilayah,
  ringkasTotal,
  saring,
  type FilterState,
} from "@/lib/dashboard/penyaluran";

/**
 * Bagian utama dashboard: filter, kartu statistik, dan peta.
 *
 * Semua angka dihitung dari buku besar contoh yang sudah difilter, jadi
 * memilih wilayah/program/periode langsung mengubah kartu dan warna peta.
 */
export function DashboardUtama() {
  const [filter, setFilter] = useState<FilterState>(FILTER_AWAL);
  const [dipilih, setDipilih] = useState<string | null>(null);

  const baris = useMemo(() => saring(filter), [filter]);
  const total = useMemo(() => ringkasTotal(baris), [baris]);
  const perWilayah = useMemo(() => ringkasPerWilayah(baris), [baris]);

  const kodeAktif = filter.wilayah !== "semua" ? filter.wilayah : dipilih;
  const wilayah = kodeAktif ? (perWilayah.get(kodeAktif) ?? null) : null;

  // Skala warna mengikuti data yang sedang tampil supaya kontras peta tetap
  // terbaca setelah difilter. Kalau yang tampil hanya sedikit wilayah (mis.
  // filter satu kecamatan), pakai skala penuh agar tetap bisa dibandingkan.
  const skala = useMemo(() => {
    const nilaiTampil = [...perWilayah.values()]
      .map((item) => item.dana)
      .filter((dana) => dana > 0);
    return nilaiTampil.length >= 8 ? buatSkala(nilaiTampil) : SKALA;
  }, [perWilayah]);

  /**
   * Klik wilayah di peta hanya memilih wilayah untuk kartu ringkasan; peta
   * tetap menampilkan seluruh sebaran. Kalau sebelumnya ada filter wilayah
   * dari dropdown, filter itu dilepas supaya wilayah yang diklik terlihat.
   */
  function pilihWilayah(kode: string | null) {
    setDipilih(kode);
    if (kode) {
      setFilter((sebelumnya) =>
        sebelumnya.wilayah === "semua"
          ? sebelumnya
          : { ...sebelumnya, wilayah: "semua" },
      );
    }
  }

  function ubahFilter(berikutnya: FilterState) {
    setFilter(berikutnya);
    setDipilih(null);
  }

  function reset() {
    setFilter(FILTER_AWAL);
    setDipilih(null);
  }

  return (
    <>
      <FilterBar
        className="mt-8"
        nilai={filter}
        onUbah={ubahFilter}
        onReset={reset}
      />

      <div className="mt-5">
        <StatistikUtama
          total={total}
          wilayah={wilayah}
          adaFilter={filter.program !== "semua" || filter.periode !== "semua"}
        />
      </div>

      <Card className="mt-5 gap-4 overflow-hidden py-0">
        <CardHeader className="gap-1 border-b py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              {wilayah ? `Kecamatan ${wilayah.nama}` : "Sebaran per kecamatan"}
            </CardTitle>
            <span className="rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              Data contoh
            </span>
          </div>
          <CardDescription>
            {wilayah
              ? `${wilayah.kota} · klik wilayah lain untuk berganti`
              : total.wilayah === 0
                ? "Tidak ada data untuk kombinasi filter ini."
                : `${total.wilayah} kecamatan memiliki penyaluran pada filter ini.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <JakartaMap
            dipilih={kodeAktif}
            onPilih={pilihWilayah}
            nilai={perWilayah}
            skala={skala}
            footer={<PetaLegenda kelas={skala.kelas} />}
          />
        </CardContent>
      </Card>
    </>
  );
}
