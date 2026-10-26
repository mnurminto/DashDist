"use client";

import { useEffect, useState } from "react";
import { formatWaktu } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  /** Tanggal ISO kapan data terakhir diperbarui. */
  waktu: string;
  /** Label singkat di depan, mis. "Diperbarui". */
  label?: string;
  className?: string;
};

const SATU_MENIT = 60_000;
const SATU_JAM = 60 * SATU_MENIT;
const SATU_HARI = 24 * SATU_JAM;

function jarak(selisih: number) {
  if (selisih < SATU_MENIT) return "baru saja";
  if (selisih < SATU_JAM) {
    const menit = Math.round(selisih / SATU_MENIT);
    return `${menit} menit lalu`;
  }
  if (selisih < SATU_HARI) {
    const jam = Math.round(selisih / SATU_JAM);
    return `${jam} jam lalu`;
  }
  const hari = Math.round(selisih / SATU_HARI);
  return `${hari} hari lalu`;
}

/**
 * Indikator kesegaran data: titik warna + waktu relatif, dengan waktu lengkap
 * sebagai tooltip. Diperbarui tiap menit tanpa memuat ulang halaman.
 */
export function WaktuPembaruan({
  waktu,
  label = "Diperbarui",
  className,
}: Props) {
  const [sekarang, setSekarang] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setSekarang(Date.now()), SATU_MENIT);
    return () => clearInterval(id);
  }, []);

  const selisih = Math.max(sekarang - new Date(waktu).getTime(), 0);
  const mutakhir = selisih <= SATU_HARI;
  const usang = selisih > 7 * SATU_HARI;

  return (
    <span
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className,
      )}
      title={`${label} ${formatWaktu(waktu)}`}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {mutakhir && (
          <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:animate-none" />
        )}
        <span
          className={cn(
            "relative inline-flex size-1.5 rounded-full",
            usang ? "bg-[#a08d3f]/60" : "bg-primary",
          )}
        />
      </span>
      <span>
        {label ? `${label} ` : null}
        <time
          dateTime={waktu}
          suppressHydrationWarning
          className={cn(usang ? "text-[#8a7a2e]" : "text-foreground")}
        >
          {jarak(selisih)}
        </time>
      </span>
    </span>
  );
}
