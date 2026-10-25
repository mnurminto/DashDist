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
};

/** Kartu ringkasan angka: total DKI Jakarta, atau satu wilayah terpilih. */
export function StatistikUtama({ total, wilayah, adaFilter }: Props) {
  const jumlahKota = new Set(KECAMATAN.map((kecamatan) => kecamatan.kota)).size;

  const penerima = wilayah?.penerima ?? total.penerima;
  const dana = wilayah?.dana ?? total.dana;
  const program = wilayah?.program ?? total.program;
  const transaksi = wilayah?.transaksi ?? total.transaksi;

  const kartu: Kartu[] = [
    {
      label: "Penerima manfaat",
      nilai: `${formatAngka(penerima)} orang`,
      keterangan: wilayah
        ? `penerima di Kecamatan ${wilayah.nama}`
        : `${formatAngka(transaksi)} transaksi penyaluran`,
      ikon: Users,
    },
    {
      label: "Dana tersalurkan",
      nilai: formatRupiah(dana),
      keterangan:
        penerima > 0
          ? `${formatRupiah(Math.round(dana / penerima))} per penerima manfaat`
          : "belum ada data pada filter ini",
      ikon: Banknote,
    },
    {
      label: "Program berjalan",
      nilai: `${program} program`,
      keterangan: wilayah
        ? "program yang menyalurkan di wilayah ini"
        : adaFilter
          ? "program yang menyalurkan pada filter ini"
          : "program bantuan aktif menyalurkan",
      ikon: Layers,
    },
    wilayah
      ? {
          label: "Transaksi",
          nilai: `${formatAngka(transaksi)} kali`,
          keterangan: `penyaluran tercatat di Kecamatan ${wilayah.nama}`,
          ikon: Receipt,
        }
      : {
          label: "Wilayah terjangkau",
          nilai: `${total.wilayah} kecamatan`,
          keterangan: `dari ${KECAMATAN.length} kecamatan di ${jumlahKota} wilayah administrasi`,
          ikon: MapPin,
        },
  ];

  return (
    <section aria-label="Ringkasan statistik bantuan" aria-live="polite">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="text-sm font-semibold tracking-tight">
          {wilayah
            ? `Ringkasan Kecamatan ${wilayah.nama}`
            : "Ringkasan DKI Jakarta"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {wilayah
            ? `${wilayah.kota} · klik wilayah lain di peta untuk berganti`
            : adaFilter
              ? "sesuai filter yang dipilih"
              : "akumulasi seluruh wilayah dan program"}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map((item) => {
          const Ikon = item.ikon;
          return (
            <li
              key={item.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {item.label}
                </p>
                <Ikon className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground tabular-nums">
                {item.nilai}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.keterangan}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
