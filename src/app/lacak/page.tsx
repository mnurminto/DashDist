import type { Metadata } from "next";
import { LacakUtama } from "@/components/dashboard/lacak/lacak-utama";
import { Shell } from "@/components/dashboard/shell";

export const metadata: Metadata = {
  title: "Lacak Penerima Bantuan",
};

export default function LacakPage() {
  return (
    <Shell>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Pelacakan
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
            Lacak penerima bantuan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Lihat sebaran laporan bantuan per kecamatan, status prosesnya, dan
            riwayat penyaluran — mirip peta CRM layanan warga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-[11px] text-muted-foreground">
            Data contoh
          </span>
          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary">
            60 hari terakhir
          </span>
        </div>
      </div>

      <LacakUtama />

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <span>Batas wilayah: BPS via HDX (ODbL)</span>
        <span>
          Nama penerima disamarkan; foto laporan pada data contoh diganti
          placeholder.
        </span>
      </footer>
    </Shell>
  );
}
