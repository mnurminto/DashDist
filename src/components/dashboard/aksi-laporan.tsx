"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Download,
  FileSpreadsheet,
  FileText,
  LockKeyhole,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalinTautan } from "@/components/dashboard/salin-tautan";
import { KECAMATAN, PROGRAM } from "@/lib/dashboard/mock-data";
import {
  bacaFilterDariQuery,
  buatCsv,
  buatExcelXml,
  filterKeQuery,
  namaBerkasCsv,
  namaBerkasExcel,
  ringkasEkspor,
  unduhCsv,
  unduhExcel,
} from "@/lib/dashboard/ekspor";
import {
  ringkasTotal,
  type BarisPenyaluran,
  type FilterState,
} from "@/lib/dashboard/penyaluran";

type Props = {
  filter: FilterState;
  baris: readonly BarisPenyaluran[];
  /** Peran pimpinan hanya melihat ringkasan, tanpa unduhan. */
  bolehUnduh?: boolean;
};

type Pesan = "unduh" | "excel" | "gagal" | null;

/** Tombol unduh Excel/CSV/PDF dan panel salin tautan filter. */
export function AksiLaporan({ filter, baris, bolehUnduh = true }: Props) {
  const [pesan, setPesan] = useState<Pesan>(null);

  const total = useMemo(() => ringkasTotal(baris), [baris]);
  const kueri = filterKeQuery(filter);

  const label = {
    wilayah:
      filter.wilayah === "semua"
        ? "Seluruh DKI Jakarta"
        : (KECAMATAN.find((item) => item.code === filter.wilayah)?.nama ??
          filter.wilayah),
    program:
      filter.program === "semua"
        ? "Semua program"
        : (PROGRAM.find((item) => item.id === filter.program)?.nama ??
          filter.program),
    periode:
      filter.periode === "semua" ? "Semua tahun" : `Tahun ${filter.periode}`,
  };

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

  function unduhSpreadsheet() {
    const rows = ringkasEkspor(baris);
    if (rows.length === 0) {
      tandai("gagal");
      return;
    }

    unduhExcel(
      namaBerkasExcel(filter),
      buatExcelXml(
        {
          wilayah: label.wilayah,
          program: label.program,
          periode: label.periode,
          penerima: total.penerima,
          dana: total.dana,
          programAktif: total.program,
          transaksi: total.transaksi,
          dicetak: new Intl.DateTimeFormat("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
          }).format(new Date()),
        },
        rows,
      ),
    );
    tandai("excel");
  }

  const tautanLaporan = kueri
    ? `/laporan?${kueri}&cetak=1`
    : "/laporan?cetak=1";

  return (
    <div className="flex flex-col items-start gap-2">
      {bolehUnduh ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={unduhSpreadsheet}
            title={`Unduh ${ringkasEkspor(baris).length} baris sebagai Excel`}
          >
            <FileSpreadsheet aria-hidden="true" />
            Excel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={unduh}
            title={`Unduh ${ringkasEkspor(baris).length} baris sebagai CSV`}
          >
            <Download aria-hidden="true" />
            CSV
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link
              href={tautanLaporan}
              target="_blank"
              rel="noopener noreferrer"
              title="Buka laporan siap cetak, lalu pilih Simpan sebagai PDF"
            >
              <FileText aria-hidden="true" />
              PDF
            </Link>
          </Button>

          <span
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
            {pesan === "excel" && (
              <>
                <Check className="size-3 text-primary" aria-hidden="true" />
                Excel diunduh
              </>
            )}
            {pesan === "gagal" && "Tidak ada data untuk diunduh"}
          </span>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/20 px-3 py-1.5 text-[11px] text-muted-foreground">
          <LockKeyhole className="size-3" aria-hidden="true" />
          Unduhan laporan hanya untuk peran staf
        </p>
      )}

      <SalinTautan kueri={kueri} />
    </div>
  );
}

/** Baca filter dari tautan yang dibagikan (dipakai saat halaman dibuka). */
export function filterDariTautan() {
  if (typeof window === "undefined") return null;
  return bacaFilterDariQuery(window.location.search.replace(/^\?/, ""));
}
