"use client";

import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import {
  LABEL_STATUS,
  WARNA_STATUS,
  formatTanggalLacak,
  formatWaktuLacak,
  type LaporanBantuan,
} from "@/lib/dashboard/lacak";
import { formatRupiah } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  laporan: readonly LaporanBantuan[];
  onTutup: () => void;
};

function warnaFoto(kode: string) {
  let h = 0;
  for (let i = 0; i < kode.length; i += 1)
    h = (h * 31 + kode.charCodeAt(i)) % 360;
  return h;
}

/** Pengganti foto laporan: gradien deterministik + label "foto contoh". */
function FotoLaporan({ kode }: { kode: string }) {
  const hue = warnaFoto(kode);
  return (
    <div
      className="relative flex h-36 items-center justify-center overflow-hidden rounded-lg border border-white/10"
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 32% 26%), hsl(${(hue + 45) % 360} 30% 16%))`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 2px, transparent 2px 12px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-1 text-center">
        <Camera className="size-5 text-white/70" aria-hidden="true" />
        <p className="text-[10px] text-white/70">Foto laporan (contoh)</p>
      </div>
    </div>
  );
}

/** Kartu popup laporan dengan dua tab: Laporan dan Riwayat. */
export function PopupLaporan({ laporan, onTutup }: Props) {
  const [tab, setTab] = useState<"laporan" | "riwayat">("laporan");
  const [indeks, setIndeks] = useState(0);

  const aktif = laporan[Math.min(indeks, laporan.length - 1)];
  if (!aktif) return null;

  const warna = WARNA_STATUS[aktif.status];

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card/95 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 pt-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            {aktif.kode}
          </p>
        </div>
        <button
          type="button"
          onClick={onTutup}
          aria-label="Tutup detail laporan"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Detail laporan"
        className="flex gap-1 px-3"
      >
        {(["laporan", "riwayat"] as const).map((item) => (
          <button
            key={item}
            role="tab"
            type="button"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={cn(
              "relative px-2 py-2 text-[11px] font-medium capitalize transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
              tab === item
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-x-1 -bottom-px h-0.5 rounded-full",
                tab === item ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        ))}
      </div>

      <div className="border-t border-border/70 p-3">
        {tab === "laporan" ? (
          <div className="space-y-2.5">
            <FotoLaporan kode={aktif.kode} />

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground">
                  {aktif.penerima}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <MapPin className="size-3" aria-hidden="true" />
                  {aktif.kecamatanNama} · {aktif.kota}
                </p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  color: warna,
                  background: `${warna}22`,
                  border: `1px solid ${warna}55`,
                }}
              >
                {LABEL_STATUS[aktif.status]}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-border/60 pt-2 text-[11px]">
              <div>
                <dt className="text-muted-foreground">Program</dt>
                <dd className="text-foreground">{aktif.programNama}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Kategori</dt>
                <dd className="text-foreground capitalize">{aktif.kategori}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Dana</dt>
                <dd className="font-medium text-foreground tabular-nums">
                  {formatRupiah(aktif.dana)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Tanggal</dt>
                <dd className="text-foreground">
                  {formatTanggalLacak(aktif.tanggal)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <ol className="space-y-0">
            {aktif.riwayat.map((langkah, i) => (
              <li key={`${langkah.status}-${i}`} className="flex gap-2.5">
                <div className="flex flex-col items-center">
                  <span
                    className="mt-1 size-2 shrink-0 rounded-full ring-2 ring-background"
                    style={{ background: WARNA_STATUS[langkah.status] }}
                    aria-hidden="true"
                  />
                  {i < aktif.riwayat.length - 1 && (
                    <span
                      className="my-0.5 w-px flex-1 bg-border"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div
                  className={cn(
                    "min-w-0",
                    i < aktif.riwayat.length - 1 && "pb-3",
                  )}
                >
                  <p className="text-[11px] font-medium text-foreground">
                    {langkah.judul}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                    {langkah.catatan}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/80 tabular-nums">
                    {formatWaktuLacak(langkah.waktu)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {laporan.length > 1 && (
        <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setIndeks((i) => Math.max(i - 1, 0))}
            disabled={indeks === 0}
            aria-label="Laporan sebelumnya"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </button>
          <p className="text-[10px] text-muted-foreground tabular-nums">
            {Math.min(indeks + 1, laporan.length)} / {laporan.length} laporan di
            sini
          </p>
          <button
            type="button"
            onClick={() =>
              setIndeks((i) => Math.min(i + 1, laporan.length - 1))
            }
            disabled={indeks >= laporan.length - 1}
            aria-label="Laporan berikutnya"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
