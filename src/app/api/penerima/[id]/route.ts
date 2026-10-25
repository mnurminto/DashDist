import { z } from "zod";
import { ApiError } from "@/lib/api";
import { withApiRinci } from "@/lib/otorisasi";
import { getDetailPenerima } from "@/services/penerima.service";

export const runtime = "nodejs";

const paramsSchema = z.object({
  id: z.string().uuid("Id penerima tidak valid."),
});

/**
 * GET /api/penerima/[id]
 *
 * Rincian satu penerima: nama (disamarkan), kategori, wilayah, serta seluruh
 * riwayat penyaluran. Wajib sesi + izin `penyaluran:read-penerima`.
 */
export function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiRinci(request, async () => {
    const { id } = paramsSchema.parse(await params);

    const hasil = await getDetailPenerima(id);
    if (!hasil)
      throw new ApiError(
        404,
        "PENERIMA_TIDAK_DITEMUKAN",
        `Penerima "${id}" tidak terdaftar.`,
      );

    return Response.json({ data: hasil });
  });
}
