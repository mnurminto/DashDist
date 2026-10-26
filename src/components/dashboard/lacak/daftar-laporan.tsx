"use client";

import { MapPin, Search } from "lucide-react";
import {
  LABEL_STATUS,
  WARNA_STATUS,
  formatTanggalLacak,
  type LaporanBantuan,
} from "@/lib/dashboard/lacak";
import { formatRupiah } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  laporan: readonly LaporanBantuan[];
  aktif: string | null;
  onPilih: (laporan: LaporanBantuan) => void;
};

/** Daftar laporan hasil filter; sinkron dengan penanda peta. */
export function DaftarLaporan({ laporan, aktif, onPilih }: Props) {
  if (laporan.length === 0) {
    return (
      <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-card/40 p-6 text-center">
        <Search
          className="size-5 text-muted-foreground/60"
          aria-hidden="true"
        />
        <p className="text-xs font-medium text-foreground">
          Tidak ada laporan pada filter ini
        </p>
        <p className="text-[11px] leading-5 text-muted-foreground">
          Coba lebarkan rentang tanggal atau pilih “Semua kecamatan”.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full max-h-[26rem] flex-col rounded-xl border border-border bg-card/60 xl:max-h-none">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <p className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Daftar laporan
        </p>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {laporan.length}
        </span>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-border/50 overflow-y-auto">
        {laporan.slice(0, 80).map((item) => {
          const terpilih = aktif === item.kode;
          return (
            <li key={item.kode}>
              <button
                type="button"
                onClick={() => onPilih(item)}
                aria-current={terpilih ? "true" : undefined}
                className={cn(
                  "flex w-full flex-col gap-1 px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                  terpilih ? "bg-primary/10" : "hover:bg-secondary/40",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-medium text-foreground">
                    {item.penerima}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                    style={{
                      color: WARNA_STATUS[item.status],
                      background: `${WARNA_STATUS[item.status]}22`,
                    }}
                  >
                    {LABEL_STATUS[item.status]}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="size-2.5" aria-hidden="true" />
                  {item.kecamatanNama}
                  <span aria-hidden="true">·</span>
                  {formatTanggalLacak(item.tanggal)}
                </span>
                <span className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="truncate font-mono text-muted-foreground/80">
                    {item.kode}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {formatRupiah(item.dana)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {laporan.length > 80 && (
        <p className="border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
          Menampilkan 80 laporan terbaru dari {laporan.length}.
        </p>
      )}
    </div>
  );
}
