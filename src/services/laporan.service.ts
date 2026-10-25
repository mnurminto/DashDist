import "server-only";
import { buatPdfLaporan, type KolomPdf } from "@/services/pdf.service";
import { getLaporan, getSebaran } from "@/services/sebaran.service";
import type { SebaranQuery } from "@/validators/sebaran";

const KOLOM: KolomPdf[] = [
  { judul: "No", lebar: 26 },
  { judul: "Kecamatan", lebar: 118 },
  { judul: "Kota", lebar: 92 },
  { judul: "Program", lebar: 148 },
  { judul: "Tahun", lebar: 40 },
  { judul: "Penerima", lebar: 52, rata: "kanan" },
  { judul: "Dana (Rp)", lebar: 78, rata: "kanan" },
];

function labelWilayah(kode?: string) {
  return kode ? `Wilayah ${kode}` : "Seluruh DKI Jakarta";
}

function formatRupiah(nilai: number) {
  return new Intl.NumberFormat("id-ID").format(nilai);
}

/** Susun laporan PDF sesuai filter aktif. */
export async function buatLaporanPdf(filter: SebaranQuery) {
  const [baris, sebaran] = await Promise.all([
    getLaporan(filter),
    getSebaran(filter),
  ]);

  const dibuatPada = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const isi = buatPdfLaporan({
    judul: "Laporan Distribusi Bantuan",
    subjudul: [
      labelWilayah(filter.wilayah),
      filter.program ? `Program ${filter.program}` : "Semua program",
      filter.periode ? `Tahun ${filter.periode}` : "Semua tahun",
    ].join("  |  "),
    dibuatPada,
    ringkasan: [
      { label: "Penerima", nilai: formatRupiah(sebaran.total.penerima) },
      { label: "Dana", nilai: `Rp ${formatRupiah(sebaran.total.dana)}` },
      { label: "Program", nilai: formatRupiah(sebaran.total.program) },
      { label: "Transaksi", nilai: formatRupiah(sebaran.total.transaksi) },
    ],
    catatan:
      "Sumber batas wilayah: BPS via HDX (ODbL). Angka mengikuti data yang tersimpan di database.",
    kolom: KOLOM,
    baris: baris.map((item, i) => [
      String(i + 1),
      item.kecamatan,
      item.kota,
      item.program,
      item.tahun === null ? "-" : String(item.tahun),
      formatRupiah(item.penerima),
      formatRupiah(item.dana),
    ]),
    total: {
      label: `Total ${baris.length} baris`,
      nilai: [
        formatRupiah(sebaran.total.penerima),
        formatRupiah(sebaran.total.dana),
      ],
    },
  });

  return { bytes: isi, jumlahBaris: baris.length };
}

/** Nama berkas PDF mengikuti filter. */
export function namaBerkasPdf(filter: SebaranQuery) {
  const bagian = [
    "laporan-baznas",
    filter.wilayah ?? "dki",
    filter.program ?? "semua-program",
    filter.periode ? String(filter.periode) : "semua-tahun",
  ];
  const tanggal = new Date().toISOString().slice(0, 10);
  return `${bagian.join("-")}-${tanggal}.pdf`;
}
