"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  LABEL_PERAN,
  type PenggunaAdmin,
} from "@/lib/dashboard/pengguna-contoh";
import { formatAngka } from "@/lib/dashboard/format";
import { cn } from "cn";

type Props = {
  data: readonly PenggunaAdmin[];
  /** Bila diisi, tiap baris menampilkan tombol ubah. */
  onUbah?: (pengguna: PenggunaAdmin) => void;
};

const SEMUA = "semua";

function formatTanggal(iso: string | null) {
  if (!iso) return "Belum pernah";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** Tabel pengguna dengan pencarian nama/email dan filter peran. */
export function DaftarPengguna({ data, onUbah }: Props) {
  const [cari, setCari] = useState("");
  const [peran, setPeran] = useState<string>(SEMUA);

  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return data.filter(
      (item) =>
        (peran === SEMUA || item.peran === peran) &&
        (kunci === "" ||
          item.nama.toLowerCase().includes(kunci) ||
          item.email.toLowerCase().includes(kunci)),
    );
  }, [data, cari, peran]);

  const aktif = data.filter((item) => item.aktif).length;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Cari pengguna</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama atau email…"
            className="h-9 border-border bg-card pl-8 text-xs"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="sr-only">Filter peran</span>
          <select
            value={peran}
            onChange={(e) => setPeran(e.target.value)}
            className="select-dark h-9 appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            <option value={SEMUA}>Semua peran</option>
            <option value="staf">Staf</option>
            <option value="pimpinan">Pimpinan</option>
          </select>
        </label>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground" aria-live="polite">
        {formatAngka(hasil.length)} dari {formatAngka(data.length)} pengguna ·{" "}
        {formatAngka(aktif)} aktif
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <th scope="col" className="py-2 pr-3 font-medium">
                Nama
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Email
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Peran
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Status
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Terakhir masuk
              </th>
              {onUbah && (
                <th scope="col" className="py-2 text-right font-medium">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {hasil.map((item) => (
              <tr key={item.id} className="text-xs">
                <td className="py-2.5 pr-3 font-medium text-foreground">
                  {item.nama}
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground">
                  {item.email}
                </td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {LABEL_PERAN[item.peran]}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]",
                      item.aktif
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-secondary/30 text-muted-foreground",
                    )}
                  >
                    {item.aktif ? (
                      <ShieldCheck className="size-3" aria-hidden="true" />
                    ) : (
                      <UserX className="size-3" aria-hidden="true" />
                    )}
                    {item.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground tabular-nums">
                  {formatTanggal(item.terakhirMasuk)}
                </td>
                {onUbah && (
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => onUbah(item)}
                      className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                    >
                      Ubah
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasil.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Tidak ada pengguna yang cocok dengan pencarian.
        </p>
      )}
    </div>
  );
}
