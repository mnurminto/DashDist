import { auth } from "@/lib/auth";
import { withApiSession } from "@/lib/api";

export const runtime = "nodejs";

/**
 * GET /api/sesi
 *
 * Sesi aktif beserta peran dan hak akses efektifnya. Dipakai UI untuk
 * menampilkan nama pengguna dan menyembunyikan menu yang tidak diizinkan.
 */
export function GET(request: Request) {
  return withApiSession(request, async (session) => {
    const [penerima, catatan] = await Promise.all([
      auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permissions: { penyaluran: ["read-penerima"] },
        },
      }),
      auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permissions: { notes: ["read-any"] },
        },
      }),
    ]);

    return Response.json({
      data: {
        pengguna: {
          id: session.user.id,
          nama: session.user.name,
          email: session.user.email,
          peran: session.user.role ?? "user",
          emailTerverifikasi: session.user.emailVerified,
        },
        hak: {
          lihatPenerima: penerima.success,
          bacaCatatan: catatan.success,
        },
        sesi: {
          id: session.session.id,
          kedaluwarsa: session.session.expiresAt,
        },
      },
    });
  });
}
