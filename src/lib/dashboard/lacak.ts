import { KECAMATAN, PROGRAM } from "./mock-data";

/**
 * Data contoh "pelacakan penerima bantuan".
 *
 * Meniru peta CRM: setiap laporan punya kode, status, foto, dan riwayat
 * proses. Semua deterministik supaya angka tidak berubah saat dirender ulang.
 */

export type StatusLaporan = "selesai" | "diproses" | "menunggu";

export type LangkahRiwayat = {
  status: StatusLaporan;
  judul: string;
  catatan: string;
  /** ISO datetime. */
  waktu: string;
};

export type LaporanBantuan = {
  kode: string;
  kecamatan: string;
  kecamatanNama: string;
  kota: string;
  programId: string;
  programNama: string;
  /** Nama penerima yang sudah disamarkan. */
  penerima: string;
  dana: number;
  /** Tanggal laporan (YYYY-MM-DD). */
  tanggal: string;
  status: StatusLaporan;
  kategori: string;
  riwayat: LangkahRiwayat[];
};

export const LABEL_STATUS: Record<StatusLaporan, string> = {
  selesai: "Selesai",
  diproses: "Diproses",
  menunggu: "Menunggu",
};

export const WARNA_STATUS: Record<StatusLaporan, string> = {
  selesai: "#7f8f4a",
  diproses: "#d99a3d",
  menunggu: "#c0563f",
};

function acakDeterministik(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMA_DEPAN = [
  "Siti",
  "Ahmad",
  "Rina",
  "Budi",
  "Nur",
  "Dewi",
  "Hendra",
  "Maya",
  "Agus",
  "Lestari",
  "Fajar",
  "Wati",
];
const NAMA_BELAKANG = ["A.", "H.", "S.", "M.", "R.", "P.", "W.", "T."];
const KATEGORI = ["dhuafa", "yatim", "fakir", "lansia"];

/** Tanggal acuan laporan contoh. */
const ACUAN = new Date("2026-10-26T00:00:00Z");

function tanggalMundur(hari: number) {
  const d = new Date(ACUAN);
  d.setUTCDate(d.getUTCDate() - hari);
  return d;
}

function isoTanggal(d: Date) {
  return d.toISOString().slice(0, 10);
}

function isoWaktu(d: Date) {
  return d.toISOString();
}

function buatRiwayat(
  acak: () => number,
  status: StatusLaporan,
  tanggal: Date,
): LangkahRiwayat[] {
  const langkah: LangkahRiwayat[] = [
    {
      status: "menunggu",
      judul: "Laporan diterima",
      catatan: "Pengajuan masuk lewat petugas kelurahan.",
      waktu: isoWaktu(tanggal),
    },
  ];

  if (status !== "menunggu") {
    const verifikasi = new Date(tanggal);
    verifikasi.setUTCDate(verifikasi.getUTCDate() + 1 + Math.floor(acak() * 2));
    langkah.push({
      status: "diproses",
      judul: "Verifikasi penerima",
      catatan: "Data penerima dan dokumen pendukung sudah diperiksa.",
      waktu: isoWaktu(verifikasi),
    });
  }

  if (status === "selesai") {
    const salur = new Date(tanggal);
    salur.setUTCDate(salur.getUTCDate() + 3 + Math.floor(acak() * 4));
    langkah.push({
      status: "selesai",
      judul: "Bantuan disalurkan",
      catatan: "Dana ditransfer dan bukti penyaluran diunggah.",
      waktu: isoWaktu(salur),
    });
  }

  return langkah;
}

function buatLaporanKecamatan(
  kode: string,
  nama: string,
  kota: string,
  jumlah: number,
): LaporanBantuan[] {
  const acak = acakDeterministik(`${kode}-lacak`);
  const hasil: LaporanBantuan[] = [];

  for (let i = 0; i < jumlah; i += 1) {
    const depan = NAMA_DEPAN[Math.floor(acak() * NAMA_DEPAN.length)];
    const belakang = NAMA_BELAKANG[Math.floor(acak() * NAMA_BELAKANG.length)];
    const program = PROGRAM[Math.floor(acak() * PROGRAM.length)];
    const kategori = KATEGORI[Math.floor(acak() * KATEGORI.length)];
    const undian = acak();
    const status: StatusLaporan =
      undian > 0.42 ? "selesai" : undian > 0.18 ? "diproses" : "menunggu";

    const hariMundur = Math.floor(acak() * 60);
    const tanggal = tanggalMundur(hariMundur);
    const dana = (3 + Math.floor(acak() * 22)) * 250_000;

    hasil.push({
      kode: `BZ${String(26).padStart(2, "0")}${String(10).padStart(2, "0")}${String(
        1000 + Math.floor(acak() * 8999),
      )}`,
      kecamatan: kode,
      kecamatanNama: nama,
      kota,
      programId: program.id,
      programNama: program.nama,
      penerima: `${depan} ${belakang}`,
      dana,
      tanggal: isoTanggal(tanggal),
      status,
      kategori,
      riwayat: buatRiwayat(acak, status, tanggal),
    });
  }

  return hasil;
}

/** Seluruh laporan contoh: 2–5 laporan per kecamatan. */
export const LAPORAN_BANTUAN: readonly LaporanBantuan[] = KECAMATAN.flatMap(
  (kecamatan) => {
    const acak = acakDeterministik(`${kecamatan.code}-jumlah`);
    const jumlah = 2 + Math.floor(acak() * 4);
    return buatLaporanKecamatan(
      kecamatan.code,
      kecamatan.nama,
      kecamatan.kota,
      jumlah,
    );
  },
).sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));

export type FilterLacak = {
  dari: string;
  sampai: string;
  wilayah: string;
  program: string;
  status: string;
};

export const FILTER_LACAK_AWAL: FilterLacak = {
  dari: isoTanggal(tanggalMundur(30)),
  sampai: isoTanggal(ACUAN),
  wilayah: "semua",
  program: "semua",
  status: "semua",
};

export function saringLaporan(
  filter: FilterLacak,
  laporan: readonly LaporanBantuan[] = LAPORAN_BANTUAN,
) {
  return laporan.filter(
    (item) =>
      (filter.wilayah === "semua" || item.kecamatan === filter.wilayah) &&
      (filter.program === "semua" || item.programId === filter.program) &&
      (filter.status === "semua" || item.status === filter.status) &&
      item.tanggal >= filter.dari &&
      item.tanggal <= filter.sampai,
  );
}

export type KelompokLaporan = {
  kode: string;
  nama: string;
  kota: string;
  laporan: LaporanBantuan[];
  jumlah: number;
  dana: number;
  statusDominan: StatusLaporan;
};

/** Kelompokkan laporan per kecamatan untuk penanda di peta. */
export function kelompokkanPerKecamatan(
  laporan: readonly LaporanBantuan[],
): KelompokLaporan[] {
  const peta = new Map<string, KelompokLaporan>();

  for (const item of laporan) {
    const ada = peta.get(item.kecamatan);
    if (ada) {
      ada.laporan.push(item);
      ada.jumlah += 1;
      ada.dana += item.dana;
    } else {
      peta.set(item.kecamatan, {
        kode: item.kecamatan,
        nama: item.kecamatanNama,
        kota: item.kota,
        laporan: [item],
        jumlah: 1,
        dana: item.dana,
        statusDominan: item.status,
      });
    }
  }

  // Status dominan: menunggu > diproses > selesai (yang paling perlu perhatian).
  for (const kelompok of peta.values()) {
    if (kelompok.laporan.some((item) => item.status === "menunggu"))
      kelompok.statusDominan = "menunggu";
    else if (kelompok.laporan.some((item) => item.status === "diproses"))
      kelompok.statusDominan = "diproses";
    else kelompok.statusDominan = "selesai";
  }

  return [...peta.values()].sort((a, b) => b.jumlah - a.jumlah);
}

export function ringkasLacak(laporan: readonly LaporanBantuan[]) {
  return {
    jumlah: laporan.length,
    dana: laporan.reduce((jumlah, item) => jumlah + item.dana, 0),
    selesai: laporan.filter((item) => item.status === "selesai").length,
    diproses: laporan.filter((item) => item.status === "diproses").length,
    menunggu: laporan.filter((item) => item.status === "menunggu").length,
    wilayah: new Set(laporan.map((item) => item.kecamatan)).size,
  };
}

export function formatTanggalLacak(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

export function formatWaktuLacak(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
