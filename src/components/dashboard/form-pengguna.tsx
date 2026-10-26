"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Peran } from "@/lib/dashboard/auth-tiruan";
import type { PenggunaAdmin } from "@/lib/dashboard/pengguna-contoh";

type Props = {
  /** Pengguna yang diubah; null berarti tambah baru. */
  awal: PenggunaAdmin | null;
  /** Email yang sudah dipakai, untuk mencegah duplikat. */
  emailTerpakai: readonly string[];
  onSimpan: (
    data: Omit<PenggunaAdmin, "id" | "terakhirMasuk"> & { id?: string },
  ) => void;
  onTutup: () => void;
};

type Galat = Partial<Record<"nama" | "email", string>>;

const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Dialog tambah/ubah pengguna dengan validasi sederhana. */
export function FormPengguna({
  awal,
  emailTerpakai,
  onSimpan,
  onTutup,
}: Props) {
  const [nama, setNama] = useState(awal?.nama ?? "");
  const [email, setEmail] = useState(awal?.email ?? "");
  const [peran, setPeran] = useState<Peran>(awal?.peran ?? "staf");
  const [aktif, setAktif] = useState(awal?.aktif ?? true);
  const [galat, setGalat] = useState<Galat>({});
  const kotakRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function saatTombol(e: KeyboardEvent) {
      if (e.key === "Escape") onTutup();
    }
    document.addEventListener("keydown", saatTombol);
    kotakRef.current?.querySelector<HTMLInputElement>("input")?.focus();
    return () => document.removeEventListener("keydown", saatTombol);
  }, [onTutup]);

  function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const baru: Galat = {};
    if (nama.trim().length < 2) baru.nama = "Nama minimal 2 karakter.";
    if (!POLA_EMAIL.test(email.trim()))
      baru.email = "Format email belum benar.";
    else if (
      emailTerpakai.some(
        (item) =>
          item.toLowerCase() === email.trim().toLowerCase() &&
          item.toLowerCase() !== (awal?.email ?? "").toLowerCase(),
      )
    )
      baru.email = "Email ini sudah dipakai pengguna lain.";

    if (Object.keys(baru).length > 0) {
      setGalat(baru);
      return;
    }

    onSimpan({
      id: awal?.id,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      peran,
      aktif,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <div
        ref={kotakRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="judul-form-pengguna"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="judul-form-pengguna"
              className="text-sm font-semibold tracking-tight"
            >
              {awal ? "Ubah pengguna" : "Tambah pengguna"}
            </h2>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {awal
                ? "Perbarui data akun lalu simpan."
                : "Buat akun baru dengan peran dan status."}
            </p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup formulir"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={kirim} className="mt-4 space-y-3" noValidate>
          <label className="block">
            <span className="text-[11px] font-medium text-muted-foreground">
              Nama
            </span>
            <Input
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              aria-invalid={galat.nama ? true : undefined}
              className="mt-1.5 h-9 text-xs"
              placeholder="Nama lengkap"
            />
            {galat.nama && (
              <span className="mt-1 block text-[10px] text-destructive">
                {galat.nama}
              </span>
            )}
          </label>

          <label className="block">
            <span className="text-[11px] font-medium text-muted-foreground">
              Email
            </span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={galat.email ? true : undefined}
              className="mt-1.5 h-9 text-xs"
              placeholder="nama@baznas.go.id"
            />
            {galat.email && (
              <span className="mt-1 block text-[10px] text-destructive">
                {galat.email}
              </span>
            )}
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-[11px] font-medium text-muted-foreground">
                Peran
              </span>
              <select
                value={peran}
                onChange={(e) => setPeran(e.target.value as Peran)}
                className="select-dark mt-1.5 h-9 w-full appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
              >
                <option value="staf">Staf</option>
                <option value="pimpinan">Pimpinan</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[11px] font-medium text-muted-foreground">
                Status
              </span>
              <select
                value={aktif ? "aktif" : "nonaktif"}
                onChange={(e) => setAktif(e.target.value === "aktif")}
                className="select-dark mt-1.5 h-9 w-full appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onTutup}>
              Batal
            </Button>
            <Button type="submit" size="sm">
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
