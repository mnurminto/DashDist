import { z } from "zod";
import { auth } from "@/lib/auth";
import { ApiError, readJson, withApiPermission } from "@/lib/api";

export const runtime = "nodejs";

const querySchema = z.object({
  cari: z.string().trim().max(120).optional(),
  peran: z.enum(["user", "admin"]).optional(),
  perHalaman: z.coerce.number().int().min(1).max(100).default(25),
  halaman: z.coerce.number().int().min(1).max(1000).default(1),
});

const buatSchema = z.object({
  nama: z.string().trim().min(2).max(120),
  email: z.email(),
  sandi: z.string().min(8).max(128),
  peran: z.enum(["user", "admin"]).default("user"),
});

type BarisPengguna = {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  banned?: boolean | null;
  createdAt: Date;
};

function ringkas(daftar: BarisPengguna[]) {
  return daftar.map((item) => ({
    id: item.id,
    nama: item.name,
    email: item.email,
    peran: item.role ?? "user",
    aktif: !item.banned,
    dibuatPada: item.createdAt,
  }));
}

/**
 * GET /api/pengguna — daftar akun (khusus admin).
 */
export function GET(request: Request) {
  return withApiPermission(request, { user: ["list"] }, async () => {
    const query = querySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    const hasil = await auth.api.listUsers({
      query: {
        limit: query.perHalaman,
        offset: (query.halaman - 1) * query.perHalaman,
        searchField: "email",
        searchValue: query.cari ?? "",
        searchOperator: query.cari ? "contains" : undefined,
        filterField: "role",
        filterValue: query.peran,
        filterOperator: query.peran ? "eq" : undefined,
      },
      headers: request.headers,
    });

    return Response.json({
      data: {
        pengguna: ringkas(hasil.users as BarisPengguna[]),
        total: hasil.total,
        halaman: query.halaman,
        perHalaman: query.perHalaman,
      },
    });
  });
}

/**
 * POST /api/pengguna — buat akun baru (khusus admin).
 * Peran tidak bisa dipilih sendiri oleh pengguna; hanya admin di sini.
 */
export function POST(request: Request) {
  return withApiPermission(request, { user: ["create"] }, async () => {
    const body = buatSchema.parse(await readJson(request));

    try {
      const hasil = await auth.api.createUser({
        body: {
          email: body.email,
          password: body.sandi,
          name: body.nama,
          role: body.peran,
        },
        headers: request.headers,
      });

      return Response.json(
        {
          data: {
            pengguna: {
              id: hasil.user.id,
              nama: hasil.user.name,
              email: hasil.user.email,
              peran: body.peran,
              aktif: true,
            },
          },
        },
        { status: 201 },
      );
    } catch {
      throw new ApiError(
        409,
        "PENGGUNA_GAGAL_DIBUAT",
        "Akun tidak bisa dibuat. Periksa apakah email sudah dipakai.",
      );
    }
  });
}
