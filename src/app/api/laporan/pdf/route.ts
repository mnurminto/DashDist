import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { buatLaporanPdf, namaBerkasPdf } from "@/services/laporan.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/laporan/pdf
 *
 * Berkas PDF laporan sesuai filter URL. Nama berkas ikut filter supaya
 * unduhan mudah dikenali.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const filter = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    await validasiFilter(filter);

    const { bytes } = await buatLaporanPdf(filter);

    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${namaBerkasPdf(filter)}"`,
        "Content-Length": String(bytes.byteLength),
      },
    });
  });
}
