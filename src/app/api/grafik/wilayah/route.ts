import { z } from "zod";
import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { getPeringkatWilayah } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

const querySchema = sebaranQuerySchema.extend({
  /** Jumlah wilayah yang dikembalikan (1–20). */
  limit: z.coerce.number().int().min(1).max(20).default(6),
});

/**
 * GET /api/grafik/wilayah
 *
 * Peringkat wilayah berdasarkan dana untuk grafik perbandingan.
 * Contoh: `/api/grafik/wilayah?limit=6&periode=2025`.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const { limit, ...filter } = query;

    await validasiFilter(filter);

    const peringkat = await getPeringkatWilayah(filter, limit);
    const total = peringkat.reduce((jumlah, item) => jumlah + item.dana, 0);

    return Response.json({
      data: {
        peringkat,
        limit,
        total,
      },
    });
  });
}
