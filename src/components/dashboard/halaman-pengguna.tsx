"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LockKeyhole, Plus, ShieldAlert, Users } from "lucide-react";
import { DaftarPengguna } from "@/components/dashboard/daftar-pengguna";
import { FormPengguna } from "@/components/dashboard/form-pengguna";
import { Shell } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PENGGUNA_ADMIN,
  type PenggunaAdmin,
} from "@/lib/dashboard/pengguna-contoh";
import { useSesiTiruan } from "@/lib/dashboard/use-sesi";

const KUNCI = "baznas.pengguna-tiruan";

function bacaTersimpan(): PenggunaAdmin[] | null {
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return null;
    const data = JSON.parse(mentah) as PenggunaAdmin[];
    return Array.isArray(data) && data.length > 0 ? data : null;
  } catch {
    return null;
  }
}

function simpan(daftar: PenggunaAdmin[]) {
  try {
    window.localStorage.setItem(KUNCI, JSON.stringify(daftar));
  } catch {
    // abaikan; data tetap ada sampai halaman dimuat ulang
  }
}

/** Halaman admin: daftar pengguna + form tambah/ubah. Khusus peran staf. */
export function HalamanPengguna() {
  const sesi = useSesiTiruan();
  const [daftar, setDaftar] = useState<PenggunaAdmin[]>([...PENGGUNA_ADMIN]);
  const [form, setForm] = useState<{ awal: PenggunaAdmin | null } | null>(null);

  useEffect(() => {
    const tersimpan = bacaTersimpan();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- muat data contoh sekali dari localStorage
    if (tersimpan) setDaftar(tersimpan);
  }, []);

  function simpanData(
    data: Omit<PenggunaAdmin, "id" | "terakhirMasuk"> & { id?: string },
  ) {
    setDaftar((sebelumnya) => {
      const berikutnya = data.id
        ? sebelumnya.map((item) =>
            item.id === data.id
              ? {
                  ...item,
                  nama: data.nama,
                  email: data.email,
                  peran: data.peran,
                  aktif: data.aktif,
                }
              : item,
          )
        : [
            ...sebelumnya,
            {
              id: `u-${Date.now()}`,
              nama: data.nama,
              email: data.email,
              peran: data.peran,
              aktif: data.aktif,
              terakhirMasuk: null,
            },
          ];
      simpan(berikutnya);
      return berikutnya;
    });
    setForm(null);
  }

  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Administrasi
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
            Daftar pengguna
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Kelola akun yang bisa membuka dashboard, beserta peran dan
            statusnya.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground">
            Data contoh
          </span>
          {sesi?.peran === "staf" && (
            <Button size="sm" onClick={() => setForm({ awal: null })}>
              <Plus aria-hidden="true" />
              Tambah pengguna
            </Button>
          )}
        </div>
      </div>

      <Card className="mt-6 gap-3 rounded-2xl border-border bg-card/60 py-0">
        <CardHeader className="flex-row items-center gap-2 border-b border-border/60 py-4">
          <Users className="size-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-sm font-medium tracking-tight">
            Pengguna dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          {!sesi && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-6 py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/70">
                <LockKeyhole
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
              </span>
              <p className="text-sm font-medium text-foreground">
                Masuk untuk melihat daftar pengguna
              </p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                Halaman ini khusus staf. Masuk dengan akun contoh staf untuk
                mencoba.
              </p>
              <Button asChild size="sm" className="mt-1">
                <Link href="/masuk?tujuan=%2Fpengguna">Masuk</Link>
              </Button>
            </div>
          )}

          {sesi && sesi.peran !== "staf" && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-6 py-12 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/70">
                <ShieldAlert
                  className="size-4 text-primary"
                  aria-hidden="true"
                />
              </span>
              <p className="text-sm font-medium text-foreground">
                Peran {sesi.peran} tidak membuka halaman ini
              </p>
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                Daftar pengguna hanya untuk staf. Anda masih bisa membuka
                ringkasan dan perbandingan wilayah.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-1">
                <Link href="/">Kembali ke dashboard</Link>
              </Button>
            </div>
          )}

          {sesi?.peran === "staf" && (
            <DaftarPengguna
              data={daftar}
              onUbah={(awal) => setForm({ awal })}
            />
          )}
        </CardContent>
      </Card>

      {form && (
        <FormPengguna
          awal={form.awal}
          emailTerpakai={daftar.map((item) => item.email)}
          onSimpan={simpanData}
          onTutup={() => setForm(null)}
        />
      )}
    </Shell>
  );
}
