"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { GEO, KECAMATAN } from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

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

/** Batas kelas (persentil) untuk menentukan tingkat warna. */
const BATAS_PERSENTIL = [0.18, 0.36, 0.56, 0.76, 0.9] as const;

type Sorot = { kode: string; x: number; y: number };

type Props = {
  /** Kode kecamatan yang sedang dilihat (opsional, dari halaman induk). */
  aktif?: string | null;
  className?: string;
};

export function JakartaMap({ aktif, className }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const [sorot, setSorot] = useState<Sorot | null>(null);

  const { dataByCode, tingkatDana } = useMemo(() => {
    const map = new Map(
      KECAMATAN.map((kecamatan) => [kecamatan.code, kecamatan]),
    );
    const urut = KECAMATAN.map((kecamatan) => kecamatan.dana).sort(
      (a, b) => a - b,
    );
    const batas = BATAS_PERSENTIL.map(
      (persen) => urut[Math.min(Math.floor(persen * urut.length), urut.length - 1)],
    );
    const tingkat = (dana: number) => {
      let hasil = 0;
      batas.forEach((nilai, i) => {
        if (dana >= nilai) hasil = i + 1;
      });
      return Math.min(hasil, TINGKAT_WARNA.length - 1);
    };
    return { dataByCode: map, tingkatDana: tingkat };
  }, []);

  const sedangAktif = sorot?.kode ?? aktif ?? null;
  const info = sorot ? dataByCode.get(sorot.kode) : null;

  function posisiTooltip(e: React.MouseEvent<SVGPathElement>): {
    x: number;
    y: number;
  } {
    const rect = wadah.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function renderWilayah(
    kode: string,
    path: string,
    opsi?: { stroke?: string; tingkatMinimum?: number; pusat?: { x: number; y: number } },
  ) {
    const data = dataByCode.get(kode);
    if (!data) return null;
    const disorot = sedangAktif === kode;
    const label = `${data.nama}, ${data.kota}: ${formatRupiah(data.dana)} untuk ${formatAngka(data.penerima)} penerima`;
    const tingkat = Math.max(tingkatDana(data.dana), opsi?.tingkatMinimum ?? 0);

    return (
      <path
        key={kode}
        d={path}
        fill={TINGKAT_WARNA[tingkat]}
        stroke={disorot ? "#191919" : (opsi?.stroke ?? "#ffffff")}
        strokeWidth={disorot ? 2.4 : 1}
        strokeLinejoin="round"
        className="cursor-pointer transition-[stroke,stroke-width] duration-150 outline-none"
        tabIndex={0}
        role="img"
        aria-label={label}
        onMouseMove={(e) => setSorot({ kode, ...posisiTooltip(e) })}
        onMouseLeave={() =>
          setSorot((current) => (current?.kode === kode ? null : current))
        }
        onFocus={() => {
          // Untuk pengguna keyboard: tampilkan kartu di titik tengah wilayah.
          const rect = wadah.current?.getBoundingClientRect();
          const skala = rect ? rect.width / GEO.viewBox.width : 0;
          const pusat = opsi?.pusat;
          setSorot(
            pusat && rect
              ? { kode, x: pusat.x * skala, y: pusat.y * skala }
              : { kode, x: 0, y: 0 },
          );
        }}
        onBlur={() =>
          setSorot((current) => (current?.kode === kode ? null : current))
        }
      >
        <title>{label}</title>
      </path>
    );
  }

  return (
    <div ref={wadah} className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${GEO.viewBox.width} ${GEO.viewBox.height}`}
        className="mx-auto block h-auto w-full max-w-[720px]"
        role="group"
        aria-label="Peta sebaran bantuan per kecamatan di DKI Jakarta"
        onMouseLeave={() => setSorot(null)}
      >
        {GEO.kecamatan.map((wilayah) =>
          renderWilayah(wilayah.code, wilayah.path, { pusat: wilayah.pusat }),
        )}

        {GEO.kotaLabel.map((kota) => (
          <text
            key={kota.nama}
            x={kota.x}
            y={kota.y}
            textAnchor="middle"
            className="pointer-events-none hidden sm:block"
            style={{
              fontSize: 15,
              fontWeight: 600,
              fill: "#4a423c",
              paintOrder: "stroke",
              stroke: "#ffffff",
              strokeWidth: 4,
              strokeLinejoin: "round",
              letterSpacing: "0.02em",
            }}
          >
            {kota.nama.replace("Jakarta ", "")}
          </text>
        ))}
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
                pusat: wilayah.pusat,
              }),
            )}
          </svg>
        </div>
      </div>

      {info && sorot && (
        <div
          className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+16px)] rounded-lg border bg-card px-3 py-2 text-xs shadow-md"
          style={{ left: sorot.x, top: sorot.y }}
          aria-hidden="true"
        >
          <p className="font-semibold text-card-foreground">{info.nama}</p>
          <p className="text-muted-foreground">{info.kota}</p>
          <dl className="mt-1.5 space-y-0.5">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Dana</dt>
              <dd className="font-medium text-card-foreground">
                {formatRupiah(info.dana)}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Penerima</dt>
              <dd className="font-medium text-card-foreground">
                {formatAngka(info.penerima)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
