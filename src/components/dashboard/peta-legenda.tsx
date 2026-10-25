import { TINGKAT_WARNA, type KelasWarna } from "@/lib/dashboard/skala-warna";
import { formatRupiahRingkas } from "@/lib/dashboard/format";

type Props = {
  /** Kelas warna dari skala yang dipakai peta saat ini. */
  kelas: readonly KelasWarna[];
};

/**
 * Legenda warna peta dalam bentuk batang gradien, dengan daftar rentang
 * lengkap yang tetap terbaca oleh pembaca layar.
 */
export function PetaLegenda({ kelas: daftarKelas }: Props) {
  const pertama = daftarKelas[0];
  const terakhir = daftarKelas[daftarKelas.length - 1];

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
      <span className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Dana tersalurkan
      </span>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {pertama.sampai !== null
            ? `< ${formatRupiahRingkas(pertama.sampai)}`
            : formatRupiahRingkas(pertama.dari)}
        </span>
        <span
          aria-hidden="true"
          className="h-1.5 w-36 rounded-full border border-white/5 sm:w-52"
          style={{
            backgroundImage: `linear-gradient(90deg, ${TINGKAT_WARNA.join(", ")})`,
          }}
        />
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {formatRupiahRingkas(terakhir.dari)}+
        </span>
      </div>

      <ul className="sr-only">
        {daftarKelas.map((kelas) => (
          <li key={kelas.warna}>
            {kelas.dari === pertama.dari
              ? `< ${formatRupiahRingkas(kelas.sampai ?? kelas.dari)}`
              : kelas.sampai === null
                ? `lebih dari ${formatRupiahRingkas(kelas.dari)}`
                : `${formatRupiahRingkas(kelas.dari)} sampai ${formatRupiahRingkas(kelas.sampai)}`}
          </li>
        ))}
      </ul>
    </div>
  );
}
