import { withPublicApi } from "@/lib/api";
import { getPerKota, getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/statistik/wilayah
 *
 * Ringkasan angka per wilayah pada filter aktif: rincian per kecamatan dan
 * gabungan per kota administrasi.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const [sebaran, perKota] = await Promise.all([
      getSebaran(query),
      getPerKota(query),
    ]);

    return Response.json({
      data: {
        perWilayah: sebaran.perWilayah,
        perKota,
        total: sebaran.total,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
