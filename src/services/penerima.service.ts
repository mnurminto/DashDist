import "server-only";
import { and, desc, eq, ilike, type SQL } from "drizzle-orm";
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
  limit?: number;
  kategori?: string;
  cari?: string;
};

/**
 * Daftar penerima di satu wilayah (sudah disamarkan).
 * Mengembalikan `null` bila kode wilayah tidak terdaftar.
 */
export async function getPenerimaWilayah(
  kode: string,
  opsi: Opsi = {},
): Promise<{ wilayah: string; penerima: PenerimaWilayah[] } | null> {
  const [wilayahBaris] = await db
    .select({ id: wilayah.id, nama: wilayah.nama })
    .from(wilayah)
    .where(eq(wilayah.kode, kode))
    .limit(1);

  if (!wilayahBaris) return null;

  const syarat: SQL[] = [eq(penyaluranBantuan.wilayahId, wilayahBaris.id)];
  if (opsi.kategori) syarat.push(eq(penerimaManfaat.kategori, opsi.kategori));
  if (opsi.cari) syarat.push(ilike(penerimaManfaat.nama, `${opsi.cari}%`));

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
    .where(and(...syarat))
    .orderBy(desc(penyaluranBantuan.tanggal))
    .limit(opsi.limit ?? 20);

  return {
    wilayah: wilayahBaris.nama,
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
  };
}
