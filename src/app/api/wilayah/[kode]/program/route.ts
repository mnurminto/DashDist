import { withPublicApi } from "@/lib/api";
import { getProgramWilayah } from "@/services/wilayah.service";

export const runtime = "nodejs";

/**
 * GET /api/wilayah/[kode]/program
 *
 * Rincian dana per program di satu wilayah, lengkap dengan porsi masing-masing.
 */
export function GET(
  _request: Request,
  { params }: { params: Promise<{ kode: string }> },
) {
  return withPublicApi(async () => {
    const { kode } = await params;
    const hasil = await getProgramWilayah(kode);

    if (!hasil)
      return Response.json(
        {
          error: {
            code: "WILAYAH_TIDAK_DITEMUKAN",
            message: `Wilayah "${kode}" tidak terdaftar.`,
          },
        },
        { status: 404 },
      );

    return Response.json({ data: hasil });
  });
}
