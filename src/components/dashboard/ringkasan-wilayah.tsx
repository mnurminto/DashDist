import { X } from "lucide-react";
import type { WilayahRingkas } from "@/lib/dashboard/penyaluran";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Props = {
  data: WilayahRingkas | null;
  onTutup?: () => void;
};

/** Kartu ringkasan satu wilayah. Tampil setelah pengguna mengklik wilayah di peta. */
export function RingkasanWilayah({ data, onTutup }: Props) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-4">
        <p className="text-xs leading-5 text-muted-foreground">
          Klik salah satu wilayah di peta untuk melihat ringkasan bantuan di
          sana.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-4">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-primary/10 blur-2xl"
      />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            {data.kota}
          </p>
          <h2 className="mt-1 text-base leading-tight font-semibold">
            {data.nama}
          </h2>
        </div>
        {onTutup && (
          <button
            type="button"
            onClick={onTutup}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
            aria-label="Tutup ringkasan wilayah"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="mt-4 text-2xl leading-none font-semibold tracking-tight tabular-nums">
        {formatRupiah(data.dana)}
      </p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Dana tersalurkan
      </p>

      <dl className="mt-4 space-y-2 border-t border-border/60 pt-3 text-xs">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Penerima manfaat</dt>
          <dd className="font-medium tabular-nums">
            {formatAngka(data.penerima)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Transaksi</dt>
          <dd className="font-medium tabular-nums">
            {formatAngka(data.transaksi)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Program aktif</dt>
          <dd className="font-medium tabular-nums">{data.program}</dd>
        </div>
      </dl>
    </div>
  );
}
