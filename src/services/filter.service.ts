import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { program, wilayah } from "@/db/schema";
import { ApiError } from "@/lib/api";
import type { SebaranQuery } from "@/validators/sebaran";

/**
 * Memastikan kode filter benar-benar ada di database.
 *
 * Tanpa ini, kode salah ketik akan tampil sebagai "tidak ada data" dan sulit
 * dibedakan dari filter yang sah tetapi kebetulan kosong.
 */
export async function validasiFilter(filter: SebaranQuery): Promise<void> {
  if (filter.wilayah) {
    const baris = await db
      .select({ id: wilayah.id })
      .from(wilayah)
      .where(eq(wilayah.kode, filter.wilayah))
      .limit(1);

    if (baris.length === 0)
      throw new ApiError(
        422,
        "WILAYAH_TIDAK_DIKENAL",
        `Wilayah "${filter.wilayah}" tidak terdaftar.`,
      );
  }

  if (filter.program) {
    const baris = await db
      .select({ id: program.id })
      .from(program)
      .where(eq(program.kode, filter.program))
      .limit(1);

    if (baris.length === 0)
      throw new ApiError(
        422,
        "PROGRAM_TIDAK_DIKENAL",
        `Program "${filter.program}" tidak terdaftar.`,
      );
  }

  if (filter.periode && filter.periode > new Date().getFullYear() + 1)
    throw new ApiError(
      422,
      "PERIODE_TIDAK_VALID",
      "Periode belum bisa melewati tahun depan.",
    );
}
