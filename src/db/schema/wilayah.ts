import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/**
 * Wilayah administratif DKI Jakarta.
 *
 * Satu baris = satu kecamatan atau kota administrasi. `parent_id` menunjuk ke
 * kota administrasi induknya sehingga hierarki bisa ditelusuri.
 */
export const wilayah = pgTable(
  "wilayah",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    /** Kode wilayah BPS, mis. id3171010. */
    kode: varchar("kode", { length: 32 }).notNull().unique(),
    nama: varchar("nama", { length: 120 }).notNull(),
    /** "kecamatan" atau "kota_administrasi". */
    tipe: varchar("tipe", { length: 32 }).notNull().default("kecamatan"),
    parentId: uuid("parent_id").references((): AnyPgColumn => wilayah.id, {
      onDelete: "set null",
    }),
    /** Batas wilayah (GeoJSON) bila nanti perlu digambar dari database. */
    geojson: text("geojson"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("wilayah_tipe_idx").on(table.tipe),
    index("wilayah_parent_idx").on(table.parentId),
  ],
);
