"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "cn";
import { GEO, KECAMATAN, SKALA } from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";
import { TINGKAT_WARNA } from "@/lib/dashboard/skala-warna";
import { RingkasanWilayah } from "@/components/dashboard/ringkasan-wilayah";

type Sorot = { kode: string; x: number; y: number };

type Props = {
  className?: string;
};

export function JakartaMap({ className }: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const [sorot, setSorot] = useState<Sorot | null>(null);
  const [dipilih, setDipilih] = useState<string | null>(null);

  const dataByCode = useMemo(
    () => new Map(KECAMATAN.map((kecamatan) => [kecamatan.code, kecamatan])),
    [],
  );

  const sedangAktif = sorot?.kode ?? dipilih;
  const info = sorot ? dataByCode.get(sorot.kode) : null;
  const wilayahDipilih = dipilih ? (dataByCode.get(dipilih) ?? null) : null;

  function pilih(kode: string) {
    setDipilih((current) => (current === kode ? null : kode));
  }

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
    opsi?: {
      stroke?: string;
      tingkatMinimum?: number;
      pusat?: { x: number; y: number };
    },
  ) {
    const data = dataByCode.get(kode);
    if (!data) return null;
    const disorot = sedangAktif === kode;
    const label = `${data.nama}, ${data.kota}: ${formatRupiah(data.dana)} untuk ${formatAngka(data.penerima)} penerima`;
    const tingkat = Math.max(
      SKALA.tingkat(data.dana),
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
        className="cursor-pointer transition-[stroke,stroke-width] duration-150 outline-none"
        tabIndex={0}
        role="button"
        aria-pressed={dipilih === kode}
        aria-label={`${label}. Klik untuk melihat ringkasan.`}
        onClick={() => pilih(kode)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pilih(kode);
          }
        }}
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
    <div
      className={cn(
        "grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start",
        className,
      )}
    >
      <div ref={wadah} className="relative">
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

      <div className="md:sticky md:top-4">
        <RingkasanWilayah
          data={wilayahDipilih}
          onTutup={dipilih ? () => setDipilih(null) : undefined}
        />
      </div>
    </div>
  );
}
