import { withPublicApi } from "@/lib/api";
import { getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/sebaran
 *
 * Rekap sebaran bantuan untuk dashboard publik:
 * `?wilayah=<kode>&program=<kode>&periode=<tahun>` (semua opsional).
 * Hanya angka agregat — tanpa data pribadi penerima.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const query = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return Response.json({ data: await getSebaran(query) });
  });
}
