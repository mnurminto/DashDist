import { formatAngka, formatRupiahRingkas } from "@/lib/dashboard/format";

export type ProfilWilayahData = {
  kota: string;
  /** Peringkat 1–46 berdasarkan dana tersalurkan. */
  peringkat: number;
  totalWilayah: number;
  /** Persentase dana wilayah terhadap total DKI. */
  porsiDki: number;
  program: number;
  penerima: number;
  dana: number;
  transaksi: number;
};

type Props = { data: ProfilWilayahData };

/** Ringkasan naratif singkat untuk satu wilayah. */
export function ProfilWilayah({ data }: Props) {
  const danaPerPenerima =
    data.penerima > 0 ? Math.round(data.dana / data.penerima) : 0;
  const danaPerTransaksi =
    data.transaksi > 0 ? Math.round(data.dana / data.transaksi) : 0;

  const baris = [
    {
      label: "Peringkat penyaluran",
      nilai: `${data.peringkat} dari ${data.totalWilayah}`,
    },
    {
      label: "Porsi dana DKI",
      nilai: `${data.porsiDki.toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      })}%`,
    },
    { label: "Program menyalurkan", nilai: `${data.program} program` },
    {
      label: "Dana per penerima",
      nilai: formatRupiahRingkas(danaPerPenerima),
    },
    {
      label: "Rata-rata per transaksi",
      nilai: formatRupiahRingkas(danaPerTransaksi),
    },
  ];

  return (
    <div>
      <p className="text-xs leading-5 text-muted-foreground">
        Kecamatan ini berada di{" "}
        <span className="text-foreground">{data.kota}</span> dan menyalurkan
        bantuan kepada{" "}
        <span className="text-foreground">
          {formatAngka(data.penerima)} penerima
        </span>{" "}
        melalui {data.program} program.
      </p>

      <dl className="mt-4 space-y-2.5 border-t border-border/60 pt-3 text-xs">
        {baris.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-3"
          >
            <dt className="text-muted-foreground">{item.label}</dt>
            <dd className="font-medium text-foreground tabular-nums">
              {item.nilai}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
