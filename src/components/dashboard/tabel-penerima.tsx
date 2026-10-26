"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PenerimaContoh } from "@/lib/dashboard/penerima-contoh";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Props = { data: readonly PenerimaContoh[] };

const SEMUA = "semua";

function formatTanggal(iso: string) {
  const tanggal = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(tanggal);
}

/** Tabel penerima dengan pencarian nama dan filter kategori. */
export function TabelPenerima({ data }: Props) {
  const [cari, setCari] = useState("");
  const [kategori, setKategori] = useState(SEMUA);

  const kategoriTersedia = useMemo(
    () => [...new Set(data.map((item) => item.kategori))].sort(),
    [data],
  );

  const hasil = useMemo(() => {
    const kunci = cari.trim().toLowerCase();
    return data.filter(
      (item) =>
        (kategori === SEMUA || item.kategori === kategori) &&
        (kunci === "" || item.nama.toLowerCase().includes(kunci)),
    );
  }, [data, cari, kategori]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="relative flex-1 min-w-[12rem]">
          <span className="sr-only">Cari nama penerima</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama penerima…"
            className="h-9 w-full rounded-lg border border-border bg-card pr-3 pl-8 text-xs text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="sr-only">Filter kategori</span>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="select-dark h-9 appearance-none rounded-lg border border-border bg-card pr-8 pl-3 text-xs text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/20"
          >
            <option value={SEMUA}>Semua kategori</option>
            {kategoriTersedia.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground" aria-live="polite">
        Menampilkan {formatAngka(hasil.length)} dari {formatAngka(data.length)}{" "}
        penerima contoh. Nama disamarkan untuk menjaga privasi.
      </p>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-border/60 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
              <th scope="col" className="py-2 pr-3 font-medium">
                Nama
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Kategori
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Program
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                Tanggal
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                Dana
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {hasil.map((item) => (
              <tr key={item.id} className="text-xs">
                <td className="py-2.5 pr-3 font-medium text-foreground">
                  {item.nama}
                </td>
                <td className="py-2.5 pr-3">
                  <span className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                    {item.kategori}
                  </span>
                </td>
                <td className="max-w-[12rem] truncate py-2.5 pr-3 text-muted-foreground">
                  {item.programNama}
                </td>
                <td className="py-2.5 pr-3 text-muted-foreground tabular-nums">
                  {formatTanggal(item.tanggal)}
                </td>
                <td className="py-2.5 text-right font-medium text-foreground tabular-nums">
                  {formatRupiah(item.dana)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasil.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Tidak ada penerima yang cocok dengan pencarian.
        </p>
      )}
    </div>
  );
}
