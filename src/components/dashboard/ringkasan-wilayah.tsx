import type { Kecamatan } from "@/lib/dashboard/mock-data";
import { formatAngka, formatRupiah } from "@/lib/dashboard/format";

type Props = {
  data: Kecamatan | null;
  onTutup?: () => void;
};

/** Kartu ringkasan satu wilayah. Tampil setelah pengguna mengklik wilayah di peta. */
export function RingkasanWilayah({ data, onTutup }: Props) {
  if (!data) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/40 p-4">
        <p className="text-sm leading-6 text-muted-foreground">
          Klik salah satu wilayah di peta untuk melihat ringkasan bantuan di
          sana.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {data.kota}
          </p>
          <h2 className="mt-0.5 text-lg leading-tight font-semibold">
            {data.nama}
          </h2>
        </div>
        {onTutup && (
          <button
            type="button"
            onClick={onTutup}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Tutup ringkasan wilayah"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {formatRupiah(data.dana)}
      </p>
      <p className="text-xs text-muted-foreground">Dana tersalurkan</p>

      <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Penerima manfaat</dt>
          <dd className="font-medium">{formatAngka(data.penerima)} orang</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Transaksi</dt>
          <dd className="font-medium">{formatAngka(data.penyaluran)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Program aktif</dt>
          <dd className="font-medium">{data.program}</dd>
        </div>
      </dl>
    </div>
  );
}
