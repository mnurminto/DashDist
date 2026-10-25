"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { JakartaMap } from "@/components/dashboard/jakarta-map";
import { PetaLegenda } from "@/components/dashboard/peta-legenda";
import { StatistikUtama } from "@/components/dashboard/statistik-utama";
import { KECAMATAN } from "@/lib/dashboard/mock-data";

/**
 * Bagian utama dashboard: kartu statistik + peta.
 * Pilihan wilayah disimpan di sini supaya kartu statistik ikut berubah
 * saat pengguna mengklik kecamatan di peta.
 */
export function DashboardUtama() {
  const [dipilih, setDipilih] = useState<string | null>(null);
  const wilayah = dipilih
    ? (KECAMATAN.find((kecamatan) => kecamatan.code === dipilih) ?? null)
    : null;

  return (
    <>
      <StatistikUtama wilayah={wilayah} />

      <Card className="mt-5 gap-4 overflow-hidden py-0">
        <CardHeader className="gap-1 border-b py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">
              {wilayah ? `Kecamatan ${wilayah.nama}` : "Sebaran per kecamatan"}
            </CardTitle>
            <span className="rounded-full border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
              Data contoh
            </span>
          </div>
          <CardDescription>
            {wilayah
              ? `${wilayah.kota} · klik wilayah lain untuk berganti`
              : `${KECAMATAN.length} kecamatan di DKI Jakarta, termasuk Kepulauan Seribu.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <JakartaMap
            dipilih={dipilih}
            onPilih={setDipilih}
            footer={<PetaLegenda />}
          />
        </CardContent>
      </Card>
    </>
  );
}
