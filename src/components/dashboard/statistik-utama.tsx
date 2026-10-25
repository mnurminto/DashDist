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
  /** Data tren opsional (dana per tahun, urut lama → baru). */
  tren?: { nilai: number[]; label: string[] };
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
  /** Dana per tahun untuk sparkline di kartu dana. */
  trenDana?: { nilai: number[]; label: string[] };
};

/** Kartu ringkasan angka: total DKI Jakarta, atau satu wilayah terpilih. */
export function StatistikUtama({
  total,
  wilayah,
  adaFilter,
  onBersihkan,
  trenDana,
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
      tren: trenDana,
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
              {item.tren && item.tren.nilai.some((nilai) => nilai > 0) && (
                <div className="mt-3 flex items-end justify-between gap-3">
                  <Sparkline nilai={item.tren.nilai} label={item.tren.label} />
                  <span className="text-[10px] text-muted-foreground/80 tabular-nums">
                    {item.tren.label[0]}–
                    {item.tren.label[item.tren.label.length - 1]}
                  </span>
                </div>
              )}
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

/** Grafik mini dana per tahun, dipakai di kartu "Dana tersalurkan". */
function Sparkline({ nilai, label }: { nilai: number[]; label: string[] }) {
  const lebar = 96;
  const tinggi = 30;
  const pad = 3;
  const maks = Math.max(...nilai, 1);
  const min = Math.min(...nilai);
  const rentang = Math.max(maks - min, 1);

  const titik = nilai.map((v, i) => {
    const x = pad + (i * (lebar - pad * 2)) / Math.max(nilai.length - 1, 1);
    const y = tinggi - pad - ((v - min) / rentang) * (tinggi - pad * 2);
    return [x, y] as const;
  });

  const garis = titik
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const area = `${garis} L${(lebar - pad).toFixed(1)} ${tinggi} L${pad} ${tinggi} Z`;
  const ringkas = label
    .map((tahun, i) => `${tahun}: ${formatRupiah(nilai[i] ?? 0)}`)
    .join(", ");

  return (
    <svg
      viewBox={`0 0 ${lebar} ${tinggi}`}
      className="h-8 w-24 overflow-visible"
      role="img"
      aria-label={`Tren dana tahunan — ${ringkas}`}
    >
      <defs>
        <linearGradient id="tren-dana" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e0cf8a" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e0cf8a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tren-dana)" />
      <path
        d={garis}
        fill="none"
        stroke="#d9c77c"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {titik.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i === titik.length - 1 ? 2.2 : 1.5}
          fill="#e9dfae"
        />
      ))}
    </svg>
  );
}
