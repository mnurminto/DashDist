"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { PenerimaTerkunci } from "@/components/dashboard/penerima-terkunci";
import { TabelPenerima } from "@/components/dashboard/tabel-penerima";
import { daftarPenerimaContoh } from "@/lib/dashboard/penerima-contoh";
import { hakSesi } from "@/lib/dashboard/auth-tiruan";
import { useSesiTiruan } from "@/lib/dashboard/use-sesi";
import { Button } from "@/components/ui/button";

type Props = { kode: string };

/**
 * Tab penerima yang menyesuaikan peran:
 * publik → ajakan masuk, pimpinan → pesan tanpa akses, staf → tabel lengkap.
 */
export function TabPenerima({ kode }: Props) {
  const sesi = useSesiTiruan();
  const hak = hakSesi(sesi);

  if (!sesi) return <PenerimaTerkunci />;

  if (!hak.bolehLihatPenerima) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-6 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/70">
          <ShieldAlert className="size-4 text-primary" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-foreground">
          Peran Anda tidak membuka daftar penerima
        </p>
        <p className="max-w-sm text-xs leading-5 text-muted-foreground">
          Akun <span className="text-foreground">{sesi.nama}</span> masuk
          sebagai <span className="capitalize">{sesi.peran}</span>. Rincian
          penerima hanya untuk staf; ringkasan dan perbandingan tetap bisa
          dibuka.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/wilayah/id3171010">Lihat ringkasan wilayah lain</Link>
        </Button>
      </div>
    );
  }

  return <TabelPenerima data={daftarPenerimaContoh(kode)} />;
}
