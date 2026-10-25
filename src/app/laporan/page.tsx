import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CetakLaporan } from "@/components/dashboard/cetak-laporan";
import { KECAMATAN, PROGRAM } from "@/lib/dashboard/mock-data";
import {
  FILTER_AWAL,
  ringkasPerWilayah,
  ringkasTotal,
  saring,
  TAHUN_TERSEDIA,
  type FilterState,
} from "@/lib/dashboard/penyaluran";
import {
  formatAngka,
  formatRupiah,
  formatRupiahRingkas,
} from "@/lib/dashboard/format";
import { bacaFilterDariQuery } from "@/lib/dashboard/ekspor";

export const metadata: Metadata = {
  title: "Laporan Distribusi Bantuan",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function satu(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function labelFilter(filter: FilterState) {
  const wilayah =
    filter.wilayah === "semua"
      ? "Seluruh DKI Jakarta"
      : (KECAMATAN.find((item) => item.code === filter.wilayah)?.nama ??
        filter.wilayah);
  const program =
    filter.program === "semua"
      ? "Semua program"
      : (PROGRAM.find((item) => item.id === filter.program)?.nama ??
        filter.program);
  const periode =
    filter.periode === "semua" ? "Semua tahun" : `Tahun ${filter.periode}`;
  return { wilayah, program, periode };
}

export default async function LaporanPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(params)) {
    const isi = satu(nilai);
    if (isi) query.set(kunci, isi);
  }

  const dariTautan = bacaFilterDariQuery(query.toString());
  const filter: FilterState = { ...FILTER_AWAL, ...dariTautan };

  const baris = saring(filter);
  const total = ringkasTotal(baris);
  const perWilayah = [...ringkasPerWilayah(baris).values()].sort(
    (a, b) => b.dana - a.dana,
  );
  const label = labelFilter(filter);
  const cetakOtomatis = satu(params.cetak) === "1";

  const dicetak = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-neutral-200 py-8 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <div className="cetak-sembunyi mb-4 flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-700 hover:text-neutral-900"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Kembali ke dashboard
          </Link>
          <div className="flex items-center gap-2">
            <p className="text-[11px] text-neutral-600">
              Pilih &ldquo;Simpan sebagai PDF&rdquo; pada dialog cetak.
            </p>
            <CetakLaporan otomatis={cetakOtomatis} />
          </div>
        </div>

        <article className="lembar-laporan rounded-lg bg-white px-8 py-8 text-neutral-900 shadow-sm print:rounded-none print:px-0 print:py-0 print:shadow-none">
          <header className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-neutral-500 uppercase">
                Baznas Bazis · Provinsi DKI Jakarta
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                Laporan Distribusi Bantuan
              </h1>
              <p className="mt-1 text-xs text-neutral-600">
                {label.wilayah} · {label.program} · {label.periode}
              </p>
            </div>
            <div className="text-right text-[10px] text-neutral-500">
              <p>Dicetak {dicetak}</p>
              <p className="mt-0.5">Data contoh</p>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Penerima", nilai: formatAngka(total.penerima) },
              { label: "Dana", nilai: formatRupiah(total.dana) },
              { label: "Program", nilai: `${total.program}` },
              { label: "Transaksi", nilai: formatAngka(total.transaksi) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] tracking-[0.12em] text-neutral-500 uppercase">
                  {item.label}
                </p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">
                  {item.nilai}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-6">
            <h2 className="text-xs font-semibold tracking-wide text-neutral-700 uppercase">
              Sebaran per kecamatan
            </h2>
            <table className="mt-2 w-full border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-neutral-300 text-[9px] tracking-[0.1em] text-neutral-500 uppercase">
                  <th className="py-1.5 pr-2 font-medium">No</th>
                  <th className="py-1.5 pr-2 font-medium">Kecamatan</th>
                  <th className="py-1.5 pr-2 font-medium">Kota</th>
                  <th className="py-1.5 pr-2 text-right font-medium">
                    Penerima
                  </th>
                  <th className="py-1.5 pr-2 text-right font-medium">
                    Transaksi
                  </th>
                  <th className="py-1.5 text-right font-medium">Dana</th>
                </tr>
              </thead>
              <tbody>
                {perWilayah.map((item, i) => (
                  <tr key={item.code} className="border-b border-neutral-200">
                    <td className="py-1.5 pr-2 text-neutral-500 tabular-nums">
                      {i + 1}
                    </td>
                    <td className="py-1.5 pr-2 font-medium">{item.nama}</td>
                    <td className="py-1.5 pr-2 text-neutral-600">
                      {item.kota}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">
                      {formatAngka(item.penerima)}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">
                      {formatAngka(item.transaksi)}
                    </td>
                    <td className="py-1.5 text-right tabular-nums">
                      {formatRupiahRingkas(item.dana)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-neutral-400 font-semibold">
                  <td className="py-2 pr-2" colSpan={3}>
                    Total ({perWilayah.length} kecamatan)
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatAngka(total.penerima)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">
                    {formatAngka(total.transaksi)}
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatRupiah(total.dana)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <footer className="mt-6 border-t border-neutral-300 pt-3 text-[9px] leading-4 text-neutral-500">
            <p>
              Sumber batas wilayah: BPS via HDX (ODbL). Angka pada laporan ini
              masih data contoh dan belum tersambung ke database produksi.
            </p>
            <p className="mt-1">Tahun tersedia: {TAHUN_TERSEDIA.join(", ")}.</p>
          </footer>
        </article>
      </div>
    </div>
  );
}
