import { z } from "zod";
import { withPublicApi } from "@/lib/api";
import { getBandingkanWilayah } from "@/services/wilayah.service";

export const runtime = "nodejs";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

/**
 * GET /api/wilayah/[kode]/bandingkan
 *
 * Perbandingan dana wilayah ini dengan kecamatan teratas dan rata-rata DKI.
 */
export function GET(
  request: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  return withPublicApi(async () => {
    const { kode } = await params;
    const { limit } = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const hasil = await getBandingkanWilayah(kode, limit);
    if (!hasil)
      return Response.json(
        {
          error: {
            code: "WILAYAH_TIDAK_DITEMUKAN",
            message: `Wilayah "${kode}" tidak terdaftar.`,
          },
        },
        { status: 404 },
      );

    return Response.json({ data: hasil });
  });
}
