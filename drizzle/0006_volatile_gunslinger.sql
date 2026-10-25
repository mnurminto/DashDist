ALTER TABLE "penyaluran_bantuan" ADD COLUMN "tahun" integer GENERATED ALWAYS AS (extract(year from "tanggal")::int) STORED;--> statement-breakpoint
ALTER TABLE "penyaluran_bantuan" ADD COLUMN "bulan" integer GENERATED ALWAYS AS (extract(month from "tanggal")::int) STORED;--> statement-breakpoint
CREATE INDEX "penyaluran_waktu_idx" ON "penyaluran_bantuan" USING btree ("tahun","bulan");--> statement-breakpoint
CREATE INDEX "penyaluran_wilayah_waktu_idx" ON "penyaluran_bantuan" USING btree ("wilayah_id","tahun","bulan");--> statement-breakpoint
CREATE INDEX "penyaluran_program_waktu_idx" ON "penyaluran_bantuan" USING btree ("program_id","tahun","bulan");