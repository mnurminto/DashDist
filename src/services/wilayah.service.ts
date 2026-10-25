import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  logPembaruanData,
  penerimaManfaat,
  penyaluranBantuan,
  program,
  wilayah,
} from "@/db/schema";
import type { RingkasanSebaran } from "@/services/sebaran.service";

export type DetailWilayah = {
  wilayah: {
    kode: string;
    nama: string;
    kota: string;
    tipe: string;
  };
  total: RingkasanSebaran;
  perProgram: {
    kode: string;
    nama: string;
    penerima: number;
    dana: number;
    transaksi: number;
  }[];
  perKategori: {
    kategori: string;
    penerima: number;
    dana: number;
  }[];
  tren: { tahun: number; dana: number }[];
  diperbaruiPada: string | null;
};

const induk = alias(wilayah, "induk");
const DANA = sql<string>`coalesce(sum(${penyaluranBantuan.jumlahDana}), 0)::text`;

type OpsiDetail = { program?: string; periode?: number };

function syaratDetail(wilayahId: string, opsi: OpsiDetail, periode = true) {
  const daftar = [eq(penyaluranBantuan.wilayahId, wilayahId)];
  if (opsi.program) daftar.push(eq(program.kode, opsi.program));
  if (periode && opsi.periode)
    daftar.push(
      sql`extract(year from ${penyaluranBantuan.tanggal}) = ${opsi.periode}`,
    );
  return and(...daftar);
}

/**
 * Ringkasan satu wilayah: angka utama, rincian per program, per kategori
 * penerima, dan tren tahunan. Mengembalikan null kalau kode tidak dikenal.
 */
export async function getDetailWilayah(
  kode: string,
  opsi: OpsiDetail = {},
): Promise<DetailWilayah | null> {
  const [wilayahRows] = await Promise.all([
    db
      .select({
        id: wilayah.id,
        kode: wilayah.kode,
        nama: wilayah.nama,
        tipe: wilayah.tipe,
        kota: sql<string>`coalesce(${induk.nama}, ${wilayah.nama})`,
      })
      .from(wilayah)
      .leftJoin(induk, eq(wilayah.parentId, induk.id))
      .where(eq(wilayah.kode, kode))
      .limit(1),
  ]);

  const data = wilayahRows[0];
  if (!data) return null;

  const where = syaratDetail(data.id, opsi);
  const whereTanpaPeriode = syaratDetail(data.id, opsi, false);

  const [totalRows, perProgramRows, perKategoriRows, trenRows, kesegaran] =
    await Promise.all([
      db
        .select({
          penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
          dana: DANA,
          transaksi: sql<number>`count(*)::int`,
          program: sql<number>`count(distinct ${penyaluranBantuan.programId})::int`,
        })
        .from(penyaluranBantuan)
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where),

      db
        .select({
          kode: program.kode,
          nama: program.nama,
          penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
          dana: DANA,
          transaksi: sql<number>`count(*)::int`,
        })
        .from(penyaluranBantuan)
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where)
        .groupBy(program.kode, program.nama)
        .orderBy(sql`sum(${penyaluranBantuan.jumlahDana}) desc`),

      db
        .select({
          kategori: penerimaManfaat.kategori,
          penerima: sql<number>`count(distinct ${penyaluranBantuan.penerimaId})::int`,
          dana: DANA,
        })
        .from(penyaluranBantuan)
        .innerJoin(
          penerimaManfaat,
          eq(penyaluranBantuan.penerimaId, penerimaManfaat.id),
        )
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where)
        .groupBy(penerimaManfaat.kategori)
        .orderBy(sql`sum(${penyaluranBantuan.jumlahDana}) desc`),

      db
        .select({
          tahun: sql<number>`extract(year from ${penyaluranBantuan.tanggal})::int`,
          dana: DANA,
        })
        .from(penyaluranBantuan)
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
        .innerJoin(program, eq(penyaluranBantuan.programId, program.id))
        .where(where),
    ]);

  const [logTerakhir] = await db
    .select({ terakhir: sql<string | null>`max(${logPembaruanData.waktu})` })
    .from(logPembaruanData);

  const total = totalRows[0];
  const terakhir = [kesegaran[0]?.terakhir, logTerakhir?.terakhir]
    .filter((nilai): nilai is string => Boolean(nilai))
    .sort()
    .at(-1);

  return {
    wilayah: {
      kode: data.kode,
      nama: data.nama,
      kota: data.kota,
      tipe: data.tipe,
    },
    total: {
      penerima: Number(total?.penerima ?? 0),
      dana: Number(total?.dana ?? 0),
      transaksi: Number(total?.transaksi ?? 0),
      program: Number(total?.program ?? 0),
      wilayah: 1,
    },
    perProgram: perProgramRows.map((baris) => ({
      kode: baris.kode,
      nama: baris.nama,
      penerima: Number(baris.penerima),
      dana: Number(baris.dana),
      transaksi: Number(baris.transaksi),
    })),
    perKategori: perKategoriRows.map((baris) => ({
      kategori: baris.kategori,
      penerima: Number(baris.penerima),
      dana: Number(baris.dana),
    })),
    tren: trenRows.map((baris) => ({
      tahun: Number(baris.tahun),
      dana: Number(baris.dana),
    })),
    diperbaruiPada: terakhir ? new Date(terakhir).toISOString() : null,
  };
}
