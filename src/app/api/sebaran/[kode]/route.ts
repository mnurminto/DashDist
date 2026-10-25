import { z } from "zod";
import { ApiError, withPublicApi } from "@/lib/api";
import { getDetailWilayah } from "@/services/wilayah.service";

export const runtime = "nodejs";

const kodeSchema = z.string().trim().min(3).max(32);
const querySchema = z.object({
  program: z.string().trim().min(2).max(48).optional(),
  periode: z.coerce.number().int().min(2000).max(2100).optional(),
});

type Context = { params: Promise<{ kode: string }> };

/**
 * GET /api/sebaran/[kode]
 *
 * Ringkasan satu kecamatan: total, rincian per program, per kategori penerima,
 * dan tren tahunan. Filter opsional: `?program=<kode>&periode=<tahun>`.
 */
export function GET(request: Request, context: Context) {
  return withPublicApi(async () => {
    const kode = kodeSchema.parse((await context.params).kode);
    const query = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const detail = await getDetailWilayah(kode, query);
    if (!detail)
      throw new ApiError(404, "NOT_FOUND", "Wilayah tidak ditemukan.");

    return Response.json({ data: detail });
  });
}
