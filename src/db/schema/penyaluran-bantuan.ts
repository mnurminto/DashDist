import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { penerimaManfaat } from "./penerima-manfaat";
import { program } from "./program";
import { wilayah } from "./wilayah";

/**
 * Catatan setiap bantuan yang disalurkan — inti data dashboard.
 *
 * `jumlah_dana` memakai numeric supaya nilai rupiah tidak terkena pembulatan
 * floating point.
 */
export const penyaluranBantuan = pgTable(
  "penyaluran_bantuan",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    penerimaId: uuid("penerima_id")
      .notNull()
      .references(() => penerimaManfaat.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => program.id, { onDelete: "restrict" }),
    wilayahId: uuid("wilayah_id")
      .notNull()
      .references(() => wilayah.id, { onDelete: "restrict" }),
    jumlahDana: numeric("jumlah_dana", { precision: 14, scale: 2 }).notNull(),
    /** Tanggal penyaluran (tanpa jam). */
    tanggal: date("tanggal", { mode: "date" }).notNull(),
    /**
     * Tahun & bulan diturunkan otomatis dari `tanggal` (generated column).
     * Grafik tren mengelompokkan data per bulan/tahun, jadi kolom ini membuat
     * agregasinya cepat dan tidak perlu fungsi pada kolom tanggal.
     */
    tahun: integer("tahun").generatedAlwaysAs(
      sql`extract(year from "tanggal")::int`,
    ),
    bulan: integer("bulan").generatedAlwaysAs(
      sql`extract(month from "tanggal")::int`,
    ),
    /** Waktu data terakhir diperbarui, dipakai indikator kesegaran data. */
    diperbaruiPada: timestamp("diperbarui_pada", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("penyaluran_wilayah_tanggal_idx").on(table.wilayahId, table.tanggal),
    index("penyaluran_program_tanggal_idx").on(table.programId, table.tanggal),
    index("penyaluran_tanggal_idx").on(table.tanggal),
    index("penyaluran_penerima_idx").on(table.penerimaId),
    // Filter dashboard bekerja per tahun (extract year) dan sering
    // mengombinasikan program + wilayah, jadi keduanya diberi indeks khusus.
    index("penyaluran_tahun_idx").on(sql`extract(year from ${table.tanggal})`),
    index("penyaluran_program_wilayah_idx").on(
      table.programId,
      table.wilayahId,
      table.tanggal,
    ),
    // Grafik bulanan/tahunan memakai kolom turunan ini.
    index("penyaluran_waktu_idx").on(table.tahun, table.bulan),
    index("penyaluran_wilayah_waktu_idx").on(
      table.wilayahId,
      table.tahun,
      table.bulan,
    ),
    index("penyaluran_program_waktu_idx").on(
      table.programId,
      table.tahun,
      table.bulan,
    ),
    // Laporan diekspor dengan kombinasi wilayah + program + tahun.
    index("penyaluran_laporan_wilayah_program_tahun_idx").on(
      table.wilayahId,
      table.programId,
      table.tahun,
    ),
    // Laporan per program untuk seluruh DKI (tanpa filter wilayah).
    index("penyaluran_laporan_program_tahun_idx").on(
      table.tahun,
      table.programId,
    ),
  ],
);
