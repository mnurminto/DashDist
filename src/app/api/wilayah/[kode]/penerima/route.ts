import { z } from "zod";
import { ApiError, withApiPermission } from "@/lib/api";
import { getPenerimaWilayah } from "@/services/penerima.service";

export const runtime = "nodejs";

const querySchema = z.object({
  perHalaman: z.coerce.number().int().min(1).max(100).default(20),
  halaman: z.coerce.number().int().min(1).max(10_000).default(1),
  kategori: z.enum(["fakir", "miskin", "yatim", "dhuafa", "lansia"]).optional(),
  cari: z.string().trim().min(1).max(60).optional(),
});

/**
 * GET /api/wilayah/[kode]/penerima
 *
 * Daftar penerima (nama disamarkan) dengan paginasi, filter kategori, dan
 * pencarian nama. Wajib sesi + izin `penyaluran:read-penerima`; tanpa itu API
 * menolak sebelum menyentuh database.
 */
export function GET(
  request: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  return withApiPermission(
    request,
    { penyaluran: ["read-penerima"] },
    async () => {
      const { kode } = await params;
      const query = querySchema.parse(
        Object.fromEntries(new URL(request.url).searchParams),
      );

      const hasil = await getPenerimaWilayah(kode, query);
      if (!hasil)
        throw new ApiError(
          404,
          "WILAYAH_TIDAK_DITEMUKAN",
          `Wilayah "${kode}" tidak terdaftar.`,
        );

      return Response.json({ data: hasil });
    },
  );
}
