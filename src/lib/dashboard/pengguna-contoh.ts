import type { Peran } from "./auth-tiruan";

/** Daftar pengguna contoh untuk halaman admin (belum dari database). */

export type PenggunaAdmin = {
  id: string;
  nama: string;
  email: string;
  peran: Peran;
  /** true = akun aktif, false = dinonaktifkan. */
  aktif: boolean;
  /** ISO date kapan terakhir masuk, null = belum pernah. */
  terakhirMasuk: string | null;
};

export const PENGGUNA_ADMIN: readonly PenggunaAdmin[] = [
  {
    id: "u-1",
    nama: "Rani Staf",
    email: "staf@baznas.go.id",
    peran: "staf",
    aktif: true,
    terakhirMasuk: "2026-10-25",
  },
  {
    id: "u-2",
    nama: "Pak Pimpinan",
    email: "pimpinan@baznas.go.id",
    peran: "pimpinan",
    aktif: true,
    terakhirMasuk: "2026-10-24",
  },
  {
    id: "u-3",
    nama: "Dewi Bendahara",
    email: "dewi.bendahara@baznas.go.id",
    peran: "staf",
    aktif: true,
    terakhirMasuk: "2026-10-22",
  },
  {
    id: "u-4",
    nama: "Agus Operator",
    email: "agus.operator@baznas.go.id",
    peran: "staf",
    aktif: true,
    terakhirMasuk: "2026-10-19",
  },
  {
    id: "u-5",
    nama: "Siti Pimpinan",
    email: "siti.pimpinan@baznas.go.id",
    peran: "pimpinan",
    aktif: true,
    terakhirMasuk: null,
  },
  {
    id: "u-6",
    nama: "Budi Verifikator",
    email: "budi.verifikator@baznas.go.id",
    peran: "staf",
    aktif: false,
    terakhirMasuk: "2025-12-30",
  },
];

export const LABEL_PERAN: Record<Peran, string> = {
  staf: "Staf",
  pimpinan: "Pimpinan",
};
