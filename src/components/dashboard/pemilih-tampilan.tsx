"use client";

import { cn } from "cn";

type Opsi<T extends string> = {
  nilai: T;
  label: string;
};

type Props<T extends string> = {
  /** Label grup untuk pembaca layar, mis. "Rentang grafik". */
  label: string;
  opsi: readonly Opsi<T>[];
  nilai: T;
  onUbah: (nilai: T) => void;
  className?: string;
};

/**
 * Kontrol segmen kecil untuk memilih tampilan grafik.
 * Dipakai sebagai toggle "Bulanan / Tahunan" dan pilihan jenis grafik.
 */
export function PemilihTampilan<T extends string>({
  label,
  opsi,
  nilai,
  onUbah,
  className,
}: Props<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "inline-flex rounded-lg border border-border bg-secondary/40 p-0.5",
        className,
      )}
    >
      {opsi.map((item) => {
        const aktif = item.nilai === nilai;
        return (
          <button
            key={item.nilai}
            type="button"
            onClick={() => onUbah(item.nilai)}
            aria-pressed={aktif}
            className={cn(
              "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
              aktif
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
