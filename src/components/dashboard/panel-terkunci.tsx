"use client";

import Link from "next/link";
import { LockKeyhole, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  nama: string;
  kota: string;
  onTutup: () => void;
};

/** Panel kanan untuk pengunjung publik yang memilih satu kecamatan. */
export function PanelTerkunci({ nama, kota, onTutup }: Props) {
  return (
    <Card className="gap-3 rounded-2xl border-primary/25 bg-card/70 py-0">
      <CardHeader className="gap-1 border-b border-border/60 py-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium tracking-tight">
            Kecamatan {nama}
          </CardTitle>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup ringkasan"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">{kota}</p>
      </CardHeader>

      <CardContent className="pb-4">
        <div className="flex flex-col items-center gap-2.5 rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-6 text-center">
          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/70">
            <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
          </span>
          <p className="text-xs font-medium text-foreground">
            Rincian wilayah untuk pengguna yang masuk
          </p>
          <p className="text-[11px] leading-5 text-muted-foreground">
            Angka agregat tetap terbuka. Masuk untuk melihat rincian per
            program, penerima, dan perbandingan wilayah.
          </p>
          <Button asChild size="sm" className="mt-1">
            <Link href={`/masuk?tujuan=${encodeURIComponent("/")}`}>Masuk</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
