import type { KelasWarna } from "@/lib/dashboard/skala-warna";
import { formatRupiahRingkas } from "@/lib/dashboard/format";

type Props = {
  /** Kelas warna dari skala yang dipakai peta saat ini. */
  kelas: readonly KelasWarna[];
};

/**
 * Legenda warna peta: menjelaskan arti tiap tingkat warna.
 * Warnanya diambil dari skala yang sama dengan peta.
 */
export function PetaLegenda({ kelas: daftarKelas }: Props) {
  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-medium text-foreground">
          Dana tersalurkan
        </span>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {daftarKelas.map((kelas) => {
            const label =
              kelas.sampai === null
                ? `≥ ${formatRupiahRingkas(kelas.dari)}`
                : kelas.dari === daftarKelas[0].dari
                  ? `< ${formatRupiahRingkas(kelas.sampai)}`
                  : `${formatRupiahRingkas(kelas.dari)} – ${formatRupiahRingkas(kelas.sampai)}`;

            return (
              <li key={kelas.warna} className="flex items-center gap-1.5">
                <span
                  className="inline-block size-3 rounded-[3px] border border-black/10"
                  style={{ backgroundColor: kelas.warna }}
                  aria-hidden="true"
                />
                <span className="text-xs text-muted-foreground">{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
