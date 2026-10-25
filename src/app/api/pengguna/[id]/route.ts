import { z } from "zod";
import { auth } from "@/lib/auth";
import { ApiError, readJson, withApiPermission } from "@/lib/api";

export const runtime = "nodejs";

const paramsSchema = z.object({ id: z.string().min(1) });

const ubahSchema = z
  .object({
    nama: z.string().trim().min(2).max(120).optional(),
    peran: z.enum(["user", "admin"]).optional(),
    aktif: z.boolean().optional(),
  })
  .refine((nilai) => Object.keys(nilai).length > 0, {
    message: "Kirim minimal satu perubahan.",
  });

async function ambilPengguna(id: string, headers: Headers) {
  try {
    const hasil = await auth.api.getUser({ query: { id }, headers });
    return hasil ?? null;
  } catch {
    return null;
  }
}

/**
 * PATCH /api/pengguna/[id] — ubah nama, peran, atau status aktif.
 * Peran memakai `setRole` milik plugin admin agar aturan ban/role tetap konsisten.
 */
export function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiPermission(request, { user: ["update"] }, async (session) => {
    const { id } = paramsSchema.parse(await params);
    const body = ubahSchema.parse(await readJson(request));

    // Jangan sampai admin mengunci dirinya sendiri: turunkan peran atau
    // menonaktifkan akun sendiri akan menghilangkan akses secara permanen.
    const diriSendiri = id === session.user.id;
    if (diriSendiri && body.peran === "user")
      throw new ApiError(
        400,
        "TIDAK_BISA_TURUNKAN_PERAN_SENDIRI",
        "Peran akun yang sedang dipakai tidak bisa diturunkan.",
      );
    if (diriSendiri && body.aktif === false)
      throw new ApiError(
        400,
        "TIDAK_BISA_NONAKTIFKAN_SENDIRI",
        "Akun yang sedang dipakai tidak bisa dinonaktifkan.",
      );

    const ada = await ambilPengguna(id, request.headers);
    if (!ada)
      throw new ApiError(404, "PENGGUNA_TIDAK_DITEMUKAN", "Akun tidak ada.");

    if (body.nama) {
      await auth.api.adminUpdateUser({
        body: { userId: id, data: { name: body.nama } },
        headers: request.headers,
      });
    }

    if (body.peran) {
      await auth.api.setRole({
        body: { userId: id, role: body.peran },
        headers: request.headers,
      });
    }

    if (body.aktif === true) {
      await auth.api.unbanUser({
        body: { userId: id },
        headers: request.headers,
      });
    } else if (body.aktif === false) {
      await auth.api.banUser({
        body: { userId: id, banReason: "Dinonaktifkan admin" },
        headers: request.headers,
      });
    }

    return Response.json({
      data: {
        pengguna: {
          id,
          nama: body.nama ?? ada.name,
          email: ada.email,
          peran: body.peran ?? ada.role ?? "user",
          aktif: body.aktif ?? !ada.banned,
        },
      },
    });
  });
}

/** DELETE /api/pengguna/[id] — hapus akun (khusus admin). */
export function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withApiPermission(request, { user: ["delete"] }, async (session) => {
    const { id } = paramsSchema.parse(await params);

    if (id === session.user.id)
      throw new ApiError(
        400,
        "TIDAK_BISA_HAPUS_SENDIRI",
        "Akun yang sedang dipakai tidak bisa dihapus.",
      );

    const ada = await ambilPengguna(id, request.headers);
    if (!ada)
      throw new ApiError(404, "PENGGUNA_TIDAK_DITEMUKAN", "Akun tidak ada.");

    await auth.api.removeUser({
      body: { userId: id },
      headers: request.headers,
    });

    return Response.json({ data: { id, dihapus: true } });
  });
}
