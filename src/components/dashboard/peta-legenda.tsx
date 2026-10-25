"use client";

import type { KelasWarna } from "@/lib/dashboard/skala-warna";
import { formatRupiahRingkas } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  /** Kelas warna dari skala yang dipakai peta saat ini. */
  kelas: readonly KelasWarna[];
  /** Indeks kelas yang sedang disorot (dari legenda). */
  disorot?: number | null;
  /** Dipanggil saat pengguna menyorot salah satu kelas warna. */
  onSorot?: (indeks: number | null) => void;
};

function labelKelas(kelas: readonly KelasWarna[], i: number): string {
  const item = kelas[i];
  const pertama = kelas[0];

  if (item === pertama) {
    return item.sampai !== null
      ? `< ${formatRupiahRingkas(item.sampai)}`
      : formatRupiahRingkas(item.dari);
  }
  if (item.sampai === null) {
    return `≥ ${formatRupiahRingkas(item.dari)}`;
  }
  return `${formatRupiahRingkas(item.dari)} – ${formatRupiahRingkas(item.sampai)}`;
}

/**
 * Legenda warna peta. Tiap kotak bisa disorot (hover/fokus) untuk menyaring
 * pandangan ke wilayah dengan tingkat dana tertentu.
 */
export function PetaLegenda({ kelas: daftarKelas, disorot, onSorot }: Props) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border/60 pt-4">
      <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Dana tersalurkan
      </span>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {labelKelas(daftarKelas, 0)}
        </span>

        <ul className="flex items-center gap-1">
          {daftarKelas.map((item, i) => {
            const aktif = disorot === i;
            return (
              <li key={item.warna}>
                <button
                  type="button"
                  onMouseEnter={() => onSorot?.(i)}
                  onMouseLeave={() => onSorot?.(null)}
                  onFocus={() => onSorot?.(i)}
                  onBlur={() => onSorot?.(null)}
                  onClick={() => onSorot?.(aktif ? null : i)}
                  aria-label={`Sorot wilayah dengan dana ${labelKelas(daftarKelas, i)}`}
                  aria-pressed={aktif}
                  className={cn(
                    "block h-4 w-9 rounded-[4px] border transition-all duration-150 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none sm:w-11",
                    aktif
                      ? "-translate-y-0.5 border-white/70 shadow-[0_0_10px_rgba(195,176,100,0.45)]"
                      : "border-white/10 hover:-translate-y-0.5 hover:border-white/40",
                  )}
                  style={{ backgroundColor: item.warna }}
                />
              </li>
            );
          })}
        </ul>

        <span className="text-[11px] text-muted-foreground tabular-nums">
          {formatRupiahRingkas(daftarKelas[daftarKelas.length - 1]?.dari ?? 0)}+
        </span>
      </div>

      <ul className="sr-only">
        {daftarKelas.map((kelas, i) => (
          <li key={kelas.warna}>{labelKelas(daftarKelas, i)}</li>
        ))}
      </ul>
    </div>
  );
}
