import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { getBulanan } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/grafik/bulanan
 *
 * Deret dana bantuan per bulan untuk grafik tren. Filter opsional:
 * `?wilayah=<kode>&program=<kode>&periode=<tahun>`.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    await validasiFilter(query);

    const seri = await getBulanan(query);
    const total = seri.reduce((jumlah, titik) => jumlah + titik.dana, 0);

    return Response.json({
      data: {
        seri,
        total,
        jumlahBulan: seri.length,
      },
    });
  });
}
