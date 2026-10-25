"use client";

/**
 * Login tiruan untuk tahap frontend.
 *
 * Belum memakai database atau Better Auth: kredensial diperiksa di browser dan
 * sesi disimpan di localStorage. Nanti diganti backend sungguhan.
 */

export type Peran = "staf" | "pimpinan";

export type PenggunaTiruan = {
  email: string;
  nama: string;
  peran: Peran;
  /** Ringkasan hak akses untuk ditampilkan di UI. */
  akses: string;
};

type AkunTiruan = { pengguna: PenggunaTiruan; sandi: string };

export const AKUN_TIRUAN: readonly AkunTiruan[] = [
  {
    pengguna: {
      email: "staf@baznas.go.id",
      nama: "Rani Staf",
      peran: "staf",
      akses: "Lihat & unduh laporan",
    },
    sandi: "staf123",
  },
  {
    pengguna: {
      email: "pimpinan@baznas.go.id",
      nama: "Pak Pimpinan",
      peran: "pimpinan",
      akses: "Lihat ringkasan & perbandingan",
    },
    sandi: "pimpinan123",
  },
];

const KUNCI_SESI = "baznas.sesi-tiruan";

/** Cocokkan kredensial; mengembalikan pengguna atau null. */
export function masukTiruan(
  email: string,
  sandi: string,
): PenggunaTiruan | null {
  const akun = AKUN_TIRUAN.find(
    (item) =>
      item.pengguna.email.toLowerCase() === email.trim().toLowerCase() &&
      item.sandi === sandi,
  );
  return akun?.pengguna ?? null;
}

export function simpanSesi(pengguna: PenggunaTiruan) {
  try {
    window.localStorage.setItem(KUNCI_SESI, JSON.stringify(pengguna));
  } catch {
    // Mode privat bisa memblokir localStorage; sesi cukup untuk halaman ini.
  }
}

export function bacaSesi(): PenggunaTiruan | null {
  try {
    const mentah = window.localStorage.getItem(KUNCI_SESI);
    if (!mentah) return null;
    const data = JSON.parse(mentah) as PenggunaTiruan;
    if (!data?.email || !data?.peran) return null;
    return data;
  } catch {
    return null;
  }
}

export function hapusSesi() {
  try {
    window.localStorage.removeItem(KUNCI_SESI);
  } catch {
    // abaikan
  }
}
