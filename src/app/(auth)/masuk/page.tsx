import type { Metadata } from "next";
import { Suspense } from "react";
import { FormMasuk } from "@/components/dashboard/form-masuk";

export const metadata: Metadata = {
  title: "Masuk — Dashboard Distribusi Baznas",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ tujuan?: string }>;
};

export default async function MasukPage({ searchParams }: Props) {
  const { tujuan } = await searchParams;

  // Hanya izinkan tujuan internal agar tidak jadi open redirect.
  const aman = tujuan && tujuan.startsWith("/") && !tujuan.startsWith("//");

  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Memuat…</p>}
    >
      <FormMasuk tujuan={aman ? tujuan : "/"} />
    </Suspense>
  );
}
