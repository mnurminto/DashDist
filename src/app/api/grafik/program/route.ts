import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { getPerProgram } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/grafik/program
 *
 * Porsi dana tiap program bantuan untuk grafik distribusi.
 * Filter opsional: `?wilayah=<kode>&program=<kode>&periode=<tahun>`.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    await validasiFilter(query);

    const program = await getPerProgram(query);
    const total = program.reduce((jumlah, item) => jumlah + item.dana, 0);

    return Response.json({
      data: {
        program: program.map((item) => ({
          ...item,
          porsi: total > 0 ? (item.dana / total) * 100 : 0,
        })),
        total,
      },
    });
  });
}
