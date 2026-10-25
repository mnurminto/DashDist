import "server-only";
import { auth } from "@/lib/auth";
import { withApiPermission } from "@/lib/api";
import type { Permissions } from "@/lib/permissions";

/**
 * Satu tempat untuk aturan "siapa boleh melihat data rinci".
 *
 * Ringkasan agregat itu publik; data per penerima bersifat pribadi. Kalau
 * aturan berubah, cukup ubah di sini agar semua endpoint rinci ikut berubah.
 */

export const IZIN_RINCI: Permissions = { penyaluran: ["read-penerima"] };

/** Apakah pengguna ini boleh membaca data penerima? */
export async function bolehLihatRinci(userId: string) {
  const { success } = await auth.api.userHasPermission({
    body: { userId, permissions: IZIN_RINCI },
  });
  return success;
}

/**
 * Pembungkus endpoint rinci: wajib sesi + izin `penyaluran:read-penerima`.
 * Tanpa sesi → 401, tanpa izin → 403, keduanya sebelum menyentuh database.
 */
export function withApiRinci(
  request: Request,
  handler: (session: {
    user: { id: string; name: string; email: string };
    session: { id: string };
  }) => Promise<Response>,
) {
  return withApiPermission(request, IZIN_RINCI, (session) => handler(session));
}
