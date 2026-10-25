"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { PEMBARUAN_TERBARU } from "@/lib/dashboard/pembaruan";
import { WaktuPembaruan } from "@/components/dashboard/waktu-pembaruan";
import { cn } from "cn";

/**
 * Lonceng notifikasi pembaruan data: titik "belum dibaca", panel riwayat,
 * dan tombol tandai dibaca. Ditutup dengan Escape atau klik di luar panel.
 */
export function NotifikasiPembaruan() {
  const [terbuka, setTerbuka] = useState(false);
  const [dibaca, setDibaca] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terbuka) return;

    function saatKlik(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setTerbuka(false);
    }
    function saatTombol(e: KeyboardEvent) {
      if (e.key === "Escape") setTerbuka(false);
    }

    document.addEventListener("mousedown", saatKlik);
    document.addEventListener("keydown", saatTombol);
    return () => {
      document.removeEventListener("mousedown", saatKlik);
      document.removeEventListener("keydown", saatTombol);
    };
  }, [terbuka]);

  const belumDibaca = !dibaca && PEMBARUAN_TERBARU.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setTerbuka((nilai) => !nilai)}
        aria-label={
          belumDibaca
            ? `Notifikasi pembaruan, ${PEMBARUAN_TERBARU.length} belum dibaca`
            : "Notifikasi pembaruan"
        }
        aria-expanded={terbuka}
        aria-haspopup="dialog"
        className="relative flex size-8 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
      >
        <Bell className="size-4" aria-hidden="true" />
        {belumDibaca && (
          <span
            className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary ring-2 ring-background"
            aria-hidden="true"
          />
        )}
      </button>

      {terbuka && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Pembaruan data terbaru"
          className="absolute top-10 right-0 z-50 w-80 rounded-xl border border-border bg-card p-3 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-foreground">
              Pembaruan data
            </p>
            <div className="flex items-center gap-1">
              {belumDibaca && (
                <button
                  type="button"
                  onClick={() => setDibaca(true)}
                  className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                >
                  <Check className="size-3" aria-hidden="true" />
                  Tandai dibaca
                </button>
              )}
              <button
                type="button"
                onClick={() => setTerbuka(false)}
                aria-label="Tutup notifikasi"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <ul className="mt-2 divide-y divide-border/60">
            {PEMBARUAN_TERBARU.map((item) => (
              <li key={item.id} className="py-2">
                <p className="text-[11px] font-medium text-foreground">
                  {item.judul}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {item.keterangan}
                </p>
                <WaktuPembaruan
                  waktu={item.waktu}
                  label=""
                  className={cn("mt-1 text-[10px]")}
                />
              </li>
            ))}
          </ul>

          <p className="mt-2 border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
            Data contoh untuk tampilan. Sinkronisasi nyata belum aktif.
          </p>
        </div>
      )}
    </div>
  );
}
