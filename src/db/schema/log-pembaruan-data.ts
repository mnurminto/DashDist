import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Riwayat pembaruan data bantuan.
 *
 * Dipakai untuk menampilkan "terakhir diperbarui" dan pemberitahuan data baru
 * tanpa harus menghitung ulang seluruh tabel penyaluran.
 */
export const logPembaruanData = pgTable(
  "log_pembaruan_data",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Sumber data, mis. "impor-manual" atau "sinkronisasi". */
    sumber: varchar("sumber", { length: 96 }).notNull(),
    jumlahRekaman: integer("jumlah_rekaman").notNull().default(0),
    waktu: timestamp("waktu", { withTimezone: true }).defaultNow().notNull(),
    /**
     * Ringkasan untuk notifikasi: judul singkat + keterangan, mis.
     * "42 transaksi baru di Jakarta Selatan" / "Program Rutilahu · 5 kecamatan".
     */
    judul: varchar("judul", { length: 160 }),
    keterangan: varchar("keterangan", { length: 240 }),
    /** Lingkup pembaruan: "wilayah", "program", atau "semua". */
    lingkup: varchar("lingkup", { length: 32 }).default("semua"),
    /** Status proses: "sukses" atau "sebagian". */
    status: varchar("status", { length: 24 }).default("sukses"),
  },
  (table) => [
    // Notifikasi selalu mengambil pembaruan terbaru lebih dulu.
    index("log_pembaruan_waktu_idx").on(table.waktu),
    index("log_pembaruan_lingkup_idx").on(table.lingkup),
  ],
);
