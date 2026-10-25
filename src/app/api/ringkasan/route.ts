import { withPublicApi } from "@/lib/api";
import {
  getPerKota,
  getPeringkatWilayah,
  getSebaran,
} from "@/services/sebaran.service";
import { sebaranQuerySchema } from "@/validators/sebaran";
import { getPembaruanTerakhir } from "@/services/pembaruan.service";
import { validasiFilter } from "@/services/filter.service";

export const runtime = "nodejs";

/**
 * GET /api/ringkasan
 *
 * Ringkasan publik untuk dashboard tanpa masuk: total agregat, lima wilayah
 * teratas, rekap per kota, dan waktu pembaruan terakhir.
 *
 * Sengaja tidak memuat data pribadi; rincian penerima ada di endpoint berizin.
 */
export function GET(request: Request) {
  return withPublicApi(
    async () => {
      const filter = sebaranQuerySchema.parse(
        Object.fromEntries(new URL(request.url).searchParams),
      );

      await validasiFilter(filter);

      const [sebaran, teratas, perKota, pembaruan] = await Promise.all([
        getSebaran(filter),
        getPeringkatWilayah(filter, 5),
        getPerKota(filter),
        getPembaruanTerakhir(),
      ]);

      return Response.json({
        data: {
          total: sebaran.total,
          teratas: teratas.map((item) => ({
            kode: item.kode,
            nama: item.nama,
            kota: item.kota,
            dana: item.dana,
            penerima: item.penerima,
          })),
          perKota: perKota.map((item) => ({
            kota: item.kota,
            dana: item.dana,
            penerima: item.penerima,
            wilayah: item.wilayah,
          })),
          diperbaruiPada: sebaran.diperbaruiPada,
          /** Impor terakhir: waktu, judul, sumber, jumlah rekaman. */
          pembaruan,
          publik: true,
        },
      });
    },
    // Ringkasan publik boleh di-cache lebih lama karena hanya angka agregat.
    { cache: "public, s-maxage=120, stale-while-revalidate=600" },
  );
}
