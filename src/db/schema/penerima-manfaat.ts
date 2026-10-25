import {
  index,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { wilayah } from "./wilayah";

/**
 * Penerima manfaat bantuan.
 *
 * NIK bersifat sensitif: kolomnya tidak diisi di tampilan publik dan nanti
 * hanya boleh diisi/dibaca oleh peran yang berwenang (lihat permissions).
 */
export const penerimaManfaat = pgTable(
  "penerima_manfaat",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    nama: varchar("nama", { length: 160 }).notNull(),
    /** Nomor identitas; boleh kosong dan disimpan terbatas. */
    nik: varchar("nik", { length: 64 }),
    wilayahId: uuid("wilayah_id")
      .notNull()
      .references(() => wilayah.id, { onDelete: "restrict" }),
    /** Kategori penerima, mis. fakir, yatim, dhuafa. */
    kategori: varchar("kategori", { length: 48 }).notNull().default("dhuafa"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("penerima_wilayah_idx").on(table.wilayahId),
    index("penerima_kategori_idx").on(table.kategori),
  ],
);
