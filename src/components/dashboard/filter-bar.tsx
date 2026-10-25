"use client";

import { RotateCcw, X } from "lucide-react";
import { cn } from "cn";
import {
  cariOpsiProgram,
  cariOpsiWilayah,
  OPSI_PERIODE,
  OPSI_PROGRAM,
  OPSI_WILAYAH_PER_KOTA,
} from "@/lib/dashboard/opsi-filter";
import {
  jumlahFilterAktif,
  type FilterState,
} from "@/lib/dashboard/penyaluran";

type Props = {
  nilai: FilterState;
  onUbah: (nilai: FilterState) => void;
  onReset: () => void;
  className?: string;
};

/** Baris kontrol filter: wilayah, program, dan periode. */
export function FilterBar({ nilai, onUbah, onReset, className }: Props) {
  const aktif = jumlahFilterAktif(nilai);

  const namaWilayah = cariOpsiWilayah(nilai.wilayah)?.label;
  const namaProgram = cariOpsiProgram(nilai.program)?.label;

  const chip: { kunci: keyof FilterState; label: string }[] = [];
  if (nilai.wilayah !== "semua") {
    chip.push({
      kunci: "wilayah",
      label: `Wilayah: ${namaWilayah ?? nilai.wilayah}`,
    });
  }
  if (nilai.program !== "semua") {
    chip.push({
      kunci: "program",
      label: `Program: ${namaProgram ?? nilai.program}`,
    });
  }
  if (nilai.periode !== "semua") {
    chip.push({ kunci: "periode", label: `Periode: ${nilai.periode}` });
  }

  function ubah<K extends keyof FilterState>(kunci: K, isi: string) {
    onUbah({ ...nilai, [kunci]: isi });
  }

  /**
   * Reset semua filter. Kalau dipicu lewat keyboard, fokus dikembalikan ke
   * kontrol pertama supaya pengguna keyboard tidak "tersesat" setelah tombol
   * yang sedang difokus berubah menjadi disabled.
   */
  function resetkan(dariKeyboard: boolean) {
    onReset();
    if (dariKeyboard) {
      requestAnimationFrame(() => {
        document.getElementById("filter-wilayah")?.focus();
      });
    }
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
            {OPSI_WILAYAH_PER_KOTA.map((kelompok) => (
              <optgroup key={kelompok.kota} label={kelompok.kota}>
                {kelompok.wilayah.map((wilayah) => (
                  <option key={wilayah.value} value={wilayah.value}>
                    {wilayah.label}
                  </option>
                ))}
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
            {OPSI_PROGRAM.map((program) => (
              <option key={program.value} value={program.value}>
                {program.label}
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
            {OPSI_PERIODE.map((periode) => (
              <option key={periode.value} value={periode.value}>
                {periode.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={(e) => resetkan(e.nativeEvent.detail === 0)}
          disabled={aktif === 0}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border bg-background px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          Tampilkan semua data
        </button>
      </div>

      <div
        className="mt-3 flex flex-wrap items-center gap-2"
        aria-live="polite"
      >
        {aktif === 0 ? (
          <p className="text-xs text-muted-foreground">
            Menampilkan seluruh data DKI Jakarta.
          </p>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">Filter aktif:</span>
            {chip.map((item) => (
              <button
                key={item.kunci}
                type="button"
                onClick={() => ubah(item.kunci, "semua")}
                aria-label={`Hapus filter ${item.label}`}
                className="inline-flex items-center gap-1 rounded-full border bg-muted px-2.5 py-1 text-xs font-medium transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {item.label}
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => resetkan(e.nativeEvent.detail === 0)}
              className="rounded-sm text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              Hapus semua
            </button>
          </>
        )}
      </div>
    </section>
  );
}
