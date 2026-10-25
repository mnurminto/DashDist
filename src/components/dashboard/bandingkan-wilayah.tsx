import { formatRupiah, formatRupiahRingkas } from "@/lib/dashboard/format";
import { cn } from "cn";

export type PembandingItem = {
  kode: string;
  nama: string;
  dana: number;
  aktif: boolean;
};

type Props = {
  data: readonly PembandingItem[];
  danaWilayah: number;
  rataRata: number;
};

/** Perbandingan dana wilayah ini dengan kecamatan lain dan rata-rata DKI. */
export function BandingkanWilayah({ data, danaWilayah, rataRata }: Props) {
  const selisih = danaWilayah - rataRata;
  const persen = rataRata > 0 ? (selisih / rataRata) * 100 : 0;
  const diAtas = selisih >= 0;
  const maks = Math.max(...data.map((item) => item.dana), 1);

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-sm text-foreground">
          Dana wilayah ini{" "}
          <span className="font-semibold tabular-nums">
            {formatRupiah(danaWilayah)}
          </span>
        </p>
        <p className="text-[11px] text-muted-foreground">
          rata-rata kecamatan DKI {formatRupiah(rataRata)}
        </p>
      </div>

      <p
        className={cn(
          "mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium tabular-nums",
          diAtas
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border bg-secondary/40 text-muted-foreground",
        )}
      >
        {diAtas ? "▲" : "▼"}{" "}
        {Math.abs(persen).toLocaleString("id-ID", {
          maximumFractionDigits: 1,
        })}
        % {diAtas ? "di atas" : "di bawah"} rata-rata
      </p>

      <ul className="mt-4 space-y-3">
        {data.map((item, i) => (
          <li
            key={item.kode}
            className={cn(
              "rounded-lg px-2 py-1.5",
              item.aktif && "border border-primary/30 bg-primary/5",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "truncate text-[11px]",
                    item.aktif
                      ? "font-semibold text-foreground"
                      : "font-medium text-foreground",
                  )}
                >
                  {item.nama}
                </span>
                {item.aktif && (
                  <span className="shrink-0 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                    wilayah ini
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
                {formatRupiahRingkas(item.dana)}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  "h-full rounded-full",
                  item.aktif
                    ? "bg-gradient-to-r from-[#8c8a4c] to-[#e9dfae]"
                    : "bg-gradient-to-r from-[#5d6238] to-[#c3b064]",
                )}
                style={{
                  width: `${Math.max((item.dana / maks) * 100, 3)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[10px] text-muted-foreground">
        Dibandingkan dengan lima kecamatan dengan penyaluran terbesar.
      </p>
    </div>
  );
}
