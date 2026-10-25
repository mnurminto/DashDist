import { withPublicApi } from "@/lib/api";
import { getProfilWilayah } from "@/services/wilayah.service";

export const runtime = "nodejs";

/**
 * GET /api/wilayah/[kode]
 *
 * Profil ringkas satu wilayah: peringkat, porsi dana DKI, program, dan
 * rata-rata. Hanya angka agregat — tanpa data pribadi penerima.
 */
export function GET(
  _request: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  return withPublicApi(async () => {
    const { kode } = await params;
    const profil = await getProfilWilayah(kode);
    if (!profil)
      return Response.json(
        {
          error: {
            code: "WILAYAH_TIDAK_DITEMUKAN",
            message: `Wilayah "${kode}" tidak terdaftar.`,
          },
        },
        { status: 404 },
      );

    return Response.json({ data: profil });
  });
}
