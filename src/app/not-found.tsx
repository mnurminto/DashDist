import Link from "next/link";
import { MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-6 py-24"
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-card/60">
        <MapPinned className="size-5 text-primary" aria-hidden="true" />
      </span>
      <p className="mt-5 font-mono text-xs tracking-[0.2em] text-primary">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Halaman ini tidak ada
      </h1>
      <p className="my-4 leading-7 text-muted-foreground">
        Tautannya mungkin salah atau sudah dipindahkan. Kembali ke peta sebaran
        bantuan untuk melanjutkan.
      </p>
      <div>
        <Button asChild>
          <Link href="/">Kembali ke dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
