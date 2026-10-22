import type { Metadata } from "next";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { JakartaMap } from "@/components/dashboard/jakarta-map";
import { PetaLegenda } from "@/components/dashboard/peta-legenda";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KECAMATAN, TERAKHIR_DIPERBARUI } from "@/lib/dashboard/mock-data";
import { formatWaktu } from "@/lib/dashboard/format";

export const metadata: Metadata = { title: "Peta Sebaran Bantuan" };

export default function DashboardPage() {
  return (
    <>
      <header className="border-b bg-card/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-10">
          <Brand />
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              Diperbarui {formatWaktu(TERAKHIR_DIPERBARUI)}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Masuk</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
        <p className="text-sm font-medium text-primary">
          Baznas Bazis Provinsi DKI Jakarta
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Peta sebaran bantuan
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Lihat di kecamatan mana bantuan paling banyak disalurkan. Arahkan
          kursor ke salah satu wilayah untuk membaca angkanya.
        </p>

        <Card className="mt-8 gap-4 overflow-hidden py-0">
          <CardHeader className="gap-1 border-b py-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">Sebaran per kecamatan</CardTitle>
              <span className="rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                Data contoh
              </span>
            </div>
            <CardDescription>
              {KECAMATAN.length} kecamatan di DKI Jakarta, termasuk Kepulauan
              Seribu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <JakartaMap footer={<PetaLegenda />} />
          </CardContent>
        </Card>

        <p className="mt-3 text-xs text-muted-foreground">
          Batas wilayah: BPS via HDX (ODbL). Angka pada halaman ini masih data
          contoh, belum tersambung ke database.
        </p>
      </main>
    </>
  );
}
