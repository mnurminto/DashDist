"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { cn } from "cn";
import { GEO, KECAMATAN } from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";
import { TINGKAT_WARNA, type Skala } from "@/lib/dashboard/skala-warna";
import type { WilayahRingkas } from "@/lib/dashboard/penyaluran";

type Sorot = { kode: string; x: number; y: number };

type Props = {
  className?: string;
  /** Konten tambahan (mis. legenda) yang ikut tampil saat layar penuh. */
  footer?: React.ReactNode;
  /** Kode kecamatan yang sedang dipilih (dikendalikan halaman induk). */
  dipilih: string | null;
  /** Dipanggil saat pengguna memilih atau menutup pilihan wilayah. */
  onPilih: (kode: string | null) => void;
  /** Angka per kecamatan setelah filter diterapkan. */
  nilai: Map<string, WilayahRingkas>;
  /** Skala warna yang dipakai peta dan legenda. */
  skala: Skala;
};

export function JakartaMap({
  className,
  footer,
  dipilih,
  onPilih,
  nilai,
  skala,
}: Props) {
  const wadah = useRef<HTMLDivElement>(null);
  const kartu = useRef<HTMLDivElement>(null);
  const [sorot, setSorot] = useState<Sorot | null>(null);
  const [layarPenuh, setLayarPenuh] = useState(false);

  // Ikuti perubahan layar penuh dari browser (termasuk saat pengguna menekan Esc).
  useEffect(() => {
    const pantau = () =>
      setLayarPenuh(
        Boolean(kartu.current) && document.fullscreenElement === kartu.current,
      );
    document.addEventListener("fullscreenchange", pantau);
    return () => document.removeEventListener("fullscreenchange", pantau);
  }, []);

  useEffect(() => {
    if (!layarPenuh) return;
    const keluar = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        setLayarPenuh(false);
      }
    };
    document.addEventListener("keydown", keluar);
    return () => document.removeEventListener("keydown", keluar);
  }, [layarPenuh]);

  async function alihLayarPenuh() {
    const elemen = kartu.current;
    if (!elemen) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (elemen.requestFullscreen) {
      try {
        await elemen.requestFullscreen();
        return;
      } catch {
        // Beberapa browser memblokir fullscreen (mis. di dalam iframe).
        // Pakai tampilan penuh versi CSS sebagai gantinya.
      }
    }
    setLayarPenuh((sebelumnya) => !sebelumnya);
  }

  // Gabungkan metadata wilayah dengan angka hasil filter.
  const dataByCode = useMemo(() => {
    const hasil = new Map<string, WilayahRingkas>();
    for (const kecamatan of KECAMATAN) {
      hasil.set(
        kecamatan.code,
        nilai.get(kecamatan.code) ?? {
          code: kecamatan.code,
          nama: kecamatan.nama,
          kota: kecamatan.kota,
          penerima: 0,
          dana: 0,
          transaksi: 0,
          program: 0,
        },
      );
    }
    return hasil;
  }, [nilai]);

  // Skala warna datang dari halaman induk supaya legenda dan peta selalu sama.

  const sedangAktif = sorot?.kode ?? dipilih;
  const info = sorot ? dataByCode.get(sorot.kode) : null;

  function pilih(kode: string) {
    onPilih(dipilih === kode ? null : kode);
  }

  function posisiTooltip(e: React.MouseEvent<SVGPathElement>): {
    x: number;
    y: number;
  } {
    const rect = wadah.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function renderWilayah(
    kode: string,
    path: string,
    opsi?: {
      stroke?: string;
      tingkatMinimum?: number;
      pusat?: { x: number; y: number };
    },
  ) {
    const data = dataByCode.get(kode);
    if (!data) return null;
    const disorot = sedangAktif === kode;
    const label = `${data.nama}, ${data.kota}: ${formatRupiah(data.dana)} untuk ${formatAngka(data.penerima)} penerima`;
    const tingkat = Math.max(
      skala.tingkat(data.dana),
      opsi?.tingkatMinimum ?? 0,
    );

    return (
      <path
        key={kode}
        d={path}
        fill={TINGKAT_WARNA[tingkat]}
        stroke={disorot ? "#efeeee" : (opsi?.stroke ?? "#0d0d0d")}
        strokeWidth={disorot ? 1.8 : 1}
        strokeLinejoin="round"
        className={cn(
          "cursor-pointer transition-[filter,stroke,stroke-width] duration-200 outline-none",
          disorot && "drop-shadow-[0_0_9px_rgba(195,176,100,0.45)]",
        )}
        tabIndex={0}
        role="button"
        aria-pressed={dipilih === kode}
        aria-label={`${label}. Klik untuk melihat ringkasan.`}
        onClick={() => pilih(kode)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            pilih(kode);
          }
        }}
        onMouseMove={(e) => setSorot({ kode, ...posisiTooltip(e) })}
        onMouseLeave={() =>
          setSorot((current) => (current?.kode === kode ? null : current))
        }
        onFocus={() => {
          // Untuk pengguna keyboard: tampilkan kartu di titik tengah wilayah.
          const rect = wadah.current?.getBoundingClientRect();
          const skala = rect ? rect.width / GEO.viewBox.width : 0;
          const pusat = opsi?.pusat;
          setSorot(
            pusat && rect
              ? { kode, x: pusat.x * skala, y: pusat.y * skala }
              : { kode, x: 0, y: 0 },
          );
        }}
        onBlur={() =>
          setSorot((current) => (current?.kode === kode ? null : current))
        }
      >
        <title>{label}</title>
      </path>
    );
  }

  return (
    <div
      ref={kartu}
      className={cn(
        "relative",
        layarPenuh &&
          "fixed inset-0 z-50 flex flex-col gap-3 overflow-auto bg-background p-4 sm:p-6",
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-end">
        <button
          type="button"
          onClick={alihLayarPenuh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          aria-pressed={layarPenuh}
        >
          {layarPenuh ? (
            <Minimize2 className="size-3.5" aria-hidden="true" />
          ) : (
            <Maximize2 className="size-3.5" aria-hidden="true" />
          )}
          {layarPenuh ? "Keluar layar penuh" : "Layar penuh"}
        </button>
      </div>

      <div
        className={cn(
          "grid gap-5 md:grid-cols-[minmax(0,1fr)] md:items-start",
          layarPenuh && "flex-1",
        )}
      >
        <div ref={wadah} className="relative">
          <svg
            viewBox={`0 0 ${GEO.viewBox.width} ${GEO.viewBox.height}`}
            className={cn(
              "mx-auto block w-full max-w-[760px]",
              layarPenuh
                ? "h-full max-h-[72vh]"
                : "h-auto sm:h-[clamp(380px,56vh,640px)]",
            )}
            role="group"
            aria-label="Peta sebaran bantuan per kecamatan di DKI Jakarta"
            onMouseLeave={() => setSorot(null)}
          >
            {GEO.kecamatan.map((wilayah) =>
              renderWilayah(wilayah.code, wilayah.path, {
                pusat: wilayah.pusat,
              }),
            )}

            {GEO.kotaLabel.map((kota) => (
              <text
                key={kota.nama}
                x={kota.x}
                y={kota.y}
                textAnchor="middle"
                className="pointer-events-none hidden sm:block"
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  fill: "#d9d7ce",
                  paintOrder: "stroke",
                  stroke: "#101010",
                  strokeWidth: 4,
                  strokeLinejoin: "round",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {kota.nama.replace("Jakarta ", "")}
              </text>
            ))}
          </svg>

          <div className="mt-2 flex justify-start sm:absolute sm:top-0 sm:left-0 sm:mt-0">
            <div className="w-28 rounded-lg border bg-background/90 p-2 shadow-sm backdrop-blur sm:w-36">
              <p className="mb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Kepulauan Seribu
              </p>
              <svg
                viewBox={`0 0 ${GEO.seribu.width} ${GEO.seribu.height}`}
                className="block h-auto w-full"
                role="group"
                aria-label="Peta sebaran bantuan di Kepulauan Seribu"
              >
                {GEO.seribu.items.map((wilayah) =>
                  renderWilayah(wilayah.code, wilayah.path, {
                    stroke: "#3a3a34",
                    tingkatMinimum: 2,
                    pusat: wilayah.pusat,
                  }),
                )}
              </svg>
            </div>
          </div>

          {info && sorot && (
            <div
              className="pointer-events-none absolute z-10 w-52 -translate-x-1/2 -translate-y-[calc(100%+16px)] rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
              style={{ left: sorot.x, top: sorot.y }}
              aria-hidden="true"
            >
              <p className="font-semibold text-card-foreground">{info.nama}</p>
              <p className="text-muted-foreground">{info.kota}</p>
              <dl className="mt-1.5 space-y-0.5">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Dana</dt>
                  <dd className="font-medium text-card-foreground">
                    {formatRupiah(info.dana)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Penerima</dt>
                  <dd className="font-medium text-card-foreground">
                    {formatAngka(info.penerima)}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>

      {footer && (
        <div className={cn(layarPenuh && "border-t border-border/60")}>
          {footer}
        </div>
      )}
    </div>
  );
}
