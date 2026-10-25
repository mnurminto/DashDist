import { KECAMATAN, PROGRAM, type Kecamatan } from "./mock-data";
import {
  PENYALURAN,
  TAHUN_TERSEDIA,
  type BarisPenyaluran,
  type FilterState,
} from "./penyaluran";

/** Ubah filter menjadi query string yang bisa dibagikan. */
export function filterKeQuery(filter: FilterState) {
  const params = new URLSearchParams();
  if (filter.wilayah !== "semua") params.set("wilayah", filter.wilayah);
  if (filter.program !== "semua") params.set("program", filter.program);
  if (filter.periode !== "semua") params.set("periode", filter.periode);
  return params.toString();
}

/**
 * Baca filter dari query string. Nilai yang tidak dikenal diabaikan supaya
 * tautan lama atau salah ketik tidak merusak tampilan.
 */
export function bacaFilterDariQuery(
  query: string,
): Partial<FilterState> | null {
  const params = new URLSearchParams(query);
  const hasil: Partial<FilterState> = {};

  const wilayah = params.get("wilayah");
  if (wilayah && KECAMATAN.some((item) => item.code === wilayah))
    hasil.wilayah = wilayah;

  const program = params.get("program");
  if (program && PROGRAM.some((item) => item.id === program))
    hasil.program = program;

  const periode = params.get("periode");
  if (periode && (TAHUN_TERSEDIA as readonly string[]).includes(periode))
    hasil.periode = periode;

  return Object.keys(hasil).length > 0 ? hasil : null;
}

function namaWilayah(kode: string) {
  return KECAMATAN.find((item) => item.code === kode) as Kecamatan | undefined;
}

export type BarisEkspor = {
  kodeWilayah: string;
  kecamatan: string;
  kota: string;
  program: string;
  tahun: string;
  penerima: number;
  dana: number;
  transaksi: number;
};

/** Ringkas buku besar per kecamatan + program + tahun untuk file unduhan. */
export function ringkasEkspor(rows: readonly BarisPenyaluran[]): BarisEkspor[] {
  const peta = new Map<string, BarisEkspor>();

  for (const baris of rows) {
    const kunci = `${baris.kecamatan}|${baris.program}|${baris.tahun}`;
    const sekarang = peta.get(kunci);
    const meta = namaWilayah(baris.kecamatan);
    const program = PROGRAM.find((item) => item.id === baris.program);

    if (sekarang) {
      sekarang.penerima += baris.penerima;
      sekarang.dana += baris.dana;
      sekarang.transaksi += baris.transaksi;
    } else {
      peta.set(kunci, {
        kodeWilayah: baris.kecamatan,
        kecamatan: meta?.nama ?? baris.kecamatan,
        kota: meta?.kota ?? "-",
        program: program?.nama ?? baris.program,
        tahun: baris.tahun,
        penerima: baris.penerima,
        dana: baris.dana,
        transaksi: baris.transaksi,
      });
    }
  }

  return [...peta.values()].sort(
    (a, b) =>
      a.kecamatan.localeCompare(b.kecamatan, "id") ||
      a.program.localeCompare(b.program, "id") ||
      Number(a.tahun) - Number(b.tahun),
  );
}

const KEPALA_CSV = [
  "kode_wilayah",
  "kecamatan",
  "kota",
  "program",
  "tahun",
  "penerima",
  "dana",
  "transaksi",
];

function sel(value: string | number) {
  const teks = String(value);
  return /[",\n;]/.test(teks) ? `"${teks.replace(/"/g, '""')}"` : teks;
}

/** CSV siap Excel: pemisah koma, BOM UTF-8 ditambahkan saat mengunduh. */
export function buatCsv(rows: readonly BarisEkspor[]): string {
  const isi = rows.map((baris) =>
    [
      baris.kodeWilayah,
      baris.kecamatan,
      baris.kota,
      baris.program,
      baris.tahun,
      baris.penerima,
      baris.dana,
      baris.transaksi,
    ]
      .map(sel)
      .join(","),
  );

  return [KEPALA_CSV.join(","), ...isi].join("\r\n");
}

/** Nama file ringkas berisi filter aktif dan tanggal unduh. */
export function namaBerkasCsv(filter: FilterState, tanggal = new Date()) {
  const bagian = [
    "distribusi-baznas",
    filter.wilayah !== "semua" ? filter.wilayah : "dki",
    filter.program !== "semua" ? filter.program : "semua-program",
    filter.periode !== "semua" ? filter.periode : "semua-tahun",
    tanggal.toISOString().slice(0, 10),
  ];
  return `${bagian.join("-")}.csv`;
}

/** Unduh teks sebagai file CSV di browser. */
export function unduhCsv(nama: string, isi: string) {
  const blob = new Blob([`\uFEFF${isi}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = nama;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Beri waktu browser memulai unduhan sebelum objek dibersihkan.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Jumlah baris buku besar untuk ditampilkan di tombol. */
export function jumlahBarisEkspor(rows: readonly BarisPenyaluran[]) {
  return ringkasEkspor(rows).length;
}

/** Total baris yang tersedia (untuk pratinjau di UI). */
export const TOTAL_BARIS_CONTOH = PENYALURAN.length;
