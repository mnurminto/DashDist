import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ProfilWilayah } from "@/components/dashboard/profil-wilayah";
import { RincianProgram } from "@/components/dashboard/rincian-program";
import { TabsWilayah } from "@/components/dashboard/tabs-wilayah";
import { Shell } from "@/components/dashboard/shell";
import { StatistikUtama } from "@/components/dashboard/statistik-utama";
import { Button } from "@/components/ui/button";
import { KECAMATAN, PROGRAM } from "@/lib/dashboard/mock-data";
import {
  ringkasPerWilayah,
  ringkasTotal,
  saring,
} from "@/lib/dashboard/penyaluran";

type Props = { params: Promise<{ kode: string }> };

function cariWilayah(kode: string) {
  return KECAMATAN.find((kecamatan) => kecamatan.code === kode) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kode } = await params;
  const wilayah = cariWilayah(kode);
  return {
    title: wilayah
      ? `Kecamatan ${wilayah.nama} — Detail Wilayah`
      : "Detail Wilayah",
  };
}

export default async function DetailWilayahPage({ params }: Props) {
  const { kode } = await params;
  const meta = cariWilayah(kode);
  if (!meta) notFound();

  const baris = saring({ wilayah: kode, program: "semua", periode: "semua" });
  const total = ringkasTotal(baris);
  const ringkas = ringkasPerWilayah(baris).get(kode) ?? null;

  // Peringkat dihitung dari seluruh kecamatan, bukan hanya wilayah ini.
  const semua = [
    ...ringkasPerWilayah(
      saring({ wilayah: "semua", program: "semua", periode: "semua" }),
    ).values(),
  ].sort((a, b) => b.dana - a.dana);
  const peringkat = semua.findIndex((item) => item.code === kode) + 1;
  const totalDki = semua.reduce((jumlah, item) => jumlah + item.dana, 0);

  const profil = {
    kota: meta.kota,
    peringkat: peringkat > 0 ? peringkat : semua.length,
    totalWilayah: semua.length,
    porsiDki: totalDki > 0 ? (total.dana / totalDki) * 100 : 0,
    program: ringkas?.program ?? 0,
    penerima: total.penerima,
    dana: total.dana,
    transaksi: total.transaksi,
  };

  const rincianProgram = PROGRAM.map((program) => {
    const subset = baris.filter((item) => item.program === program.id);
    const dana = subset.reduce((jumlah, item) => jumlah + item.dana, 0);
    const penerima = subset.reduce((jumlah, item) => jumlah + item.penerima, 0);
    const transaksi = subset.reduce(
      (jumlah, item) => jumlah + item.transaksi,
      0,
    );
    return {
      kode: program.id,
      nama: program.nama,
      penerima,
      transaksi,
      dana,
      porsi: total.dana > 0 ? (dana / total.dana) * 100 : 0,
    };
  })
    .filter((item) => item.dana > 0)
    .sort((a, b) => b.dana - a.dana);

  return (
    <Shell>
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] text-muted-foreground"
      >
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              DKI Jakarta
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>{meta.kota}</li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="text-foreground">
            {meta.nama}
          </li>
        </ol>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
            Detail wilayah · {meta.kota}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-[2.5rem] sm:leading-[1.1]">
            Kecamatan {meta.nama}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Profil ringkas, rincian program, dan daftar penerima bantuan di
            wilayah ini.
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Kembali ke peta
          </Link>
        </Button>
      </div>

      <div className="mt-6">
        <StatistikUtama total={total} wilayah={ringkas} adaFilter={false} />
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card/60">
        <TabsWilayah
          awal="ringkasan"
          tab={[
            {
              id: "ringkasan",
              label: "Ringkasan",
              isi: <ProfilWilayah data={profil} />,
            },
            {
              id: "program",
              label: "Program",
              isi: <RincianProgram data={rincianProgram} />,
            },
            {
              id: "penerima",
              label: "Penerima",
              isi: (
                <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40">
                  <Users
                    className="size-5 text-muted-foreground/50"
                    aria-hidden="true"
                  />
                </div>
              ),
            },
            {
              id: "bandingkan",
              label: "Bandingkan",
              isi: (
                <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/40">
                  <p className="text-[11px] text-muted-foreground">
                    Menyiapkan perbandingan…
                  </p>
                </div>
              ),
            },
          ]}
        />
      </section>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <span>Batas wilayah: BPS via HDX (ODbL)</span>
        <span>Angka masih data contoh, belum tersambung ke database.</span>
      </footer>
    </Shell>
  );
}
