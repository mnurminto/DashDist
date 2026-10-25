import {
  Banknote,
  Layers,
  MapPin,
  Percent,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  KECAMATAN,
  PROGRAM,
  RINGKASAN_DKI,
  type Kecamatan,
} from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Kartu = {
  label: string;
  nilai: string;
  keterangan: string;
  ikon: LucideIcon;
};

type Props = {
  /** Kalau dipilih, angka berubah menjadi ringkasan wilayah tersebut. */
  wilayah?: Kecamatan | null;
};

/** Kartu ringkasan angka: total DKI Jakarta, atau satu wilayah terpilih. */
export function StatistikUtama({ wilayah }: Props) {
  const jumlahKota = new Set(KECAMATAN.map((kecamatan) => kecamatan.kota)).size;

  const penerima = wilayah?.penerima ?? RINGKASAN_DKI.penerima;
  const dana = wilayah?.dana ?? RINGKASAN_DKI.dana;
  const program = wilayah?.program ?? PROGRAM.length;
  const porsiDana = wilayah ? (wilayah.dana / RINGKASAN_DKI.dana) * 100 : 0;

  const kartu: Kartu[] = [
    {
      label: "Penerima manfaat",
      nilai: `${formatAngka(penerima)} orang`,
      keterangan: wilayah
        ? `penerima di Kecamatan ${wilayah.nama}`
        : `± ${formatAngka(Math.round(RINGKASAN_DKI.penerima / KECAMATAN.length))} orang per kecamatan`,
      ikon: Users,
    },
    {
      label: "Dana tersalurkan",
      nilai: formatRupiah(dana),
      keterangan: wilayah
        ? `untuk penerima di Kecamatan ${wilayah.nama}`
        : `${formatRupiah(Math.round(RINGKASAN_DKI.dana / RINGKASAN_DKI.penerima))} per penerima manfaat`,
      ikon: Banknote,
    },
    {
      label: "Program berjalan",
      nilai: `${program} program`,
      keterangan: wilayah
        ? `program yang menyalurkan di wilayah ini`
        : `rata-rata ${(RINGKASAN_DKI.program / KECAMATAN.length).toLocaleString("id-ID", { maximumFractionDigits: 1 })} program per kecamatan`,
      ikon: Layers,
    },
    wilayah
      ? {
          label: "Porsi dana DKI",
          nilai: `${porsiDana.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`,
          keterangan: `dari total ${formatRupiah(RINGKASAN_DKI.dana)} di DKI Jakarta`,
          ikon: Percent,
        }
      : {
          label: "Wilayah terjangkau",
          nilai: `${KECAMATAN.length} kecamatan`,
          keterangan: `${jumlahKota - 1} kota administrasi + Kepulauan Seribu`,
          ikon: MapPin,
        },
  ];

  return (
    <section aria-label="Ringkasan statistik bantuan" className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="text-sm font-semibold tracking-tight">
          {wilayah
            ? `Ringkasan Kecamatan ${wilayah.nama}`
            : "Ringkasan DKI Jakarta"}
        </h2>
        <p className="text-xs text-muted-foreground">
          {wilayah
            ? `${wilayah.kota} · klik wilayah lain di peta untuk berganti`
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
