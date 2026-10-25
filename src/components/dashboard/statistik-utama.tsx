import { Banknote, Layers, MapPin, Users, type LucideIcon } from "lucide-react";
import { KECAMATAN, PROGRAM, RINGKASAN_DKI } from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Kartu = {
  label: string;
  nilai: string;
  keterangan: string;
  ikon: LucideIcon;
};

/** Kartu ringkasan angka utama DKI Jakarta. */
export function StatistikUtama() {
  const jumlahKota = new Set(KECAMATAN.map((kecamatan) => kecamatan.kota)).size;

  const kartu: Kartu[] = [
    {
      label: "Penerima manfaat",
      nilai: `${formatAngka(RINGKASAN_DKI.penerima)} orang`,
      keterangan: `dari ${formatAngka(RINGKASAN_DKI.penyaluran)} transaksi penyaluran`,
      ikon: Users,
    },
    {
      label: "Dana tersalurkan",
      nilai: formatRupiah(RINGKASAN_DKI.dana),
      keterangan: "akumulasi seluruh program bantuan",
      ikon: Banknote,
    },
    {
      label: "Program berjalan",
      nilai: `${PROGRAM.length} program`,
      keterangan: "program bantuan yang aktif menyalurkan",
      ikon: Layers,
    },
    {
      label: "Wilayah terjangkau",
      nilai: `${KECAMATAN.length} kecamatan`,
      keterangan: `${jumlahKota - 1} kota administrasi + Kepulauan Seribu`,
      ikon: MapPin,
    },
  ];

  return (
    <section aria-label="Ringkasan statistik bantuan" className="mt-8">
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
              <p className="mt-3 text-2xl font-semibold tracking-tight text-card-foreground">
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
