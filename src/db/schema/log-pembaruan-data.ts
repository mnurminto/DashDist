import {
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
export const logPembaruanData = pgTable("log_pembaruan_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  /** Sumber data, mis. "impor-manual" atau "sinkronisasi". */
  sumber: varchar("sumber", { length: 96 }).notNull(),
  jumlahRekaman: integer("jumlah_rekaman").notNull().default(0),
  waktu: timestamp("waktu", { withTimezone: true }).defaultNow().notNull(),
});
