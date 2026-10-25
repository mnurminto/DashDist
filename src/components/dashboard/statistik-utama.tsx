import {
  Banknote,
  Layers,
  MapPin,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react";
import { KECAMATAN } from "@/lib/dashboard/mock-data";
import type { Ringkasan, WilayahRingkas } from "@/lib/dashboard/penyaluran";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Kartu = {
  label: string;
  nilai: string;
  keterangan: string;
  ikon: LucideIcon;
};

type Props = {
  /** Angka hasil filter (seluruh DKI atau satu wilayah). */
  total: Ringkasan;
  /** Terisi kalau pengguna memilih satu kecamatan. */
  wilayah: WilayahRingkas | null;
  /** True kalau ada filter aktif selain pilihan wilayah. */
  adaFilter: boolean;
  /** Kalau diisi, tampilkan tombol untuk kembali ke ringkasan DKI. */
  onBersihkan?: () => void;
};

/** Kartu ringkasan angka: total DKI Jakarta, atau satu wilayah terpilih. */
export function StatistikUtama({
  total,
  wilayah,
  adaFilter,
  onBersihkan,
}: Props) {
  const jumlahKota = new Set(KECAMATAN.map((kecamatan) => kecamatan.kota)).size;

  const penerima = wilayah?.penerima ?? total.penerima;
  const dana = wilayah?.dana ?? total.dana;
  const program = wilayah?.program ?? total.program;
  const transaksi = wilayah?.transaksi ?? total.transaksi;

  const kartu: Kartu[] = [
    {
      label: "Penerima manfaat",
      nilai: `${formatAngka(penerima)}`,
      keterangan: wilayah
        ? `orang di Kecamatan ${wilayah.nama}`
        : `orang dari ${formatAngka(transaksi)} transaksi`,
      ikon: Users,
    },
    {
      label: "Dana tersalurkan",
      nilai: formatRupiah(dana),
      keterangan:
        penerima > 0
          ? `${formatRupiah(Math.round(dana / penerima))} per penerima`
          : "belum ada data pada filter ini",
      ikon: Banknote,
    },
    {
      label: "Program berjalan",
      nilai: `${program}`,
      keterangan: wilayah
        ? "program menyalurkan di wilayah ini"
        : adaFilter
          ? "program pada filter ini"
          : "program bantuan aktif",
      ikon: Layers,
    },
    wilayah
      ? {
          label: "Transaksi",
          nilai: formatAngka(transaksi),
          keterangan: "penyaluran tercatat di wilayah ini",
          ikon: Receipt,
        }
      : {
          label: "Wilayah terjangkau",
          nilai: `${total.wilayah}`,
          keterangan: `kecamatan dari ${KECAMATAN.length} · ${jumlahKota} wilayah administrasi`,
          ikon: MapPin,
        },
  ];

  return (
    <section
      id="ringkasan"
      aria-label="Ringkasan statistik bantuan"
      aria-live="polite"
      className="mt-7 scroll-mt-24"
    >
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1">
        <h2 className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {wilayah
            ? `Ringkasan Kecamatan ${wilayah.nama}`
            : "Ringkasan DKI Jakarta"}
        </h2>
        <p className="text-[11px] text-muted-foreground/70">
          {wilayah
            ? `· ${wilayah.kota}`
            : adaFilter
              ? "· sesuai filter"
              : "· seluruh wilayah & program"}
        </p>
        {wilayah && onBersihkan && (
          <button
            type="button"
            onClick={onBersihkan}
            className="ml-auto rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            Kembali ke DKI
          </button>
        )}
      </div>

      <ul
        key={`${wilayah?.code ?? "dki"}-${total.dana}-${total.penerima}`}
        className="grid animate-in gap-3 duration-300 fade-in-0 slide-in-from-bottom-1 motion-reduce:animate-none sm:grid-cols-2 xl:grid-cols-4"
      >
        {kartu.map((item) => {
          const Ikon = item.ikon;
          return (
            <li
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-5 transition-colors hover:border-primary/25"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  {item.label}
                </p>
                <Ikon
                  className="size-4 text-muted-foreground/60"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 text-[1.7rem] leading-none font-semibold tracking-tight text-card-foreground tabular-nums">
                {item.nilai}
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {item.keterangan}
              </p>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-8 -bottom-10 size-28 rounded-full bg-primary/10 blur-2xl"
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
