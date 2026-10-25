"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "cn";
import { KECAMATAN, PROGRAM } from "@/lib/dashboard/mock-data";

/** Nilai filter yang dipakai dashboard. "semua" berarti tanpa penyaringan. */
export type FilterState = {
  /** Kode kecamatan, atau "semua". */
  wilayah: string;
  /** Id program, atau "semua". */
  program: string;
  /** Tahun, atau "semua". */
  periode: string;
};

export const FILTER_AWAL: FilterState = {
  wilayah: "semua",
  program: "semua",
  periode: "semua",
};

export const TAHUN_TERSEDIA = ["2026", "2025", "2024"] as const;

export function jumlahFilterAktif(nilai: FilterState): number {
  return Object.values(nilai).filter((v) => v !== "semua").length;
}

type Props = {
  nilai: FilterState;
  onUbah: (nilai: FilterState) => void;
  onReset: () => void;
  className?: string;
};

/** Baris kontrol filter: wilayah, program, dan periode. */
export function FilterBar({ nilai, onUbah, onReset, className }: Props) {
  const aktif = jumlahFilterAktif(nilai);

  const kotaList = [...new Set(KECAMATAN.map((kecamatan) => kecamatan.kota))];

  function ubah<K extends keyof FilterState>(kunci: K, isi: string) {
    onUbah({ ...nilai, [kunci]: isi });
  }

  return (
    <section
      aria-label="Filter data bantuan"
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <div className="space-y-1.5">
          <label
            htmlFor="filter-wilayah"
            className="block text-xs font-medium text-muted-foreground"
          >
            Wilayah
          </label>
          <select
            id="filter-wilayah"
            value={nilai.wilayah}
            onChange={(e) => ubah("wilayah", e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="semua">Semua kecamatan</option>
            {kotaList.map((kota) => (
              <optgroup key={kota} label={kota}>
                {KECAMATAN.filter((kecamatan) => kecamatan.kota === kota).map(
                  (kecamatan) => (
                    <option key={kecamatan.code} value={kecamatan.code}>
                      {kecamatan.nama}
                    </option>
                  ),
                )}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="filter-program"
            className="block text-xs font-medium text-muted-foreground"
          >
            Jenis program
          </label>
          <select
            id="filter-program"
            value={nilai.program}
            onChange={(e) => ubah("program", e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="semua">Semua program</option>
            {PROGRAM.map((program) => (
              <option key={program.id} value={program.id}>
                {program.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="filter-periode"
            className="block text-xs font-medium text-muted-foreground"
          >
            Periode
          </label>
          <select
            id="filter-periode"
            value={nilai.periode}
            onChange={(e) => ubah("periode", e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="semua">Semua periode</option>
            {TAHUN_TERSEDIA.map((tahun) => (
              <option key={tahun} value={tahun}>
                Tahun {tahun}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          disabled={aktif === 0}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Tampilkan semua data
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground" aria-live="polite">
        {aktif === 0
          ? "Menampilkan seluruh data DKI Jakarta."
          : `${aktif} filter aktif.`}
      </p>
    </section>
  );
}
