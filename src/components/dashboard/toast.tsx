"use client";

import { Check, TriangleAlert } from "lucide-react";
import { cn } from "cn";

type Props = {
  /** Pesan yang ditampilkan; `null` menyembunyikan toast. */
  pesan: string | null;
  jenis?: "sukses" | "gagal";
  className?: string;
};

/**
 * Notifikasi ringkas di pojok kanan bawah. Tidak menangkap klik
 * (`pointer-events-none`) supaya tidak menghalangi tombol di belakangnya.
 */
export function Toast({ pesan, jenis = "sukses", className }: Props) {
  if (!pesan) return null;

  const Ikon = jenis === "sukses" ? Check : TriangleAlert;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl border border-border bg-card/95 px-3.5 py-2.5 text-xs text-foreground shadow-2xl backdrop-blur",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
        jenis === "gagal" && "border-destructive/40",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full",
          jenis === "sukses"
            ? "bg-primary/15 text-primary"
            : "bg-destructive/15 text-destructive",
        )}
        aria-hidden="true"
      >
        <Ikon className="size-3" />
      </span>
      {pesan}
    </div>
  );
}
