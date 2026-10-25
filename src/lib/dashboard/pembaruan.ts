/** Contoh riwayat pembaruan data untuk notifikasi di header. */

export type PembaruanData = {
  id: string;
  judul: string;
  keterangan: string;
  /** Tanggal ISO kapan pembaruan masuk. */
  waktu: string;
};

export const PEMBARUAN_TERBARU: readonly PembaruanData[] = [
  {
    id: "pb-1",
    judul: "42 transaksi baru di Jakarta Selatan",
    keterangan: "Program Bedah Rumah (Rutilahu) · 5 kecamatan",
    waktu: "2026-10-25T02:10:00.000Z",
  },
  {
    id: "pb-2",
    judul: "Data penerima Beasiswa diperbarui",
    keterangan: "18 penerima baru diverifikasi",
    waktu: "2026-10-24T07:35:00.000Z",
  },
  {
    id: "pb-3",
    judul: "Penyaluran Kepulauan Seribu tersinkron",
    keterangan: "Program Bantuan Sembako · 2 kecamatan",
    waktu: "2026-10-22T04:20:00.000Z",
  },
];
