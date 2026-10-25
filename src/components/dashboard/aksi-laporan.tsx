"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Download, FileText, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  bacaFilterDariQuery,
  buatCsv,
  filterKeQuery,
  namaBerkasCsv,
  ringkasEkspor,
  unduhCsv,
} from "@/lib/dashboard/ekspor";
import type { BarisPenyaluran, FilterState } from "@/lib/dashboard/penyaluran";

type Props = {
  filter: FilterState;
  baris: readonly BarisPenyaluran[];
};

type Pesan = "unduh" | "salin" | "bagi" | "gagal" | null;

/** Tombol unduh CSV dan bagikan tautan filter di dashboard. */
export function AksiLaporan({ filter, baris }: Props) {
  const [pesan, setPesan] = useState<Pesan>(null);

  function tandai(nilai: Pesan) {
    setPesan(nilai);
    setTimeout(() => setPesan(null), 2600);
  }

  function unduh() {
    const rows = ringkasEkspor(baris);
    if (rows.length === 0) {
      tandai("gagal");
      return;
    }
    unduhCsv(namaBerkasCsv(filter), buatCsv(rows));
    tandai("unduh");
  }

  async function bagikan() {
    const query = filterKeQuery(filter);
    const url = new URL(window.location.href);
    url.search = query;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Distribusi bantuan Baznas Bazis DKI",
          text: "Lihat sebaran bantuan pada filter ini:",
          url: url.toString(),
        });
        tandai("bagi");
        return;
      }
    } catch {
      // Pengguna membatalkan dialog berbagi; lanjut ke salin tautan.
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      tandai("salin");
    } catch {
      tandai("gagal");
    }
  }

  /** Tautan yang bisa dibuka ulang dari bilah alamat. */
  const pratinjauTautan = filterKeQuery(filter);
  const tautanLaporan = pratinjauTautan
    ? `/laporan?${pratinjauTautan}&cetak=1`
    : "/laporan?cetak=1";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={unduh}
        title={`Unduh ${ringkasEkspor(baris).length} baris sebagai CSV`}
      >
        <Download aria-hidden="true" />
        Unduh CSV
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link
          href={tautanLaporan}
          target="_blank"
          rel="noopener noreferrer"
          title="Buka laporan siap cetak, lalu pilih Simpan sebagai PDF"
        >
          <FileText aria-hidden="true" />
          Unduh PDF
        </Link>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={bagikan}>
        <Share2 aria-hidden="true" />
        Bagikan
      </Button>

      <p
        role="status"
        aria-live="polite"
        className="flex min-h-5 items-center gap-1 text-[11px] text-muted-foreground"
      >
        {pesan === "unduh" && (
          <>
            <Check className="size-3 text-primary" aria-hidden="true" />
            CSV diunduh
          </>
        )}
        {pesan === "salin" && (
          <>
            <Check className="size-3 text-primary" aria-hidden="true" />
            Tautan disalin
          </>
        )}
        {pesan === "bagi" && (
          <>
            <Check className="size-3 text-primary" aria-hidden="true" />
            Tautan dibagikan
          </>
        )}
        {pesan === "gagal" && "Tidak ada data untuk dibagikan"}
        {pesan === null && pratinjauTautan && (
          <span className="hidden sm:inline">
            Filter aktif ikut tersimpan di tautan
          </span>
        )}
      </p>
    </div>
  );
}

/** Baca filter dari tautan yang dibagikan (dipakai saat halaman dibuka). */
export function filterDariTautan() {
  if (typeof window === "undefined") return null;
  return bacaFilterDariQuery(window.location.search.replace(/^\?/, ""));
}
