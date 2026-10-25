import { withPublicApi } from "@/lib/api";
import { validasiFilter } from "@/services/filter.service";
import { getPerKota, getSebaran } from "@/services/sebaran.service";
import { filterQuerySchema } from "@/validators/filter";

export const runtime = "nodejs";

/**
 * GET /api/filter
 *
 * Satu panggilan untuk seluruh kebutuhan dashboard saat filter berubah:
 * total, angka per kecamatan, gabungan per kota, tren tahunan, dan waktu
 * pembaruan. Menerima sentinel `semua` dari UI.
 *
 * Contoh: `/api/filter?wilayah=semua&program=beasiswa&periode=2025`
 *
 * Kode wilayah/program yang tidak terdaftar ditolak dengan 422 supaya tidak
 * tertukar dengan filter yang sah tetapi kebetulan kosong.
 */
export function GET(request: Request) {
  return withPublicApi(async () => {
    const filter = filterQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    await validasiFilter(filter);

    const [sebaran, perKota] = await Promise.all([
      getSebaran(filter),
      getPerKota(filter),
    ]);

    return Response.json({
      data: {
        filter: {
          wilayah: filter.wilayah ?? "semua",
          program: filter.program ?? "semua",
          periode: filter.periode?.toString() ?? "semua",
        },
        total: sebaran.total,
        perWilayah: sebaran.perWilayah,
        perKota,
        tren: sebaran.tren,
        /** True kalau filter sah tetapi memang belum ada penyaluran. */
        kosong: sebaran.total.transaksi === 0,
        diperbaruiPada: sebaran.diperbaruiPada,
      },
    });
  });
}
