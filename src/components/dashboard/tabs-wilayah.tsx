"use client";

import { useRef, useState } from "react";
import { cn } from "cn";

export type TabWilayah = {
  id: string;
  label: string;
  isi: React.ReactNode;
};

type Props = {
  tab: readonly TabWilayah[];
  /** Id tab yang aktif pertama kali. */
  awal?: string;
};

/**
 * Tab antarseksi halaman detail wilayah.
 * Memakai pola ARIA tabs: panah kiri/kanan, Home, dan End memindahkan fokus.
 */
export function TabsWilayah({ tab, awal }: Props) {
  const [aktif, setAktif] = useState(awal ?? tab[0]?.id ?? "");
  const tombolRef = useRef<(HTMLButtonElement | null)[]>([]);

  function pindah(indeks: number) {
    const tujuan = (indeks + tab.length) % tab.length;
    setAktif(tab[tujuan].id);
    tombolRef.current[tujuan]?.focus();
  }

  function saatTombol(
    e: React.KeyboardEvent<HTMLButtonElement>,
    indeks: number,
  ) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      pindah(indeks + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      pindah(indeks - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      pindah(0);
    } else if (e.key === "End") {
      e.preventDefault();
      pindah(tab.length - 1);
    }
  }

  const panelAktif = tab.find((item) => item.id === aktif) ?? tab[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Bagian detail wilayah"
        className="flex flex-wrap gap-1 border-b border-border/60 px-3 pt-3 sm:px-5"
      >
        {tab.map((item, i) => {
          const terpilih = item.id === panelAktif?.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tombolRef.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={terpilih}
              aria-controls={`panel-${item.id}`}
              tabIndex={terpilih ? 0 : -1}
              onClick={() => setAktif(item.id)}
              onKeyDown={(e) => saatTombol(e, i)}
              className={cn(
                "relative rounded-t-lg px-3 py-2.5 text-[11px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                terpilih
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors",
                  terpilih ? "bg-primary" : "bg-transparent",
                )}
              />
            </button>
          );
        })}
      </div>

      {tab.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`panel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
          hidden={item.id !== panelAktif?.id}
          className="p-4 sm:p-5"
        >
          {item.isi}
        </div>
      ))}
    </div>
  );
}
