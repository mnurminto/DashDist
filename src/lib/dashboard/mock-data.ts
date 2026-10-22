import geo from "./jakarta-geo.json";
import { buatSkala } from "./skala-warna";

/**
 * Data contoh (mock) untuk dashboard.
 *
 * Angka di bawah ini TIDAK diambil dari database — masih data tiruan agar
 * tampilan peta bisa dibangun lebih dulu. Nanti, saat task backend selesai,
 * modul ini diganti dengan hasil query ke PostgreSQL.
 */

export type Kecamatan = {
  /** Kode wilayah resmi BPS, mis. id3171010 */
  code: string;
  nama: string;
  /** Kota administrasi induk, mis. "Jakarta Pusat" */
  kota: string;
  /** Jumlah orang yang menerima bantuan */
  penerima: number;
  /** Total dana tersalurkan dalam rupiah */
  dana: number;
  /** Banyak transaksi penyaluran */
  penyaluran: number;
  /** Jumlah program yang menyalurkan bantuan di wilayah ini */
  program: number;
};

export type Program = {
  id: string;
  nama: string;
  deskripsi: string;
};

/** Program bantuan yang dipakai sebagai contoh. */
export const PROGRAM: readonly Program[] = [
  {
    id: "sembako",
    nama: "Bantuan Sembako",
    deskripsi: "Paket kebutuhan pokok bulanan untuk keluarga prasejahtera.",
  },
  {
    id: "rutilahu",
    nama: "Bedah Rumah (Rutilahu)",
    deskripsi: "Perbaikan rumah tidak layak huni milik warga dhuafa.",
  },
  {
    id: "beasiswa",
    nama: "Beasiswa Pendidikan",
    deskripsi: "Bantuan biaya sekolah untuk pelajar dan mahasiswa.",
  },
  {
    id: "kesehatan",
    nama: "Layanan Kesehatan",
    deskripsi: "Pengobatan gratis dan pendampingan kesehatan lansia.",
  },
  {
    id: "ekonomi",
    nama: "Ekonomi Produktif",
    deskripsi: "Modal usaha dan pelatihan untuk usaha mikro mustahik.",
  },
  {
    id: "santunan",
    nama: "Santunan Yatim & Dhuafa",
    deskripsi: "Santunan rutin untuk yatim dan penyandang dhuafa.",
  },
] as const;

/** PRNG kecil + deterministik supaya angka contoh tidak berubah tiap render. */
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

function buildKecamatan(): Kecamatan[] {
  const all = [
    ...geo.kecamatan.map((k) => ({ ...k, seribu: false })),
    ...geo.seribu.items.map((k) => ({ ...k, seribu: true })),
  ];

  return all
    .map((item) => {
      const rand = seededRandom(item.code);
      const penerima = item.seribu
        ? 120 + Math.round(rand() * 480)
        : 320 + Math.round(rand() * 4300);
      const perOrang = 350_000 + Math.round(rand() * 550_000);
      const dana = Math.round((penerima * perOrang) / 100_000) * 100_000;
      const penyaluran = Math.round(penerima * (0.85 + rand() * 0.5));

      return {
        code: item.code,
        nama: item.nama,
        kota: item.kota,
        penerima,
        dana,
        penyaluran,
        program: 2 + Math.round(rand() * 4),
      } satisfies Kecamatan;
    })
    .sort((a, b) => a.nama.localeCompare(b.nama, "id"));
}

/** Semua kecamatan DKI Jakarta (44 di daratan + 2 di Kepulauan Seribu). */
export const KECAMATAN: readonly Kecamatan[] = buildKecamatan();

export type Ringkasan = {
  penerima: number;
  dana: number;
  program: number;
  penyaluran: number;
};

function jumlahkan(rows: readonly Kecamatan[]): Ringkasan {
  return rows.reduce<Ringkasan>(
    (total, row) => ({
      penerima: total.penerima + row.penerima,
      dana: total.dana + row.dana,
      program: total.program + row.program,
      penyaluran: total.penyaluran + row.penyaluran,
    }),
    { penerima: 0, dana: 0, program: 0, penyaluran: 0 },
  );
}

/** Total seluruh DKI Jakarta. */
export const RINGKASAN_DKI: Ringkasan = jumlahkan(KECAMATAN);

/** Rekap per kota administrasi. */
export const RINGKASAN_KOTA = [...new Set(KECAMATAN.map((k) => k.kota))]
  .map((kota) => {
    const rows = KECAMATAN.filter((k) => k.kota === kota);
    return { kota, jumlahKecamatan: rows.length, ...jumlahkan(rows) };
  })
  .sort((a, b) => b.dana - a.dana);

/** Waktu data terakhir diperbarui (contoh, nanti diisi dari log pembaruan). */
export const TERAKHIR_DIPERBARUI = "2026-10-20T03:15:00.000Z";

/** Data batas wilayah yang sudah diproyeksikan ke koordinat SVG. */
export const GEO = geo;

/** Skala warna dipakai bersama oleh peta dan legenda. */
export const SKALA = buatSkala(KECAMATAN.map((kecamatan) => kecamatan.dana));
