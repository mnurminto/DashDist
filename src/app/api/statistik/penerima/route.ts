import { withPublicApi } from "@/lib/api";
import { getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/statistik/penerima
 *
 * Total penerima manfaat (orang unik) untuk filter yang sedang aktif.
 * Dipakai kartu KPI "Penerima manfaat" di dashboard publik.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const sebaran = await getSebaran(query);
    return Response.json({
      data: {
        penerima: sebaran.total.penerima,
        transaksi: sebaran.total.transaksi,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
