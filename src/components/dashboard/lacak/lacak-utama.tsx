"use client";

import { useMemo, useState } from "react";
import {
  FILTER_LACAK_AWAL,
  kelompokkanPerKecamatan,
  ringkasLacak,
  saringLaporan,
  type FilterLacak,
  type LaporanBantuan,
} from "@/lib/dashboard/lacak";
import { formatRupiah } from "@/lib/dashboard/format";
import { DaftarLaporan } from "@/components/dashboard/lacak/daftar-laporan";
import { LacakPeta } from "@/components/dashboard/lacak/lacak-peta";
import { PanelFilterLacak } from "@/components/dashboard/lacak/panel-filter-lacak";
import { PopupLaporan } from "@/components/dashboard/lacak/popup-laporan";

/** Ruang kerja pelacakan: filter, peta cluster, popup laporan, dan daftar. */
export function LacakUtama() {
  const [filter, setFilter] = useState<FilterLacak>(FILTER_LACAK_AWAL);
  const [kecamatanAktif, setKecamatanAktif] = useState<string | null>(null);
  const [laporanTerpilih, setLaporanTerpilih] = useState<LaporanBantuan | null>(
    null,
  );

  const hasil = useMemo(() => saringLaporan(filter), [filter]);
  const kelompok = useMemo(() => kelompokkanPerKecamatan(hasil), [hasil]);
  const ringkasan = useMemo(() => ringkasLacak(hasil), [hasil]);

  const laporanPopup = laporanTerpilih
    ? [laporanTerpilih]
    : (kelompok.find((item) => item.kode === kecamatanAktif)?.laporan ?? []);

  function pilihKecamatan(kode: string | null) {
    setKecamatanAktif(kode);
    setLaporanTerpilih(null);
  }

  function pilihLaporan(item: LaporanBantuan) {
    setLaporanTerpilih(item);
    setKecamatanAktif(item.kecamatan);
  }

  function tutupPopup() {
    setLaporanTerpilih(null);
    setKecamatanAktif(null);
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Laporan", nilai: ringkasan.jumlah.toLocaleString("id-ID") },
          { label: "Dana tercatat", nilai: formatRupiah(ringkasan.dana) },
          {
            label: "Selesai",
            nilai: ringkasan.selesai.toLocaleString("id-ID"),
          },
          {
            label: "Perlu ditindak",
            nilai: (ringkasan.diproses + ringkasan.menunggu).toLocaleString(
              "id-ID",
            ),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card/60 px-3 py-2"
          >
            <p className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              {item.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">
              {item.nilai}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[15rem_minmax(0,1fr)_19rem]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <PanelFilterLacak
            filter={filter}
            onUbah={(berikutnya) => {
              setFilter(berikutnya);
              tutupPopup();
            }}
            onReset={() => {
              setFilter(FILTER_LACAK_AWAL);
              tutupPopup();
            }}
          />
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2">
            <p className="rounded-full border border-border bg-card/95 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-lg backdrop-blur">
              {ringkasan.jumlah.toLocaleString("id-ID")} laporan ditemukan
            </p>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-border bg-card/40">
            <LacakPeta
              kelompok={kelompok}
              aktif={kecamatanAktif}
              onPilih={pilihKecamatan}
              className="max-h-[36rem]"
            />

            {laporanPopup.length > 0 && (
              <div className="absolute bottom-2 left-2 z-20 hidden w-[20.5rem] md:block">
                <PopupLaporan laporan={laporanPopup} onTutup={tutupPopup} />
              </div>
            )}

            {laporanPopup.length > 0 && (
              <div className="border-t border-border/60 p-2 md:hidden">
                <PopupLaporan laporan={laporanPopup} onTutup={tutupPopup} />
              </div>
            )}
          </div>
        </div>

        <div className="min-h-[20rem] xl:sticky xl:top-24 xl:h-[calc(100vh-9rem)] xl:self-start">
          <DaftarLaporan
            laporan={hasil}
            aktif={laporanTerpilih?.kode ?? null}
            onPilih={pilihLaporan}
          />
        </div>
      </div>
    </div>
  );
}
