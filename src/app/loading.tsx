export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen">
      <div className="h-14 border-b border-border/60 bg-card/20" />

      <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8">
        <div className="h-2.5 w-44 animate-pulse rounded-full bg-white/10 motion-reduce:animate-none" />
        <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded-lg bg-white/10 motion-reduce:animate-none" />
        <div className="mt-3 h-3 w-96 max-w-full animate-pulse rounded-full bg-white/5 motion-reduce:animate-none" />

        <div className="mt-8 h-24 animate-pulse rounded-2xl border border-border/50 bg-card/50 motion-reduce:animate-none" />

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-border/50 bg-card/50 motion-reduce:animate-none"
            />
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="h-[420px] animate-pulse rounded-2xl border border-border/50 bg-card/50 motion-reduce:animate-none" />
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card/50 motion-reduce:animate-none" />
            <div className="h-64 animate-pulse rounded-2xl border border-border/50 bg-card/50 motion-reduce:animate-none" />
          </div>
        </div>

        <span className="sr-only">Memuat dashboard…</span>
      </div>
    </div>
  );
}
