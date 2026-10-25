import { withPublicApi } from "@/lib/api";
import { susunExcel } from "@/services/excel.service";
import { validasiFilter } from "@/services/filter.service";
import { getLaporan, getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/laporan/excel
 *
 * Berkas Excel (SpreadsheetML) berisi lembar Ringkasan dan Data sesuai filter.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const filter = sebaranQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    await validasiFilter(filter);

    const [baris, sebaran] = await Promise.all([
      getLaporan(filter),
      getSebaran(filter),
    ]);
    const { isi, namaBerkas } = susunExcel(filter, baris, sebaran.total);

    return new Response(isi, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": `attachment; filename="${namaBerkas}"`,
      },
    });
  });
}
