import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { getSession } from "@/lib/session";
import { siteConfig } from "@/config/site";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await getSession()) redirect(siteConfig.homePath);
  return (
    <div className="relative min-h-svh overflow-hidden">
      {/* Aksen latar agar halaman masuk terasa satu keluarga dengan dashboard. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(700px 380px at 78% -12%, rgba(186,171,86,0.14), transparent 62%), radial-gradient(560px 320px at 10% 110%, rgba(226,185,169,0.08), transparent 60%)",
        }}
      />

      <div className="relative">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
          <Brand />
        </header>

        <main
          id="main-content"
          className="mx-auto flex min-h-[75svh] max-w-6xl items-center justify-center px-6 py-10"
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-card/70 p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur sm:p-8">
            <span
              aria-hidden="true"
              className="mb-6 block h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent"
            />
            {children}
          </div>
        </main>

        <footer className="mx-auto max-w-6xl px-6 pb-8 text-[11px] text-muted-foreground sm:px-10">
          Dashboard Distribusi Baznas · Baznas Bazis Provinsi DKI Jakarta
        </footer>
      </div>
    </div>
  );
}
