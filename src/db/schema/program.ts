import {
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
    /** "aktif" atau "selesai". */
    status: varchar("status", { length: 24 }).notNull().default("aktif"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("program_status_idx").on(table.status)],
);
