"use client";

import { useMemo, useState } from "react";
import { formatRupiah, formatRupiahRingkas } from "@/lib/dashboard/format";

type Titik = { label: string; nilai: number };

type Props = {
  data: readonly Titik[];
  /** Tinggi area grafik dalam piksel (viewBox). */
  tinggi?: number;
  /** Format nilai untuk tooltip. */
  format?: (nilai: number) => string;
  /** Label ringkas untuk pembaca layar. */
  ringkasan?: string;
};

const LEBAR = 760;
const PAD = { kiri: 64, kanan: 16, atas: 16, bawah: 34 };

/**
 * Grafik garis sederhana dengan area, grid, dan tooltip saat kursor digerakkan.
 * Sengaja dibuat SVG biasa: ringan, tajam di layar besar, dan tanpa dependensi baru.
 */
export function GrafikGaris({
  data,
  tinggi = 300,
  format = formatRupiah,
  ringkasan,
}: Props) {
  const [aktif, setAktif] = useState<number | null>(null);

  const lebarPlot = LEBAR - PAD.kiri - PAD.kanan;
  const tinggiPlot = tinggi - PAD.atas - PAD.bawah;

  const maks = useMemo(
    () => Math.max(...data.map((titik) => titik.nilai), 1),
    [data],
  );

  const posisiX = (indeks: number) =>
    PAD.kiri +
    (data.length > 1
      ? (indeks * lebarPlot) / (data.length - 1)
      : lebarPlot / 2);
  const posisiY = (nilai: number) => PAD.atas + (1 - nilai / maks) * tinggiPlot;

  const garis = data
    .map(
      (titik, i) =>
        `${i === 0 ? "M" : "L"}${posisiX(i).toFixed(1)} ${posisiY(titik.nilai).toFixed(1)}`,
    )
    .join(" ");

  const area = data.length
    ? `${garis} L${posisiX(data.length - 1).toFixed(1)} ${(PAD.atas + tinggiPlot).toFixed(1)} L${PAD.kiri} ${(PAD.atas + tinggiPlot).toFixed(1)} Z`
    : "";

  const langkahLabel = Math.max(1, Math.ceil(data.length / 8));
  const garisGrid = [0, 0.25, 0.5, 0.75, 1];

  function saatGerak(e: React.MouseEvent<SVGSVGElement>) {
    if (data.length === 0) return;
    const kotak = e.currentTarget.getBoundingClientRect();
    const rasio = ((e.clientX - kotak.left) / kotak.width) * LEBAR;
    const indeks = Math.round(
      ((rasio - PAD.kiri) / Math.max(lebarPlot, 1)) * (data.length - 1),
    );
    setAktif(Math.min(Math.max(indeks, 0), data.length - 1));
  }

  const titikAktif = aktif !== null ? data[aktif] : null;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${LEBAR} ${tinggi}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label={
          ringkasan ??
          `Grafik garis dengan ${data.length} titik, nilai tertinggi ${format(maks)}.`
        }
        onMouseMove={saatGerak}
        onMouseLeave={() => setAktif(null)}
      >
        <defs>
          <linearGradient id="garis-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c3b064" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c3b064" stopOpacity="0" />
          </linearGradient>
        </defs>

        {garisGrid.map((rasio) => {
          const y = PAD.atas + rasio * tinggiPlot;
          return (
            <g key={rasio}>
              <line
                x1={PAD.kiri}
                x2={LEBAR - PAD.kanan}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.07)"
                strokeWidth={1}
              />
              <text
                x={PAD.kiri - 10}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="#8d8c8c"
              >
                {formatRupiahRingkas(maks * (1 - rasio))}
              </text>
            </g>
          );
        })}

        {area && <path d={area} fill="url(#garis-area)" />}
        {garis && (
          <path
            d={garis}
            fill="none"
            stroke="#d9c77c"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {data.map((titik, i) => (
          <g key={`${titik.label}-${i}`}>
            {(data.length <= 12 ||
              i === 0 ||
              i === data.length - 1 ||
              i === aktif) && (
              <circle
                cx={posisiX(i)}
                cy={posisiY(titik.nilai)}
                r={aktif === i ? 4 : 2.5}
                fill="#e9dfae"
                stroke="#101010"
                strokeWidth={1.5}
              />
            )}
            {i % langkahLabel === 0 && (
              <text
                x={posisiX(i)}
                y={tinggi - 12}
                textAnchor={
                  i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"
                }
                fontSize={10}
                fill="#8d8c8c"
              >
                {titik.label}
              </text>
            )}
          </g>
        ))}

        {aktif !== null && (
          <line
            x1={posisiX(aktif)}
            x2={posisiX(aktif)}
            y1={PAD.atas}
            y2={PAD.atas + tinggiPlot}
            stroke="rgba(233,223,174,0.4)"
            strokeDasharray="4 4"
          />
        )}
      </svg>

      {titikAktif && aktif !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-card/95 px-2.5 py-1.5 text-[11px] shadow-xl backdrop-blur"
          style={{
            left: `${(posisiX(aktif) / LEBAR) * 100}%`,
            top: `${(posisiY(titikAktif.nilai) / tinggi) * 100}%`,
          }}
        >
          <p className="text-muted-foreground">{titikAktif.label}</p>
          <p className="font-medium text-foreground tabular-nums">
            {format(titikAktif.nilai)}
          </p>
        </div>
      )}

      <ul className="sr-only">
        {data.map((titik) => (
          <li key={`sr-${titik.label}`}>
            {titik.label}: {format(titik.nilai)}
          </li>
        ))}
      </ul>
    </div>
  );
}
