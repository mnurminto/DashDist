"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-24"
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-destructive/30 bg-destructive/10">
        <TriangleAlert className="size-5 text-destructive" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        Ada yang tidak berjalan lancar
      </h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Coba muat ulang halaman ini. Kalau masalahnya berulang, periksa terminal
        tempat aplikasi berjalan untuk melihat detailnya.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={reset}>Coba lagi</Button>
        <Button variant="outline" asChild>
          <Link href="/">Kembali ke dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
