import { withPublicApi } from "@/lib/api";
import { getRingkasanProgram } from "@/services/program.service";
import { getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/statistik/program
 *
 * Jumlah program aktif (katalog) dan berapa program yang benar-benar
 * menyalurkan pada filter yang sedang dipakai.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const [katalog, sebaran] = await Promise.all([
      getRingkasanProgram(),
      getSebaran(query),
    ]);

    return Response.json({
      data: {
        total: katalog.total,
        aktif: katalog.aktif,
        selesai: katalog.selesai,
        menyalurkan: sebaran.total.program,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
