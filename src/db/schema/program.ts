import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/** Program bantuan yang disalurkan Baznas Bazis. */
export const program = pgTable(
  "program",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Kode pendek yang dipakai di filter, mis. "sembako". */
    kode: varchar("kode", { length: 48 }).notNull().unique(),
    nama: varchar("nama", { length: 160 }).notNull(),
    deskripsi: text("deskripsi").notNull().default(""),
    /** Hanya "aktif" atau "selesai" — dijaga oleh constraint di bawah. */
    status: varchar("status", { length: 24 }).notNull().default("aktif"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("program_status_idx").on(table.status),
    // Statistik "program berjalan" menghitung status, jadi nilainya dibatasi
    // supaya tidak ada status lain yang lolos tanpa sengaja.
    check("program_status_check", sql`${table.status} in ('aktif', 'selesai')`),
  ],
);
