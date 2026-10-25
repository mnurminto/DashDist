"use client";

import Link from "next/link";
import { ArrowRight, Eye, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hapusSesi, type PenggunaTiruan } from "@/lib/dashboard/auth-tiruan";

type Props = { sesi: PenggunaTiruan | null };

/**
 * Penanda mode tampilan: pengunjung publik melihat ringkasan saja,
 * pengguna yang masuk mendapat rincian penuh.
 */
export function StatusAkses({ sesi }: Props) {
  if (!sesi) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Eye className="mt-0.5 size-4 text-primary" aria-hidden="true" />
          <div>
            <p className="text-xs font-medium text-foreground">
              Anda melihat ringkasan publik
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Masuk untuk membuka rincian per program dan daftar penerima.
            </p>
          </div>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href={`/masuk?tujuan=${encodeURIComponent("/")}`}>
            Masuk
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/50 px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
        <p className="text-[11px] text-muted-foreground">
          Masuk sebagai{" "}
          <span className="font-medium text-foreground">{sesi.nama}</span>
          <span className="mx-1.5 text-border">·</span>
          <span className="capitalize">{sesi.peran}</span>
          <span className="mx-1.5 text-border">·</span>
          {sesi.akses}
        </p>
      </div>
      <button
        type="button"
        onClick={hapusSesi}
        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        <LogOut className="size-3.5" aria-hidden="true" />
        Keluar
      </button>
    </div>
  );
}
