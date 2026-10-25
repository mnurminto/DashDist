import { withPublicApi } from "@/lib/api";
import { getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/statistik/dana
 *
 * Total dana tersalurkan (rupiah) untuk filter aktif, beserta rata-rata per
 * penerima agar kartu KPI bisa menampilkan konteksnya.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const sebaran = await getSebaran(query);
    const { dana, penerima, transaksi } = sebaran.total;

    return Response.json({
      data: {
        dana,
        penerima,
        transaksi,
        danaPerPenerima: penerima > 0 ? Math.round(dana / penerima) : 0,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
