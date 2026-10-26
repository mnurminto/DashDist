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

const SELECT_KELAS =
  "select-dark h-9 w-full appearance-none rounded-lg border border-border bg-card pr-9 pl-3 text-sm text-foreground shadow-xs outline-none transition-colors hover:border-foreground/20 focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20";

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
      id="filter"
      aria-label="Filter data bantuan"
      className={cn(
        "scroll-mt-24 rounded-2xl border border-border bg-card/70 p-4 backdrop-blur sm:p-5",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto] xl:items-end">
        <div className="space-y-1.5">
          <label
            htmlFor="filter-wilayah"
            className="block text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
          >
            Wilayah
          </label>
          <select
            id="filter-wilayah"
            value={nilai.wilayah}
            onChange={(e) => ubah("wilayah", e.target.value)}
            className={SELECT_KELAS}
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
            className="block text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
          >
            Jenis program
          </label>
          <select
            id="filter-program"
            value={nilai.program}
            onChange={(e) => ubah("program", e.target.value)}
            className={SELECT_KELAS}
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
            className="block text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase"
          >
            Periode
          </label>
          <select
            id="filter-periode"
            value={nilai.periode}
            onChange={(e) => ubah("periode", e.target.value)}
            className={SELECT_KELAS}
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
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
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
          <p className="text-[11px] text-muted-foreground">
            Menampilkan seluruh data DKI Jakarta.
          </p>
        ) : (
          <>
            <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Filter aktif
            </span>
            {chip.map((item) => (
              <button
                key={item.kunci}
                type="button"
                onClick={() => ubah(item.kunci, "semua")}
                aria-label={`Hapus filter ${item.label}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                {item.label}
                <X className="size-3" aria-hidden="true" />
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => resetkan(e.nativeEvent.detail === 0)}
              className="rounded-sm text-[11px] text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              Hapus semua
            </button>
          </>
        )}
      </div>
    </section>
  );
}
