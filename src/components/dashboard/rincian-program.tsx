import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

export type RincianProgramItem = {
  kode: string;
  nama: string;
  penerima: number;
  transaksi: number;
  dana: number;
  /** Persentase dana program terhadap total wilayah. */
  porsi: number;
};

type Props = { data: readonly RincianProgramItem[] };

/** Tabel rincian dana per program di satu wilayah. */
export function RincianProgram({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-muted-foreground">
        Belum ada program yang menyalurkan bantuan di wilayah ini.
      </p>
    );
  }

  const maks = Math.max(...data.map((item) => item.dana), 1);

  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,1fr)_5rem_6rem_8rem] items-center gap-3 border-b border-border/60 pb-2 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:grid">
        <span>Program</span>
        <span className="text-right">Penerima</span>
        <span className="text-right">Transaksi</span>
        <span className="text-right">Dana</span>
      </div>

      <ul className="divide-y divide-border/50">
        {data.map((item) => (
          <li
            key={item.kode}
            className="grid gap-1 py-3 sm:grid-cols-[minmax(0,1fr)_5rem_6rem_8rem] sm:items-center sm:gap-3"
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {item.nama}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 w-full max-w-xs overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max((item.dana / maks) * 100, 3)}%`,
                      backgroundImage:
                        "linear-gradient(90deg, var(--grafik-area), var(--grafik-garis))",
                    }}
                  />
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                  {item.porsi.toLocaleString("id-ID", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground tabular-nums sm:text-right">
              <span className="sm:hidden">Penerima: </span>
              {formatAngka(item.penerima)}
            </span>
            <span className="text-[11px] text-muted-foreground tabular-nums sm:text-right">
              <span className="sm:hidden">Transaksi: </span>
              {formatAngka(item.transaksi)}
            </span>
            <span className="text-[11px] font-medium text-foreground tabular-nums sm:text-right">
              {formatRupiah(item.dana)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
