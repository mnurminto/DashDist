"use client";

import { ArrowUpRight } from "lucide-react";
import type { WilayahRingkas } from "@/lib/dashboard/penyaluran";
import { formatRupiahRingkas } from "@/lib/dashboard/format";

type Props = {
  data: readonly WilayahRingkas[];
  aktif?: string | null;
  onPilih?: (kode: string) => void;
  /** Kode yang sedang disorot dari peta. */
  sorot?: string | null;
  /** Memberi tahu peta wilayah mana yang sedang di-hover di daftar. */
  onHover?: (kode: string | null) => void;
};

/**
 * Panel kanan: kecamatan dengan penyaluran terbesar pada filter aktif.
 * Batang kecil membantu membandingkan tanpa harus membaca angkanya.
 */
export function PeringkatWilayah({
  data,
  aktif,
  onPilih,
  sorot,
  onHover,
}: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-4">
        <p className="text-xs text-muted-foreground">
          Tidak ada wilayah pada filter ini.
        </p>
      </div>
    );
  }

  const maksimum = Math.max(...data.map((item) => item.dana), 1);

  return (
    <div className="rounded-2xl border border-border bg-card/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Penyaluran terbesar
        </h2>
        <ArrowUpRight
          className="size-3.5 text-muted-foreground/60"
          aria-hidden="true"
        />
      </div>

      <ol className="mt-3 space-y-2.5">
        {data.map((wilayah, i) => {
          const terpilih = aktif === wilayah.code;
          const disorot = sorot === wilayah.code;
          return (
            <li key={wilayah.code}>
              <button
                type="button"
                onClick={() => onPilih?.(wilayah.code)}
                onMouseEnter={() => onHover?.(wilayah.code)}
                onMouseLeave={() => onHover?.(null)}
                onFocus={() => onHover?.(wilayah.code)}
                onBlur={() => onHover?.(null)}
                className={`w-full rounded-lg px-1.5 py-1.5 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none ${
                  terpilih
                    ? "bg-secondary/70"
                    : disorot
                      ? "bg-secondary/40"
                      : "hover:bg-secondary/60"
                }`}
                data-sorot={disorot ? "1" : "0"}
                aria-pressed={terpilih}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate text-xs font-medium">
                      {wilayah.nama}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                    {formatRupiahRingkas(wilayah.dana)}
                  </span>
                </div>
                <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#a89a52] to-[#7d6d24]"
                    style={{
                      width: `${Math.max((wilayah.dana / maksimum) * 100, 4)}%`,
                    }}
                  />
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
