"use client";

import { useMemo, useState } from "react";
import { cn } from "cn";
import { GEO, KECAMATAN } from "@/lib/dashboard/mock-data";
import { formatRupiah } from "@/lib/dashboard/format";

/**
 * Enam tingkat warna: makin gelap, makin besar dana yang tersalurkan.
 * Skala dibuat dari warna utama template supaya tetap satu keluarga.
 */
const TINGKAT_WARNA = [
  "#fbeee9",
  "#f6d5c8",
  "#eeb49e",
  "#e08a6c",
  "#c25f42",
  "#8d3a26",
] as const;

type Props = {
  /** Kode kecamatan yang sedang dilihat (opsional). */
  aktif?: string | null;
  className?: string;
};

function hitungTingkat(nilai: number[], batas: number[]): (dana: number) => number {
  return (dana: number) => {
    let tingkat = 0;
    for (let i = 0; i < batas.length; i += 1) {
      if (dana >= batas[i]) tingkat = i + 1;
    }
    return Math.min(tingkat, TINGKAT_WARNA.length - 1);
  };
}

export function JakartaMap({ aktif, className }: Props) {
  const [sorot, setSorot] = useState<string | null>(null);

  const { dataByCode, tingkatDana } = useMemo(() => {
    const map = new Map(KECAMATAN.map((kecamatan) => [kecamatan.code, kecamatan]));
    const semuaDana = KECAMATAN.map((kecamatan) => kecamatan.dana).sort(
      (a, b) => a - b,
    );
    const batas = [0.18, 0.36, 0.56, 0.76, 0.9].map(
      (persen) => semuaDana[Math.floor(persen * semuaDana.length)],
    );
    return { dataByCode: map, tingkatDana: hitungTingkat(semuaDana, batas) };
  }, []);

  const sedangAktif = aktif ?? sorot;

  function renderWilayah(
    kode: string,
    path: string,
    opsi?: { stroke?: string; tingkatMinimum?: number },
  ) {
    const data = dataByCode.get(kode);
    if (!data) return null;
    const disorot = sedangAktif === kode;
    const label = `${data.nama}, ${data.kota}: ${formatRupiah(data.dana)} untuk ${data.penerima.toLocaleString("id-ID")} penerima`;
    const tingkat = Math.max(
      tingkatDana(data.dana),
      opsi?.tingkatMinimum ?? 0,
    );

    return (
      <path
        key={kode}
        d={path}
        fill={TINGKAT_WARNA[tingkat]}
        stroke={disorot ? "#191919" : (opsi?.stroke ?? "#ffffff")}
        strokeWidth={disorot ? 2.4 : 1}
        strokeLinejoin="round"
        className={cn(
          "cursor-pointer transition-[stroke,stroke-width] duration-150 outline-none",
          disorot && "drop-shadow-sm",
        )}
        tabIndex={0}
        role="img"
        aria-label={label}
        onMouseEnter={() => setSorot(kode)}
        onMouseLeave={() => setSorot((current) => (current === kode ? null : current))}
        onFocus={() => setSorot(kode)}
        onBlur={() => setSorot((current) => (current === kode ? null : current))}
      >
        <title>{label}</title>
      </path>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${GEO.viewBox.width} ${GEO.viewBox.height}`}
        className="mx-auto block h-auto w-full max-w-[720px]"
        role="group"
        aria-label="Peta sebaran bantuan per kecamatan di DKI Jakarta"
      >
        {GEO.kecamatan.map((wilayah) =>
          renderWilayah(wilayah.code, wilayah.path),
        )}
      </svg>

      <div className="mt-2 flex justify-start sm:absolute sm:top-0 sm:left-0 sm:mt-0">
        <div className="w-28 rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur sm:w-36">
          <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Kepulauan Seribu
          </p>
          <svg
            viewBox={`0 0 ${GEO.seribu.width} ${GEO.seribu.height}`}
            className="block h-auto w-full"
            role="group"
            aria-label="Peta sebaran bantuan di Kepulauan Seribu"
          >
            {GEO.seribu.items.map((wilayah) =>
              renderWilayah(wilayah.code, wilayah.path, {
                stroke: "#c9c3bb",
                tingkatMinimum: 2,
              }),
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
