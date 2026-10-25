"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JakartaMap } from "@/components/dashboard/jakarta-map";
import { PetaLegenda } from "@/components/dashboard/peta-legenda";
import { PeringkatWilayah } from "@/components/dashboard/peringkat-wilayah";
import { RingkasanWilayah } from "@/components/dashboard/ringkasan-wilayah";
import { PanelTerkunci } from "@/components/dashboard/panel-terkunci";
import { StatusAkses } from "@/components/dashboard/status-akses";
import { useSesiTiruan } from "@/lib/dashboard/use-sesi";
import { KODE_BARU } from "@/lib/dashboard/pembaruan";
import { hakSesi } from "@/lib/dashboard/auth-tiruan";
import { StatistikUtama } from "@/components/dashboard/statistik-utama";
import { FilterBar } from "@/components/dashboard/filter-bar";
import { AksiLaporan } from "@/components/dashboard/aksi-laporan";
import { SKALA } from "@/lib/dashboard/mock-data";
import { buatSkala } from "@/lib/dashboard/skala-warna";
import {
  FILTER_AWAL,
  ringkasPerWilayah,
  ringkasTotal,
  saring,
  TAHUN_TERSEDIA,
  type FilterState,
} from "@/lib/dashboard/penyaluran";
import { bacaFilterDariQuery, filterKeQuery } from "@/lib/dashboard/ekspor";

/**
 * Bagian utama dashboard: filter, kartu statistik, peta, dan panel kanan.
 *
 * Semua angka dihitung dari buku besar contoh yang sudah difilter, jadi
 * memilih wilayah/program/periode langsung mengubah kartu dan warna peta.
 */
export function DashboardUtama() {
  const BARU = new Set<string>(KODE_BARU);
  const sesi = useSesiTiruan();
  const [filter, setFilter] = useState<FilterState>(FILTER_AWAL);
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [kelasDisorot, setKelasDisorot] = useState<number | null>(null);
  const [hoverPeta, setHoverPeta] = useState<string | null>(null);
  const [hoverDaftar, setHoverDaftar] = useState<string | null>(null);

  const baris = useMemo(() => saring(filter), [filter]);
  const total = useMemo(() => ringkasTotal(baris), [baris]);
  const perWilayah = useMemo(() => ringkasPerWilayah(baris), [baris]);

  // Filter dibaca dari tautan sekali saat halaman dibuka, supaya tautan
  // "Bagikan" benar-benar membuka tampilan yang sama.
  useEffect(() => {
    const dariTautan = bacaFilterDariQuery(
      window.location.search.replace(/^\?/, ""),
    );
    if (dariTautan)
      // eslint-disable-next-line react-hooks/set-state-in-effect -- baca sekali dari URL saat halaman dimuat
      setFilter((sebelumnya) => ({ ...sebelumnya, ...dariTautan }));
  }, []);

  // Simpan filter aktif di bilah alamat tanpa memuat ulang halaman.
  useEffect(() => {
    const query = filterKeQuery(filter);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filter]);

  // Tren dana per tahun (2024 → 2026) mengikuti wilayah & program terpilih,
  // tetapi tidak ikut filter periode supaya konteksnya tetap terlihat.
  const trenDana = useMemo(() => {
    const tahun = [...TAHUN_TERSEDIA].reverse();
    return {
      label: [...tahun],
      nilai: tahun.map(
        (periode) =>
          ringkasTotal(
            saring({
              wilayah: filter.wilayah,
              program: filter.program,
              periode,
            }),
          ).dana,
      ),
    };
  }, [filter.wilayah, filter.program]);

  const kodeAktif = filter.wilayah !== "semua" ? filter.wilayah : dipilih;
  const wilayah = kodeAktif ? (perWilayah.get(kodeAktif) ?? null) : null;

  const peringkat = useMemo(
    () =>
      [...perWilayah.values()]
        .filter((item) => item.dana > 0)
        .sort((a, b) => b.dana - a.dana)
        .slice(0, 5),
    [perWilayah],
  );

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
    setKelasDisorot(null);
  }

  function reset() {
    setFilter(FILTER_AWAL);
    setDipilih(null);
    setKelasDisorot(null);
  }

  return (
    <>
      <StatusAkses sesi={sesi} />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <FilterBar
          className="min-w-0 flex-1"
          nilai={filter}
          onUbah={ubahFilter}
          onReset={reset}
        />
        <AksiLaporan
          filter={filter}
          baris={baris}
          bolehUnduh={hakSesi(sesi).bolehUnduh}
        />
      </div>

      <div className="mt-5">
        <StatistikUtama
          total={total}
          wilayah={wilayah}
          adaFilter={filter.program !== "semua" || filter.periode !== "semua"}
          onBersihkan={() => pilihWilayah(null)}
          trenDana={trenDana}
        />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <Card
          id="peta"
          className="scroll-mt-24 gap-3 overflow-hidden rounded-2xl border-border bg-card/60 py-0"
        >
          <CardHeader className="gap-1 border-b border-border/60 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium tracking-tight">
                {wilayah
                  ? `Kecamatan ${wilayah.nama}`
                  : "Sebaran per kecamatan"}
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              {wilayah
                ? `DKI Jakarta › ${wilayah.kota} › Kecamatan ${wilayah.nama}`
                : total.wilayah === 0
                  ? "Tidak ada data untuk kombinasi filter ini."
                  : `${total.wilayah} kecamatan memiliki penyaluran pada filter ini.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-5">
            {total.wilayah === 0 ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-card/30 p-8 text-center">
                <FilterX
                  className="size-6 text-muted-foreground/60"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium">
                  Tidak ada penyaluran pada kombinasi filter ini
                </p>
                <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                  Coba ganti program atau periode, lalu tampilkan kembali semua
                  data.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 text-xs font-medium transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                >
                  Tampilkan semua data
                </button>
              </div>
            ) : (
              <JakartaMap
                dipilih={kodeAktif}
                onPilih={pilihWilayah}
                nilai={perWilayah}
                skala={skala}
                kelasDisorot={kelasDisorot}
                sorotEksternal={hoverDaftar}
                onHoverWilayah={setHoverPeta}
                peringkat={peringkat.map((item) => item.code)}
                baru={BARU}
                totalDana={total.dana}
                footer={
                  <PetaLegenda
                    kelas={skala.kelas}
                    disorot={kelasDisorot}
                    onSorot={setKelasDisorot}
                  />
                }
              />
            )}
          </CardContent>
        </Card>

        <aside
          id="wilayah"
          aria-label="Ringkasan dan peringkat wilayah"
          className="space-y-4 scroll-mt-24 xl:sticky xl:top-24 xl:self-start"
        >
          {sesi ? (
            <RingkasanWilayah
              data={wilayah}
              onTutup={kodeAktif ? () => pilihWilayah(null) : undefined}
            />
          ) : (
            wilayah &&
            kodeAktif && (
              <PanelTerkunci
                nama={wilayah.nama}
                kota={wilayah.kota}
                onTutup={() => pilihWilayah(null)}
              />
            )
          )}
          <PeringkatWilayah
            data={peringkat}
            aktif={kodeAktif}
            onPilih={pilihWilayah}
            sorot={hoverPeta}
            onHover={setHoverDaftar}
          />
        </aside>
      </div>
    </>
  );
}
