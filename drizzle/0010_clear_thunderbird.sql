ALTER TABLE "log_pembaruan_data" ADD COLUMN "judul" varchar(160);--> statement-breakpoint
ALTER TABLE "log_pembaruan_data" ADD COLUMN "keterangan" varchar(240);--> statement-breakpoint
ALTER TABLE "log_pembaruan_data" ADD COLUMN "lingkup" varchar(32) DEFAULT 'semua';--> statement-breakpoint
ALTER TABLE "log_pembaruan_data" ADD COLUMN "status" varchar(24) DEFAULT 'sukses';--> statement-breakpoint
CREATE INDEX "log_pembaruan_waktu_idx" ON "log_pembaruan_data" USING btree ("waktu");--> statement-breakpoint
CREATE INDEX "log_pembaruan_lingkup_idx" ON "log_pembaruan_data" USING btree ("lingkup");