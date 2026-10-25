/**
 * Opsi untuk kontrol filter.
 *
 * Diturunkan dari buku besar (`PENYALURAN`) dan metadata wilayah, jadi pilihan
 * yang tampil selalu sesuai data yang benar-benar ada — bukan daftar terpisah
 * yang bisa basi.
 */

import { KECAMATAN, PROGRAM } from "./mock-data";
import { PENYALURAN, TAHUN_TERSEDIA } from "./penyaluran";

export type OpsiWilayah = {
  value: string;
  label: string;
  kota: string;
  /** Total penerima di wilayah ini pada seluruh data contoh. */
  penerima: number;
};

export type OpsiProgram = {
  value: string;
  label: string;
  deskripsi: string;
  /** Banyak kecamatan yang menerima program ini. */
  jumlahWilayah: number;
};

export type OpsiPeriode = {
  value: string;
  label: string;
  /** Banyak kecamatan yang punya penyaluran pada tahun ini. */
  jumlahWilayah: number;
};

const penerimaPerWilayah = new Map<string, number>();
const wilayahPerProgram = new Map<string, Set<string>>();
const wilayahPerTahun = new Map<string, Set<string>>();

for (const baris of PENYALURAN) {
  penerimaPerWilayah.set(
    baris.kecamatan,
    (penerimaPerWilayah.get(baris.kecamatan) ?? 0) + baris.penerima,
  );

  const program = wilayahPerProgram.get(baris.program) ?? new Set<string>();
  program.add(baris.kecamatan);
  wilayahPerProgram.set(baris.program, program);

  const tahun = wilayahPerTahun.get(baris.tahun) ?? new Set<string>();
  tahun.add(baris.kecamatan);
  wilayahPerTahun.set(baris.tahun, tahun);
}

/** Daftar kecamatan, diurutkan per nama. */
export const OPSI_WILAYAH: OpsiWilayah[] = KECAMATAN.map((kecamatan) => ({
  value: kecamatan.code,
  label: kecamatan.nama,
  kota: kecamatan.kota,
  penerima: penerimaPerWilayah.get(kecamatan.code) ?? 0,
})).sort((a, b) => a.label.localeCompare(b.label, "id"));

/** Kecamatan dikelompokkan per kota administrasi, untuk <optgroup>. */
export const OPSI_WILAYAH_PER_KOTA: { kota: string; wilayah: OpsiWilayah[] }[] =
  [...new Set(OPSI_WILAYAH.map((wilayah) => wilayah.kota))].map((kota) => ({
    kota,
    wilayah: OPSI_WILAYAH.filter((wilayah) => wilayah.kota === kota),
  }));

export const OPSI_PROGRAM: OpsiProgram[] = PROGRAM.map((program) => ({
  value: program.id,
  label: program.nama,
  deskripsi: program.deskripsi,
  jumlahWilayah: wilayahPerProgram.get(program.id)?.size ?? 0,
}));

export const OPSI_PERIODE: OpsiPeriode[] = TAHUN_TERSEDIA.map((tahun) => ({
  value: tahun,
  label: `Tahun ${tahun}`,
  jumlahWilayah: wilayahPerTahun.get(tahun)?.size ?? 0,
}));

/** Cari opsi wilayah berdasarkan kodenya (untuk chip filter). */
export function cariOpsiWilayah(kode: string): OpsiWilayah | undefined {
  return OPSI_WILAYAH.find((wilayah) => wilayah.value === kode);
}

/** Cari opsi program berdasarkan id-nya (untuk chip filter). */
export function cariOpsiProgram(id: string): OpsiProgram | undefined {
  return OPSI_PROGRAM.find((program) => program.value === id);
}
