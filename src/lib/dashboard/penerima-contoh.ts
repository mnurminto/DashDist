import { PROGRAM } from "./mock-data";

/**
 * Daftar penerima contoh untuk halaman detail wilayah.
 *
 * Nama sengaja disamarkan (nama depan + inisial) karena data penerima bersifat
 * pribadi; rincian penuh hanya untuk peran yang berwenang.
 */

export type PenerimaContoh = {
  id: string;
  /** Nama yang sudah disamarkan, mis. "Siti A." */
  nama: string;
  kategori: string;
  programId: string;
  programNama: string;
  dana: number;
  /** Tanggal ISO (YYYY-MM-DD). */
  tanggal: string;
};

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
  "Iwan",
  "Yuni",
  "Rudi",
  "Aisyah",
];

const NAMA_BELAKANG = [
  "A.",
  "H.",
  "S.",
  "M.",
  "R.",
  "P.",
  "W.",
  "K.",
  "N.",
  "T.",
];

const KATEGORI = ["dhuafa", "yatim", "fakir", "lansia"];

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

/** Buat daftar penerima contoh yang stabil untuk satu kecamatan. */
export function daftarPenerimaContoh(
  kode: string,
  jumlah = 30,
): PenerimaContoh[] {
  const acak = acakDeterministik(`${kode}-penerima`);

  return Array.from({ length: jumlah }, (_, i) => {
    const depan = NAMA_DEPAN[Math.floor(acak() * NAMA_DEPAN.length)];
    const belakang = NAMA_BELAKANG[Math.floor(acak() * NAMA_BELAKANG.length)];
    const program = PROGRAM[Math.floor(acak() * PROGRAM.length)];
    const tahun = 2024 + Math.floor(acak() * 3);
    const bulan = 1 + Math.floor(acak() * 12);
    const hari = 1 + Math.floor(acak() * 27);
    const dana = (2 + Math.floor(acak() * 26)) * 100_000;

    return {
      id: `${kode}-${i + 1}`,
      nama: `${depan} ${belakang}`,
      kategori: KATEGORI[Math.floor(acak() * KATEGORI.length)],
      programId: program.id,
      programNama: program.nama,
      dana,
      tanggal: `${tahun}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}`,
    } satisfies PenerimaContoh;
  }).sort((a, b) => (a.tanggal < b.tanggal ? 1 : -1));
}
