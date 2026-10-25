import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { getLaporan, getSebaran } from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";

export const runtime = "nodejs";

/**
 * GET /api/laporan
 *
 * Data laporan sesuai filter di URL (`wilayah`, `program`, `periode`).
 * Dipakai tombol unduh CSV/Excel/PDF: satu baris = wilayah × program × tahun,
 * ditambah total keseluruhan.
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

    return Response.json({
      data: {
        filter: {
          wilayah: filter.wilayah ?? "semua",
          program: filter.program ?? "semua",
          periode: filter.periode?.toString() ?? "semua",
        },
        total: sebaran.total,
        baris,
        jumlahBaris: baris.length,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
