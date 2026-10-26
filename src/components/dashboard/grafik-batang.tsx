"use client";

import { formatRupiahRingkas } from "@/lib/dashboard/format";

export type BatangItem = {
  label: string;
  nilai: number;
  keterangan?: string;
};

type Props = {
  data: readonly BatangItem[];
  format?: (nilai: number) => string;
  /** Angka urut ditampilkan di depan label. */
  bernomor?: boolean;
};

/**
 * Daftar batang horizontal untuk membandingkan beberapa nilai.
 * Lebar batang proporsional terhadap nilai terbesar.
 */
export function GrafikBatang({
  data,
  format = formatRupiahRingkas,
  bernomor = true,
}: Props) {
  const maks = Math.max(...data.map((item) => item.nilai), 1);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-muted-foreground">
        Belum ada data untuk dibandingkan.
      </p>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {data.map((item, i) => (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-baseline gap-1.5">
                {bernomor && (
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="truncate text-[11px] font-medium text-foreground">
                  {item.label}
                </span>
                {item.keterangan && (
                  <span className="hidden truncate text-[10px] text-muted-foreground sm:inline">
                    · {item.keterangan}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {format(item.nilai)}
              </span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-foreground/[0.07]"
              title={`${item.label}: ${format(item.nilai)}`}
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#a89a52] to-[#7d6d24]"
                style={{
                  width: `${Math.max((item.nilai / maks) * 100, 3)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <ul className="sr-only">
        {data.map((item) => (
          <li key={`sr-${item.label}`}>
            {item.label}: {format(item.nilai)}
          </li>
        ))}
      </ul>
    </div>
  );
}
