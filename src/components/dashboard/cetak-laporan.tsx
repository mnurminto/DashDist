"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  /** Cetak otomatis saat halaman dibuka (dari tombol "Unduh PDF"). */
  otomatis?: boolean;
};

/**
 * Pemicu cetak laporan. Browser lalu menawarkan "Simpan sebagai PDF",
 * jadi tidak perlu pustaka PDF tambahan.
 */
export function CetakLaporan({ otomatis = false }: Props) {
  useEffect(() => {
    if (!otomatis) return;
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, [otomatis]);

  return (
    <Button type="button" size="sm" onClick={() => window.print()}>
      <Printer aria-hidden="true" />
      Cetak / Simpan PDF
    </Button>
  );
}
