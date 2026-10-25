import { z } from "zod";
import { withPublicApi } from "@/lib/api";
import { getStatusPembaruan } from "@/services/pembaruan.service";

export const runtime = "nodejs";

const querySchema = z.object({
  /** Waktu terakhir yang sudah dilihat pengguna (ISO 8601). */
  sejak: z.iso.datetime({ offset: true }).optional(),
});

/**
 * GET /api/pembaruan/status?sejak=<ISO>
 *
 * Menjawab "apakah ada data baru sejak terakhir saya lihat?", sehingga UI
 * bisa menyalakan penanda tanpa mengunduh seluruh riwayat.
 */
export function GET(request: Request) {
  return withPublicApi(
    async () => {
      const { sejak } = querySchema.parse(
        Object.fromEntries(new URL(request.url).searchParams),
      );

      const status = await getStatusPembaruan(
        sejak ? new Date(sejak) : undefined,
      );

      return Response.json({ data: status });
    },
    { cache: "public, s-maxage=15, stale-while-revalidate=45" },
  );
}
