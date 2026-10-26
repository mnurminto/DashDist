"use client";

import { useMemo, useState } from "react";
import GEO from "@/lib/dashboard/jakarta-geo.json";
import {
  WARNA_STATUS,
  formatTanggalLacak,
  type KelompokLaporan,
  type StatusLaporan,
} from "@/lib/dashboard/lacak";
import { formatRupiah } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  kelompok: readonly KelompokLaporan[];
  /** Kecamatan yang sedang dibuka popup-nya. */
  aktif: string | null;
  onPilih: (kode: string | null) => void;
  className?: string;
};

const STATUS_URUT: StatusLaporan[] = ["menunggu", "diproses", "selesai"];

function radius(jumlah: number) {
  return Math.min(13 + Math.sqrt(jumlah) * 4.2, 30);
}

/**
 * Peta pelacakan bergaya CRM: batas kecamatan sebagai latar, penanda
 * berwarna per status dengan angka jumlah laporan.
 */
export function LacakPeta({ kelompok, aktif, onPilih, className }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const pusatByKode = useMemo(() => {
    const hasil = new Map<string, { x: number; y: number }>();
    for (const item of GEO.kecamatan) hasil.set(item.code, item.pusat);
    for (const item of GEO.seribu.items) hasil.set(item.code, item.pusat);
    return hasil;
  }, []);

  const aktifData = kelompok.find((item) => item.kode === (hover ?? aktif));

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${GEO.viewBox.width} ${GEO.viewBox.height}`}
        className="h-auto w-full"
        role="group"
        aria-label="Peta pelacakan penerima bantuan"
      >
        <rect
          x={0}
          y={0}
          width={GEO.viewBox.width}
          height={GEO.viewBox.height}
          fill="var(--peta-latar)"
        />

        {/* Batas kecamatan sebagai latar */}
        {GEO.kecamatan.map((wilayah) => (
          <path
            key={wilayah.code}
            d={wilayah.path}
            fill="var(--peta-wilayah)"
            stroke="var(--peta-wilayah-batas)"
            strokeWidth={1}
            className="transition-colors"
          />
        ))}

        {GEO.kotaLabel.map((kota) => (
          <text
            key={kota.nama}
            x={kota.x}
            y={kota.y}
            textAnchor="middle"
            className="pointer-events-none hidden sm:block"
            style={{
              fontSize: 13,
              fontWeight: 600,
              fill: "#8d8c8c",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {kota.nama.replace("Jakarta ", "")}
          </text>
        ))}

        {/* Penanda cluster */}
        {kelompok.map((item) => {
          const pusat = pusatByKode.get(item.kode);
          if (!pusat) return null;
          if (item.kode.startsWith("id3101")) return null;

          const terpilih = aktif === item.kode;
          const disorot = hover === item.kode;
          const r = radius(item.jumlah);
          const warna = WARNA_STATUS[item.statusDominan];

          return (
            <g
              key={item.kode}
              role="button"
              tabIndex={0}
              aria-label={`${item.nama}: ${item.jumlah} laporan, ${formatRupiah(
                item.dana,
              )}`}
              onClick={() => onPilih(terpilih ? null : item.kode)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPilih(terpilih ? null : item.kode);
                }
              }}
              onMouseEnter={() => setHover(item.kode)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(item.kode)}
              onBlur={() => setHover(null)}
              className="cursor-pointer focus-visible:outline-none"
            >
              {(terpilih || disorot) && (
                <circle
                  cx={pusat.x}
                  cy={pusat.y}
                  r={r + 7}
                  fill={warna}
                  opacity={0.18}
                />
              )}
              <circle
                cx={pusat.x}
                cy={pusat.y}
                r={r}
                fill={warna}
                fillOpacity={0.95}
                stroke={terpilih ? "var(--foreground)" : "#ffffff"}
                strokeWidth={terpilih ? 2.5 : 1.5}
              />
              <text
                x={pusat.x}
                y={pusat.y + 4}
                textAnchor="middle"
                fontSize={r > 20 ? 13 : 11}
                fontWeight={700}
                fill="#14140f"
                className="pointer-events-none"
              >
                {item.jumlah}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Inset Kepulauan Seribu */}
      <div className="absolute top-3 right-3 hidden rounded-lg border border-border bg-[var(--seribu-latar)] p-1.5 sm:block">
        <p className="mb-1 text-[9px] tracking-[0.1em] text-muted-foreground uppercase">
          Kep. Seribu
        </p>
        <svg
          viewBox={`0 0 ${GEO.seribu.width} ${GEO.seribu.height}`}
          className="h-auto w-[5.5rem]"
          role="group"
          aria-label="Pelacakan di Kepulauan Seribu"
        >
          {GEO.seribu.items.map((wilayah) => (
            <path
              key={wilayah.code}
              d={wilayah.path}
              fill="var(--seribu-pulau)"
              stroke="var(--seribu-batas)"
              strokeWidth={2}
            />
          ))}
          {GEO.seribu.items.map((wilayah) => {
            const data = kelompok.find((item) => item.kode === wilayah.code);
            if (!data) return null;
            const terpilih = aktif === wilayah.code;
            const warna = WARNA_STATUS[data.statusDominan];
            return (
              <g
                key={`seribu-${wilayah.code}`}
                role="button"
                tabIndex={0}
                aria-label={`${data.nama}: ${data.jumlah} laporan`}
                onClick={() => onPilih(terpilih ? null : wilayah.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPilih(terpilih ? null : wilayah.code);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none"
              >
                <circle
                  cx={wilayah.pusat.x}
                  cy={wilayah.pusat.y}
                  r={16}
                  fill={warna}
                  stroke={terpilih ? "var(--foreground)" : "#ffffff"}
                  strokeWidth={2}
                />
                <text
                  x={wilayah.pusat.x}
                  y={wilayah.pusat.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  fill="#14140f"
                  className="pointer-events-none"
                >
                  {data.jumlah}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tooltip ringkas saat hover */}
      {aktifData && (
        <div className="pointer-events-none absolute top-3 left-3 hidden max-w-[15rem] md:block rounded-lg border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
          <p className="font-medium text-foreground">{aktifData.nama}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {aktifData.jumlah} laporan · {formatRupiah(aktifData.dana)}
          </p>
          {aktifData.laporan[0] && (
            <p className="mt-1 text-[10px] text-muted-foreground">
              Terbaru {formatTanggalLacak(aktifData.laporan[0].tanggal)}
            </p>
          )}
        </div>
      )}

      {/* Legenda status */}
      <div className="absolute right-3 bottom-3 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card/90 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur">
        {STATUS_URUT.map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: WARNA_STATUS[status] }}
              aria-hidden="true"
            />
            {status === "selesai"
              ? "Selesai"
              : status === "diproses"
                ? "Diproses"
                : "Menunggu"}
          </span>
        ))}
      </div>
    </div>
  );
}
