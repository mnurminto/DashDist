/**
 * Data contoh tingkat transaksi.
 *
 * Setiap kecamatan dipecah menjadi baris per (program × tahun) dengan angka
 * deterministik, sehingga filter wilayah/program/periode benar-benar mengubah
 * hasil. Totalnya tetap sama dengan angka per kecamatan di `mock-data.ts`.
 */

import { KECAMATAN, PROGRAM, type Kecamatan } from "./mock-data";

export type BarisPenyaluran = {
  /** Kode kecamatan. */
  kecamatan: string;
  /** Id program di `PROGRAM`. */
  program: string;
  /** Tahun penyaluran, mis. "2025". */
  tahun: string;
  /** Bulan penyaluran, 1–12. */
  bulan: number;
  penerima: number;
  dana: number;
  transaksi: number;
};

export type WilayahRingkas = {
  code: string;
  nama: string;
  kota: string;
  penerima: number;
  dana: number;
  transaksi: number;
  /** Banyak program berbeda yang menyalurkan di wilayah ini. */
  program: number;
};

export type Ringkasan = {
  penerima: number;
  dana: number;
  transaksi: number;
  program: number;
  wilayah: number;
};

/** Nilai filter; "semua" berarti tanpa penyaringan. */
export type FilterState = {
  wilayah: string;
  program: string;
  periode: string;
};

export const FILTER_AWAL: FilterState = {
  wilayah: "semua",
  program: "semua",
  periode: "semua",
};

export const TAHUN_TERSEDIA = ["2026", "2025", "2024"] as const;

/** Bulan 1–12, dipakai untuk sebaran bulanan pada data contoh. */
export const BULAN = Array.from({ length: 12 }, (_, i) => i + 1);

export function jumlahFilterAktif(nilai: FilterState): number {
  return Object.values(nilai).filter((isi) => isi !== "semua").length;
}

function seededRandom(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Membagi satu angka menjadi beberapa bagian sesuai bobot.
 * Sisa pembulatan diberikan ke bagian dengan pecahan terbesar supaya
 * jumlah seluruh bagian tetap sama dengan angka aslinya.
 */
function bagiProporsional(total: number, bobot: number[]): number[] {
  const jumlahBobot = bobot.reduce((a, b) => a + b, 0);
  if (jumlahBobot === 0 || total === 0) return bobot.map(() => 0);

  const mentah = bobot.map((b) => (total * b) / jumlahBobot);
  const hasil = mentah.map(Math.floor);
  const sisa = total - hasil.reduce((a, b) => a + b, 0);
  const urutan = mentah
    .map((nilai, index) => ({ index, pecahan: nilai - Math.floor(nilai) }))
    .sort((a, b) => b.pecahan - a.pecahan);

  for (let i = 0; i < sisa; i += 1) {
    hasil[urutan[i % urutan.length].index] += 1;
  }
  return hasil;
}

function buatBaris(kecamatan: Kecamatan): BarisPenyaluran[] {
  const acak = seededRandom(`${kecamatan.code}-penyaluran`);
  const bobotProgram = PROGRAM.map(() => 0.35 + acak());
  const bobotTahun = TAHUN_TERSEDIA.map(() => 0.35 + acak());
  const bobotBulan = BULAN.map(() => 0.35 + acak());

  // Sebar penerima ke setiap program, lalu ke setiap tahun, lalu ke bulan.
  const perProgram = bagiProporsional(kecamatan.penerima, bobotProgram);
  const danaPerProgram = bagiProporsional(kecamatan.dana, bobotProgram);
  const transaksiPerProgram = bagiProporsional(
    kecamatan.penyaluran,
    bobotProgram,
  );

  const hasil: BarisPenyaluran[] = [];
  PROGRAM.forEach((program, iProgram) => {
    const penerimaTahunan = bagiProporsional(perProgram[iProgram], bobotTahun);
    const danaTahunan = bagiProporsional(danaPerProgram[iProgram], bobotTahun);
    const transaksiTahunan = bagiProporsional(
      transaksiPerProgram[iProgram],
      bobotTahun,
    );

    TAHUN_TERSEDIA.forEach((tahun, iTahun) => {
      if (
        penerimaTahunan[iTahun] === 0 &&
        danaTahunan[iTahun] === 0 &&
        transaksiTahunan[iTahun] === 0
      ) {
        return;
      }

      const penerimaBulanan = bagiProporsional(
        penerimaTahunan[iTahun],
        bobotBulan,
      );
      const danaBulanan = bagiProporsional(danaTahunan[iTahun], bobotBulan);
      const transaksiBulanan = bagiProporsional(
        transaksiTahunan[iTahun],
        bobotBulan,
      );

      BULAN.forEach((bulan, iBulan) => {
        if (
          penerimaBulanan[iBulan] === 0 &&
          danaBulanan[iBulan] === 0 &&
          transaksiBulanan[iBulan] === 0
        ) {
          return;
        }
        hasil.push({
          kecamatan: kecamatan.code,
          program: program.id,
          tahun,
          bulan,
          penerima: penerimaBulanan[iBulan],
          dana: danaBulanan[iBulan],
          transaksi: transaksiBulanan[iBulan],
        });
      });
    });
  });

  return hasil;
}

/** Buku besar contoh: 46 kecamatan × 6 program × 3 tahun × 12 bulan. */
export const PENYALURAN: readonly BarisPenyaluran[] =
  KECAMATAN.flatMap(buatBaris);

/** Terapkan filter ke buku besar. */
export function saring(filter: FilterState): BarisPenyaluran[] {
  return PENYALURAN.filter(
    (baris) =>
      (filter.wilayah === "semua" || baris.kecamatan === filter.wilayah) &&
      (filter.program === "semua" || baris.program === filter.program) &&
      (filter.periode === "semua" || baris.tahun === filter.periode),
  );
}

export function ringkasTotal(rows: readonly BarisPenyaluran[]): Ringkasan {
  const program = new Set<string>();
  const wilayah = new Set<string>();
  let penerima = 0;
  let dana = 0;
  let transaksi = 0;

  for (const baris of rows) {
    penerima += baris.penerima;
    dana += baris.dana;
    transaksi += baris.transaksi;
    program.add(baris.program);
    wilayah.add(baris.kecamatan);
  }

  return {
    penerima,
    dana,
    transaksi,
    program: program.size,
    wilayah: wilayah.size,
  };
}

/** Rekap per kecamatan dari baris yang sudah difilter. */
export function ringkasPerWilayah(
  rows: readonly BarisPenyaluran[],
): Map<string, WilayahRingkas> {
  const hasil = new Map<string, WilayahRingkas>();

  for (const baris of rows) {
    const meta = KECAMATAN.find((k) => k.code === baris.kecamatan);
    if (!meta) continue;

    const sekarang =
      hasil.get(baris.kecamatan) ??
      ({
        code: meta.code,
        nama: meta.nama,
        kota: meta.kota,
        penerima: 0,
        dana: 0,
        transaksi: 0,
        program: 0,
      } satisfies WilayahRingkas);

    hasil.set(baris.kecamatan, {
      ...sekarang,
      penerima: sekarang.penerima + baris.penerima,
      dana: sekarang.dana + baris.dana,
      transaksi: sekarang.transaksi + baris.transaksi,
    });
  }

  // Hitung jumlah program unik per wilayah.
  const programPerWilayah = new Map<string, Set<string>>();
  for (const baris of rows) {
    const daftar = programPerWilayah.get(baris.kecamatan) ?? new Set<string>();
    daftar.add(baris.program);
    programPerWilayah.set(baris.kecamatan, daftar);
  }
  for (const [kode, daftar] of programPerWilayah) {
    const wilayah = hasil.get(kode);
    if (wilayah) wilayah.program = daftar.size;
  }

  return hasil;
}

const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

export type TitikBulanan = {
  tahun: number;
  bulan: number;
  /** Label pendek, mis. "Mar 2025". */
  label: string;
  dana: number;
  penerima: number;
  transaksi: number;
};

/** Rekap per bulan (urut lama → baru) untuk grafik tren. */
export function ringkasBulanan(
  rows: readonly BarisPenyaluran[],
): TitikBulanan[] {
  const peta = new Map<string, TitikBulanan>();

  for (const baris of rows) {
    const kunci = `${baris.tahun}-${String(baris.bulan).padStart(2, "0")}`;
    const sekarang =
      peta.get(kunci) ??
      ({
        tahun: Number(baris.tahun),
        bulan: baris.bulan,
        label: `${NAMA_BULAN[baris.bulan - 1]} ${baris.tahun}`,
        dana: 0,
        penerima: 0,
        transaksi: 0,
      } satisfies TitikBulanan);

    peta.set(kunci, {
      ...sekarang,
      dana: sekarang.dana + baris.dana,
      penerima: sekarang.penerima + baris.penerima,
      transaksi: sekarang.transaksi + baris.transaksi,
    });
  }

  return [...peta.values()].sort(
    (a, b) => a.tahun - b.tahun || a.bulan - b.bulan,
  );
}

/** Rekap per tahun (urut lama → baru) untuk mode tahunan. */
export function ringkasTahunan(rows: readonly BarisPenyaluran[]): {
  tahun: number;
  label: string;
  dana: number;
  penerima: number;
  transaksi: number;
}[] {
  const peta = new Map<
    number,
    {
      tahun: number;
      label: string;
      dana: number;
      penerima: number;
      transaksi: number;
    }
  >();

  for (const baris of rows) {
    const tahun = Number(baris.tahun);
    const sekarang = peta.get(tahun) ?? {
      tahun,
      label: String(tahun),
      dana: 0,
      penerima: 0,
      transaksi: 0,
    };
    peta.set(tahun, {
      ...sekarang,
      dana: sekarang.dana + baris.dana,
      penerima: sekarang.penerima + baris.penerima,
      transaksi: sekarang.transaksi + baris.transaksi,
    });
  }

  return [...peta.values()].sort((a, b) => a.tahun - b.tahun);
}
