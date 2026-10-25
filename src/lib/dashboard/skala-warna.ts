/**
 * Skala warna peta.
 *
 * Satu sumber untuk peta dan legenda supaya warnanya tidak pernah beda.
 * Nilai dibagi menjadi enam kelas dengan batas persentil, jadi sebarannya
 * tetap enak dilihat meskipun angkanya nanti berubah.
 */

export const TINGKAT_WARNA = [
  "#22231d",
  "#2f3324",
  "#454b2c",
  "#62663a",
  "#8c8a4c",
  "#c3b064",
] as const;

/** Persentil batas antar kelas. */
const PERSENTIL = [0.18, 0.36, 0.56, 0.76, 0.9] as const;

export type KelasWarna = {
  warna: string;
  /** Batas bawah (inklusif). */
  dari: number;
  /** Batas atas (eksklusif); null berarti kelas terakhir tanpa batas. */
  sampai: number | null;
};

export type Skala = {
  /** Tingkat 0–5 untuk sebuah nilai. */
  tingkat: (nilai: number) => number;
  kelas: KelasWarna[];
};

export function buatSkala(nilai: readonly number[]): Skala {
  const urut = [...nilai].sort((a, b) => a - b);
  const batas = PERSENTIL.map(
    (persen) =>
      urut[Math.min(Math.floor(persen * urut.length), urut.length - 1)],
  );

  const tingkat = (dana: number) => {
    let hasil = 0;
    batas.forEach((b, i) => {
      if (dana >= b) hasil = i + 1;
    });
    return Math.min(hasil, TINGKAT_WARNA.length - 1);
  };

  const kelas: KelasWarna[] = TINGKAT_WARNA.map((warna, i) => ({
    warna,
    dari: i === 0 ? urut[0] : batas[i - 1],
    sampai: i === TINGKAT_WARNA.length - 1 ? null : batas[i],
  }));

  return { tingkat, kelas };
}
