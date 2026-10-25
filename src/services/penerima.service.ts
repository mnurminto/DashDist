import "server-only";
import { and, asc, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  penerimaManfaat,
  penyaluranBantuan,
  program,
  wilayah,
} from "@/db/schema";

export type PenerimaWilayah = {
  id: string;
  /** Nama yang sudah disamarkan, mis. "Siti A.". */
  nama: string;
  kategori: string;
  program: string;
  dana: number;
  /** Tanggal ISO (YYYY-MM-DD). */
  tanggal: string;
};

/**
 * Samarkan nama penerima: nama depan tetap, nama belakang jadi inisial.
 * Data penerima bersifat pribadi, jadi API pun tidak mengirim nama lengkap.
 */
export function samarkanNama(nama: string) {
  const bagian = nama.trim().split(/\s+/);
  if (bagian.length === 1) return bagian[0];
  const belakang = bagian[bagian.length - 1];
  return `${bagian.slice(0, -1).join(" ")} ${belakang.charAt(0).toUpperCase()}.`;
}

type Opsi = {
  /** Jumlah baris per halaman (1–100). */
  perHalaman?: number;
  /** Halaman mulai dari 1. */
  halaman?: number;
  kategori?: string;
  cari?: string;
};

export type HasilPenerima = {
  wilayah: { kode: string; nama: string };
  penerima: PenerimaWilayah[];
  total: number;
  halaman: number;
  perHalaman: number;
  totalHalaman: number;
  kategoriTersedia: string[];
};

/**
 * Daftar penerima di satu wilayah (sudah disamarkan) dengan paginasi.
 * Mengembalikan `null` bila kode wilayah tidak terdaftar.
 */
export async function getPenerimaWilayah(
  kode: string,
  opsi: Opsi = {},
): Promise<HasilPenerima | null> {
  const [wilayahBaris] = await db
    .select({ id: wilayah.id, kode: wilayah.kode, nama: wilayah.nama })
    .from(wilayah)
    .where(eq(wilayah.kode, kode))
    .limit(1);

  if (!wilayahBaris) return null;

  const perHalaman = Math.min(Math.max(opsi.perHalaman ?? 20, 1), 100);
  const halaman = Math.max(opsi.halaman ?? 1, 1);

  const syarat: SQL[] = [eq(penyaluranBantuan.wilayahId, wilayahBaris.id)];
  if (opsi.kategori) syarat.push(eq(penerimaManfaat.kategori, opsi.kategori));
  if (opsi.cari) syarat.push(ilike(penerimaManfaat.nama, `${opsi.cari}%`));
  const where = and(...syarat);

  const daftarKategori = await db
    .selectDistinct({ kategori: penerimaManfaat.kategori })
    .from(penyaluranBantuan)
    .innerJoin(
      penerimaManfaat,
      eq(penyaluranBantuan.penerimaId, penerimaManfaat.id),
    )
    .where(eq(penyaluranBantuan.wilayahId, wilayahBaris.id))
    .orderBy(asc(penerimaManfaat.kategori));

  const [hitung] = await db
    .select({ total: count() })
    .from(penyaluranBantuan)
    .innerJoin(
      penerimaManfaat,
      eq(penyaluranBantuan.penerimaId, penerimaManfaat.id),
    )
    .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
    .where(where);

  const total = Number(hitung?.total ?? 0);

  const baris = await db
    .select({
      id: penyaluranBantuan.id,
      nama: penerimaManfaat.nama,
      kategori: penerimaManfaat.kategori,
      program: program.nama,
      dana: penyaluranBantuan.jumlahDana,
      tanggal: penyaluranBantuan.tanggal,
    })
    .from(penyaluranBantuan)
    .innerJoin(
      penerimaManfaat,
      eq(penyaluranBantuan.penerimaId, penerimaManfaat.id),
    )
    .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
    .where(where)
    .orderBy(desc(penyaluranBantuan.tanggal), desc(penyaluranBantuan.id))
    .limit(perHalaman)
    .offset((halaman - 1) * perHalaman);

  return {
    wilayah: { kode: wilayahBaris.kode, nama: wilayahBaris.nama },
    penerima: baris.map((item) => ({
      id: item.id,
      nama: samarkanNama(item.nama),
      kategori: item.kategori,
      program: item.program,
      dana: Number(item.dana),
      tanggal:
        item.tanggal instanceof Date
          ? item.tanggal.toISOString().slice(0, 10)
          : String(item.tanggal),
    })),
    total,
    halaman,
    perHalaman,
    totalHalaman: Math.max(Math.ceil(total / perHalaman), 1),
    kategoriTersedia: daftarKategori.map((item) => item.kategori),
  };
}
