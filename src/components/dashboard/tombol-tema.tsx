"use client";

import { Moon, Sun } from "lucide-react";
import { gantiTema } from "@/lib/tema";

/**
 * Tombol ganti tema. Ikon matahari tampil pada mode terang dan bulan pada
 * mode gelap; keduanya diatur CSS (`dark:`), jadi tidak ada kedipan hidrasi.
 */
export function TombolTema() {
  return (
    <button
      type="button"
      onClick={gantiTema}
      aria-label="Ganti tema terang atau gelap"
      title="Ganti tema terang/gelap"
      className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary/40 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  );
}
