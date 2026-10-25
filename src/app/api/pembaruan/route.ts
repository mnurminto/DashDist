import { z } from "zod";
import { withPublicApi } from "@/lib/api";
import {
  getPembaruanTerakhir,
  getRiwayatPembaruan,
} from "@/services/pembaruan.service";

export const runtime = "nodejs";

const querySchema = z.object({
  riwayat: z.coerce.number().int().min(1).max(20).default(5),
});

/**
 * GET /api/pembaruan
 *
 * Waktu pembaruan terakhir beserta riwayat terbaru untuk indikator dan panel
 * notifikasi. Publik karena hanya berisi metadata, bukan data pribadi.
 */
export function GET(request: Request) {
  return withPublicApi(
    async () => {
      const { riwayat } = querySchema.parse(
        Object.fromEntries(new URL(request.url).searchParams),
      );

      const [terakhir, daftar] = await Promise.all([
        getPembaruanTerakhir(),
        getRiwayatPembaruan(riwayat),
      ]);

      return Response.json({
        data: {
          terakhir,
          riwayat: daftar,
          jumlahRiwayat: daftar.length,
        },
      });
    },
    // Metadata berubah hanya saat impor, cukup cache pendek.
    { cache: "public, s-maxage=30, stale-while-revalidate=120" },
  );
}
