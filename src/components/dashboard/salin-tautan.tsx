"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/dashboard/toast";
import { salinKeClipboard } from "@/lib/dashboard/clipboard";

type Props = {
  /** Query string filter aktif, mis. "wilayah=id3171010&periode=2025". */
  kueri: string;
};

type Status = "siap" | "tersalin" | "gagal";

function tautanSekarang(kueri: string) {
  const url = new URL(window.location.pathname, window.location.origin);
  url.search = kueri;
  return url.toString();
}

/**
 * Panel salin tautan: menampilkan URL filter aktif, tombol salin dengan
 * fallback `execCommand`, dan tombol berbagi bawaan sistem bila tersedia.
 */
export function SalinTautan({ kueri }: Props) {
  const [status, setStatus] = useState<Status>("siap");
  const [terbuka, setTerbuka] = useState(false);
  const [tautan, setTautan] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function munculkanToast(pesan: string) {
    if (timer.current) clearTimeout(timer.current);
    setToast(pesan);
    timer.current = setTimeout(() => setToast(null), 3000);
  }

  async function salin() {
    const url = tautanSekarang(kueri);
    setTautan(url);
    const berhasil = await salinKeClipboard(url);
    setStatus(berhasil ? "tersalin" : "gagal");
    setTerbuka(true);
    munculkanToast(
      berhasil ? "Tautan dashboard disalin" : "Gagal menyalin, salin manual",
    );
  }

  async function bagikan() {
    const url = tautanSekarang(kueri);
    setTautan(url);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Distribusi bantuan Baznas Bazis DKI",
          text: "Lihat sebaran bantuan pada filter ini:",
          url,
        });
        setStatus("tersalin");
        munculkanToast("Tautan dashboard dibagikan");
        return;
      } catch {
        // Dialog dibatalkan; jatuh ke salin.
      }
    }
    const berhasil = await salinKeClipboard(url);
    setStatus(berhasil ? "tersalin" : "gagal");
    setTerbuka(true);
    munculkanToast(
      berhasil ? "Tautan dashboard disalin" : "Gagal menyalin, salin manual",
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={salin}>
          <Copy aria-hidden="true" />
          Salin tautan
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={bagikan}>
          <Share2 aria-hidden="true" />
          Bagikan
        </Button>
        <span
          role="status"
          aria-live="polite"
          className="flex min-h-5 items-center gap-1 text-[11px] text-muted-foreground"
        >
          {status === "tersalin" && (
            <>
              <Check className="size-3 text-primary" aria-hidden="true" />
              Tautan disalin
            </>
          )}
          {status === "gagal" && "Salin manual: pilih teks lalu Ctrl+C"}
        </span>
      </div>

      {terbuka && (
        <div className="flex w-full min-w-[20rem] max-w-[27rem] flex-wrap items-center gap-2 rounded-lg border border-border bg-secondary/30 p-2">
          <Link2
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            readOnly
            value={tautan}
            aria-label="Tautan dashboard dengan filter aktif"
            onFocus={(e) => e.currentTarget.select()}
            title={tautan}
            className="h-8 min-w-0 flex-1 border-border/70 bg-card text-[11px]"
          />
        </div>
      )}

      <Toast pesan={toast} jenis={status === "gagal" ? "gagal" : "sukses"} />
    </div>
  );
}
