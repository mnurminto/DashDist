"use client";

import { Filter, RotateCcw } from "lucide-react";
import { KECAMATAN, PROGRAM } from "@/lib/dashboard/mock-data";
import {
  FILTER_LACAK_AWAL,
  LABEL_STATUS,
  type FilterLacak,
  type StatusLaporan,
} from "@/lib/dashboard/lacak";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  filter: FilterLacak;
  onUbah: (filter: FilterLacak) => void;
  onReset: () => void;
};

const STATUS: StatusLaporan[] = ["selesai", "diproses", "menunggu"];

const KOTA = [...new Set(KECAMATAN.map((item) => item.kota))].sort();

/** Panel filter pelacakan: rentang tanggal, wilayah, program, dan status. */
export function PanelFilterLacak({ filter, onUbah, onReset }: Props) {
  function ubah(patch: Partial<FilterLacak>) {
    onUbah({ ...filter, ...patch });
  }

  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          <Filter className="size-3.5" aria-hidden="true" />
          Filter
        </p>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
        >
          <RotateCcw className="size-3" aria-hidden="true" />
          Reset
        </button>
      </div>

      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Rentang tanggal
          </p>
          <div className="mt-1.5 space-y-2">
            <label className="block">
              <span className="mb-1 block text-[10px] text-muted-foreground">
                Dari
              </span>
              <Input
                type="date"
                value={filter.dari}
                max={filter.sampai}
                onChange={(e) => ubah({ dari: e.target.value })}
                className="h-8 border-border bg-[#141415] text-[11px]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] text-muted-foreground">
                Sampai
              </span>
              <Input
                type="date"
                value={filter.sampai}
                min={filter.dari}
                onChange={(e) => ubah({ sampai: e.target.value })}
                className="h-8 border-border bg-[#141415] text-[11px]"
              />
            </label>
          </div>
        </div>

        <label className="block">
          <span className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Wilayah
          </span>
          <select
            value={filter.wilayah}
            onChange={(e) => ubah({ wilayah: e.target.value })}
            className="select-dark mt-1.5 h-8 w-full appearance-none rounded-lg border border-border bg-[#141415] pr-8 pl-2.5 text-[11px] text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            <option value="semua">Semua kecamatan</option>
            {KOTA.map((kota) => (
              <optgroup key={kota} label={kota}>
                {KECAMATAN.filter((item) => item.kota === kota).map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.nama}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Program
          </span>
          <select
            value={filter.program}
            onChange={(e) => ubah({ program: e.target.value })}
            className="select-dark mt-1.5 h-8 w-full appearance-none rounded-lg border border-border bg-[#141415] pr-8 pl-2.5 text-[11px] text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            <option value="semua">Semua program</option>
            {PROGRAM.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </select>
        </label>

        <div>
          <p className="text-[10px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Status
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant={filter.status === "semua" ? "default" : "outline"}
              className="h-7 px-2 text-[10px]"
              onClick={() => ubah({ status: "semua" })}
              aria-pressed={filter.status === "semua"}
            >
              Semua
            </Button>
            {STATUS.map((status) => (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={filter.status === status ? "default" : "outline"}
                className="h-7 px-2 text-[10px]"
                onClick={() => ubah({ status })}
                aria-pressed={filter.status === status}
              >
                {LABEL_STATUS[status]}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 border-t border-border/60 pt-2 text-[10px] leading-4 text-muted-foreground">
        Klik penanda di peta untuk melihat laporan dan riwayatnya.
      </p>
    </div>
  );
}

export { FILTER_LACAK_AWAL };
