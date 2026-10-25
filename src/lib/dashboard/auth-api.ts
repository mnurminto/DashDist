"use client";

import { masukTiruan, HAK_PERAN, type PenggunaTiruan } from "./auth-tiruan";

/**
 * Penghubung UI masuk ke backend.
 *
 * Alur: coba endpoint Better Auth `/api/auth/sign-in/email`. Bila server
 * menolak (mis. database belum berisi akun) atau tidak terjangkau, akun
 * contoh tetap bisa dipakai supaya demo frontend tidak macet.
 */

export type HasilMasuk =
  | { ok: true; pengguna: PenggunaTiruan; mode: "api" | "contoh" }
  | { ok: false; pesan: string };

function dariUser(user: {
  email?: string | null;
  name?: string | null;
  role?: string | null;
}): PenggunaTiruan {
  const peran = user.role?.includes("pimpinan") ? "pimpinan" : "staf";
  const hak = HAK_PERAN[peran];
  return {
    email: user.email ?? "",
    nama: user.name ?? user.email ?? "Pengguna",
    peran,
    akses: hak.bolehUnduh
      ? "Unduh laporan & lihat penerima"
      : "Ringkasan & perbandingan saja",
  };
}

export async function masukLewatApi(
  email: string,
  sandi: string,
): Promise<HasilMasuk> {
  try {
    const res = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: sandi }),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        user?: { email?: string; name?: string; role?: string };
      };
      if (data?.user) {
        return { ok: true, pengguna: dariUser(data.user), mode: "api" };
      }
    }

    // 401/403 berarti kredensial ditolak; coba akun contoh sebelum menyerah.
    const contoh = masukTiruan(email, sandi);
    if (contoh) return { ok: true, pengguna: contoh, mode: "contoh" };

    if (res.status === 401 || res.status === 403)
      return { ok: false, pesan: "Email atau kata sandi tidak cocok." };

    return {
      ok: false,
      pesan: "Server belum bisa memproses permintaan. Coba lagi.",
    };
  } catch {
    const contoh = masukTiruan(email, sandi);
    if (contoh) return { ok: true, pengguna: contoh, mode: "contoh" };
    return {
      ok: false,
      pesan: "Tidak dapat menghubungi server. Periksa koneksi lalu coba lagi.",
    };
  }
}
