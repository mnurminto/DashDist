import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { program } from "@/db/schema";

export type RingkasanProgram = {
  /** Semua program yang terdaftar. */
  total: number;
  /** Program dengan status "aktif". */
  aktif: number;
  /** Program dengan status "selesai". */
  selesai: number;
};

/** Jumlah program berdasarkan statusnya (dipakai kartu KPI). */
export async function getRingkasanProgram(): Promise<RingkasanProgram> {
  const [baris] = await db
    .select({
      total: sql<number>`count(*)::int`,
      aktif: sql<number>`(count(*) filter (where ${program.status} = 'aktif'))::int`,
      selesai: sql<number>`(count(*) filter (where ${program.status} = 'selesai'))::int`,
    })
    .from(program);

  return {
    total: Number(baris?.total ?? 0),
    aktif: Number(baris?.aktif ?? 0),
    selesai: Number(baris?.selesai ?? 0),
  };
}
