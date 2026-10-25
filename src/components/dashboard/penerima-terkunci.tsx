import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pengganti daftar penerima untuk pengunjung yang belum masuk.
 * Rincian penerima bersifat pribadi; angka agregat tetap terbuka.
 */
export function PenerimaTerkunci() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-card/70">
        <LockKeyhole className="size-4 text-primary" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-foreground">
        Daftar penerima hanya untuk pengguna berwenang
      </p>
      <p className="max-w-sm text-xs leading-5 text-muted-foreground">
        Data penerima bersifat pribadi. Masuk dengan akun staf atau pimpinan
        untuk melihat nama, kategori, dan rincian bantuannya. Ringkasan angka di
        halaman ini tetap terbuka untuk publik.
      </p>
      <Button asChild size="sm" className="mt-1">
        <Link href="/sign-in">Masuk untuk melihat rincian</Link>
      </Button>
    </div>
  );
}
