import "server-only";
import { desc, gt } from "drizzle-orm";
import { db } from "@/db";
import { logPembaruanData } from "@/db/schema";

export type PembaruanData = {
  id: string;
  waktu: string;
  sumber: string;
  jumlahRekaman: number;
  judul: string | null;
  keterangan: string | null;
  lingkup: string | null;
  status: string | null;
};

function keBaris(baris: typeof logPembaruanData.$inferSelect): PembaruanData {
  return {
    id: baris.id,
    waktu: baris.waktu.toISOString(),
    sumber: baris.sumber,
    jumlahRekaman: baris.jumlahRekaman,
    judul: baris.judul,
    keterangan: baris.keterangan,
    lingkup: baris.lingkup,
    status: baris.status,
  };
}

/** Pembaruan terakhir, atau `null` bila belum pernah ada impor. */
export async function getPembaruanTerakhir(): Promise<PembaruanData | null> {
  const [baris] = await db
    .select()
    .from(logPembaruanData)
    .orderBy(desc(logPembaruanData.waktu))
    .limit(1);

  return baris ? keBaris(baris) : null;
}

/** Riwayat pembaruan terbaru (default 5) untuk panel notifikasi. */
export async function getRiwayatPembaruan(limit = 5): Promise<PembaruanData[]> {
  const baris = await db
    .select()
    .from(logPembaruanData)
    .orderBy(desc(logPembaruanData.waktu))
    .limit(Math.min(Math.max(limit, 1), 50));

  return baris.map(keBaris);
}

export type StatusPembaruan = {
  /** Ada pembaruan yang lebih baru dari `sejak` (atau ada data sama sekali). */
  baru: boolean;
  jumlahBaru: number;
  terakhir: PembaruanData | null;
  diperiksaPada: string;
};

/**
 * Cek apakah ada data baru sejak waktu tertentu.
 *
 * Dipakai UI untuk memutuskan apakah lonceng notifikasi perlu menyala.
 * `sejak` kosong berarti "bandingkan dengan tidak ada apa-apa", sehingga
 * pembaruan terakhir selalu dianggap baru.
 */
export async function getStatusPembaruan(
  sejak?: Date,
): Promise<StatusPembaruan> {
  const [terakhir, jumlah] = await Promise.all([
    getPembaruanTerakhir(),
    sejak
      ? db.$count(logPembaruanData, gt(logPembaruanData.waktu, sejak))
      : db.$count(logPembaruanData),
  ]);

  const jumlahBaru = Number(jumlah);
  const baru = sejak ? jumlahBaru > 0 : terakhir !== null;

  return {
    baru,
    jumlahBaru,
    terakhir,
    diperiksaPada: new Date().toISOString(),
  };
}
