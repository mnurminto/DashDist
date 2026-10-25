import "server-only";
import { and, eq, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  logPembaruanData,
  penyaluranBantuan,
  program,
  wilayah,
} from "@/db/schema";
import type { SebaranQuery } from "@/validators/sebaran";

export type RingkasanSebaran = {
  penerima: number;
  dana: number;
  transaksi: number;
  program: number;
  wilayah: number;
};

export type WilayahSebaran = {
  kode: string;
  nama: string;
  kota: string;
  penerima: number;
  dana: number;
  transaksi: number;
  program: number;
};

export type Sebaran = {
  total: RingkasanSebaran;
  perWilayah: WilayahSebaran[];
  tren: { tahun: number; dana: number }[];
  /** Waktu data terakhir diperbarui (ISO) atau null bila belum ada data. */
  diperbaruiPada: string | null;
};

const induk = alias(wilayah, "induk");

/** Filter wilayah/program/periode yang dipakai semua query di bawah. */
function syarat(filter: SebaranQuery, ikutkanPeriode = true) {
  const daftar = [];
  // Kode bisa berupa kecamatan atau kota administrasi: kalau kota, seluruh
  // kecamatan di bawahnya ikut terpilih.
  if (filter.wilayah)
    daftar.push(
      or(eq(wilayah.kode, filter.wilayah), eq(induk.kode, filter.wilayah)),
    );
  if (filter.program) daftar.push(eq(program.kode, filter.program));
  if (ikutkanPeriode && filter.periode)
    daftar.push(
      sql`extract(year from ${penyaluranBantuan.tanggal}) = ${filter.periode}`,
    );
  return daftar.length > 0 ? and(...daftar) : undefined;
}

const DANA = sql<string>`coalesce(sum(${penyaluranBantuan.jumlahDana}), 0)::text`;

export type KotaSebaran = {
  kota: string;
  wilayah: number;
  penerima: number;
  dana: number;
  transaksi: number;
  program: number;
};

/** Rekap per kota administrasi (gabungan seluruh kecamatan di bawahnya). */
export async function getPerKota(filter: SebaranQuery): Promise<KotaSebaran[]> {
  const baris = await db
    .select({
      kota: sql<string>`coalesce(${induk.nama}, ${wilayah.nama})`,
      wilayah: sql<number>`count(distinct ${penyaluranBantuan.wilayahId})::int`,
      penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
      dana: DANA,
      transaksi: sql<number>`count(*)::int`,
      program: sql<number>`count(distinct ${penyaluranBantuan.programId})::int`,
    })
    .from(penyaluranBantuan)
    .innerJoin(wilayah, eq(penyaluranBantuan.wilayahId, wilayah.id))
    .leftJoin(induk, eq(wilayah.parentId, induk.id))
    .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
    .where(syarat(filter))
    .groupBy(sql`coalesce(${induk.nama}, ${wilayah.nama})`)
    .orderBy(sql`sum(${penyaluranBantuan.jumlahDana}) desc`);

  return baris.map((item) => ({
    kota: item.kota,
    wilayah: Number(item.wilayah),
    penerima: Number(item.penerima),
    dana: Number(item.dana),
    transaksi: Number(item.transaksi),
    program: Number(item.program),
  }));
}

/**
 * Rekap penyaluran bantuan untuk dashboard publik.
 *
 * Hanya angka agregat yang keluar dari fungsi ini — tidak ada nama atau NIK
 * penerima, sehingga aman dipakai endpoint tanpa login.
 */
export async function getSebaran(filter: SebaranQuery): Promise<Sebaran> {
  const where = syarat(filter);
  const whereTanpaPeriode = syarat(filter, false);

  const [totalRows, perWilayahRows, trenRows, kesegaranRows, logRows] =
    await Promise.all([
      db
        .select({
          penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
          dana: DANA,
          transaksi: sql<number>`count(*)::int`,
          program: sql<number>`count(distinct ${penyaluranBantuan.programId})::int`,
          wilayah: sql<number>`count(distinct ${penyaluranBantuan.wilayahId})::int`,
        })
        .from(penyaluranBantuan)
        .innerJoin(wilayah, eq(penyaluranBantuan.wilayahId, wilayah.id))
        .leftJoin(induk, eq(wilayah.parentId, induk.id))
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where),

      db
        .select({
          kode: wilayah.kode,
          nama: wilayah.nama,
          kota: sql<string>`coalesce(${induk.nama}, ${wilayah.nama})`,
          penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
          dana: DANA,
          transaksi: sql<number>`count(*)::int`,
          program: sql<number>`count(distinct ${penyaluranBantuan.programId})::int`,
        })
        .from(penyaluranBantuan)
        .innerJoin(wilayah, eq(penyaluranBantuan.wilayahId, wilayah.id))
        .leftJoin(induk, eq(wilayah.parentId, induk.id))
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where)
        .groupBy(wilayah.kode, wilayah.nama, induk.nama)
        .orderBy(sql`sum(${penyaluranBantuan.jumlahDana}) desc`),

      db
        .select({
          tahun: sql<number>`extract(year from ${penyaluranBantuan.tanggal})::int`,
          dana: DANA,
        })
        .from(penyaluranBantuan)
        .innerJoin(wilayah, eq(penyaluranBantuan.wilayahId, wilayah.id))
        .leftJoin(induk, eq(wilayah.parentId, induk.id))
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(whereTanpaPeriode)
        .groupBy(sql`extract(year from ${penyaluranBantuan.tanggal})`)
        .orderBy(sql`extract(year from ${penyaluranBantuan.tanggal})`),

      db
        .select({
          terakhir: sql<
            string | null
          >`max(${penyaluranBantuan.diperbaruiPada})`,
        })
        .from(penyaluranBantuan)
        .innerJoin(wilayah, eq(penyaluranBantuan.wilayahId, wilayah.id))
        .leftJoin(induk, eq(wilayah.parentId, induk.id))
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where),

      db
        .select({
          terakhir: sql<string | null>`max(${logPembaruanData.waktu})`,
        })
        .from(logPembaruanData),
    ]);

  const total = totalRows[0];
  const perWilayah: WilayahSebaran[] = perWilayahRows.map((baris) => ({
    kode: baris.kode,
    nama: baris.nama,
    kota: baris.kota,
    penerima: Number(baris.penerima),
    dana: Number(baris.dana),
    transaksi: Number(baris.transaksi),
    program: Number(baris.program),
  }));

  const terakhir = [kesegaranRows[0]?.terakhir, logRows[0]?.terakhir]
    .filter((nilai): nilai is string => Boolean(nilai))
    .sort()
    .at(-1);

  return {
    total: {
      penerima: Number(total?.penerima ?? 0),
      dana: Number(total?.dana ?? 0),
      transaksi: Number(total?.transaksi ?? 0),
      program: Number(total?.program ?? 0),
      wilayah: Number(total?.wilayah ?? 0),
    },
    perWilayah,
    tren: trenRows.map((baris) => ({
      tahun: Number(baris.tahun),
      dana: Number(baris.dana),
    })),
    diperbaruiPada: terakhir ? new Date(terakhir).toISOString() : null,
  };
}
