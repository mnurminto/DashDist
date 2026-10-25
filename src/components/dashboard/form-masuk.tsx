"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AKUN_TIRUAN, simpanSesi } from "@/lib/dashboard/auth-tiruan";
import { masukLewatApi } from "@/lib/dashboard/auth-api";

type Props = { /** Halaman tujuan setelah berhasil masuk. */ tujuan?: string };

export function FormMasuk({ tujuan = "/" }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [memproses, setMemproses] = useState(false);

  async function kirim(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGalat(null);
    setMemproses(true);

    const hasil = await masukLewatApi(email, sandi);
    if (!hasil.ok) {
      setGalat(`${hasil.pesan} Coba akun contoh di bawah.`);
      setMemproses(false);
      return;
    }

    simpanSesi(hasil.pengguna);
    router.push(tujuan);
  }

  function pilihAkun(akunEmail: string, akunSandi: string) {
    setEmail(akunEmail);
    setSandi(akunSandi);
    setGalat(null);
  }

  return (
    <div>
      <p className="text-[11px] font-medium tracking-[0.18em] text-primary uppercase">
        Masuk
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        Masuk ke dashboard
      </h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Gunakan akun contoh di bawah untuk mencoba. Login ini masih tiruan dan
        belum tersambung ke database.
      </p>

      <form onSubmit={kirim} className="mt-6 space-y-3" noValidate>
        <label className="block">
          <span className="text-[11px] font-medium text-muted-foreground">
            Email
          </span>
          <Input
            type="email"
            name="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@baznas.go.id"
            aria-invalid={galat ? true : undefined}
            className="mt-1.5 h-10"
          />
        </label>

        <label className="block">
          <span className="text-[11px] font-medium text-muted-foreground">
            Kata sandi
          </span>
          <Input
            type="password"
            name="sandi"
            autoComplete="current-password"
            required
            value={sandi}
            onChange={(e) => setSandi(e.target.value)}
            placeholder="••••••••"
            aria-invalid={galat ? true : undefined}
            className="mt-1.5 h-10"
          />
        </label>

        {galat && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          >
            {galat}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={memproses}>
          <LogIn aria-hidden="true" />
          {memproses ? "Memeriksa…" : "Masuk"}
        </Button>
      </form>

      <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-3">
        <p className="text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
          Akun contoh
        </p>
        <ul className="mt-2 space-y-2">
          {AKUN_TIRUAN.map((akun) => (
            <li
              key={akun.pengguna.email}
              className="flex flex-wrap items-center justify-between gap-2"
            >
              <span className="min-w-0">
                <span className="block truncate text-[11px] text-foreground">
                  {akun.pengguna.email}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  {akun.pengguna.nama} · {akun.pengguna.akses}
                </span>
              </span>
              <button
                type="button"
                onClick={() => pilihAkun(akun.pengguna.email, akun.sandi)}
                className="shrink-0 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                Isi otomatis
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Kembali ke dashboard tanpa masuk
      </Link>
    </div>
  );
}
