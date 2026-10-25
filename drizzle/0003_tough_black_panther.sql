CREATE TABLE "wilayah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(32) NOT NULL,
	"nama" varchar(120) NOT NULL,
	"tipe" varchar(32) DEFAULT 'kecamatan' NOT NULL,
	"parent_id" uuid,
	"geojson" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wilayah_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" varchar(48) NOT NULL,
	"nama" varchar(160) NOT NULL,
	"deskripsi" text DEFAULT '' NOT NULL,
	"status" varchar(24) DEFAULT 'aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "program_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "penerima_manfaat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(160) NOT NULL,
	"nik" varchar(64),
	"wilayah_id" uuid NOT NULL,
	"kategori" varchar(48) DEFAULT 'dhuafa' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "penyaluran_bantuan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"penerima_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"wilayah_id" uuid NOT NULL,
	"jumlah_dana" numeric(14, 2) NOT NULL,
	"tanggal" date NOT NULL,
	"diperbarui_pada" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "log_pembaruan_data" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sumber" varchar(96) NOT NULL,
	"jumlah_rekaman" integer DEFAULT 0 NOT NULL,
	"waktu" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wilayah" ADD CONSTRAINT "wilayah_parent_id_wilayah_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."wilayah"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penerima_manfaat" ADD CONSTRAINT "penerima_manfaat_wilayah_id_wilayah_id_fk" FOREIGN KEY ("wilayah_id") REFERENCES "public"."wilayah"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penyaluran_bantuan" ADD CONSTRAINT "penyaluran_bantuan_penerima_id_penerima_manfaat_id_fk" FOREIGN KEY ("penerima_id") REFERENCES "public"."penerima_manfaat"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penyaluran_bantuan" ADD CONSTRAINT "penyaluran_bantuan_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "penyaluran_bantuan" ADD CONSTRAINT "penyaluran_bantuan_wilayah_id_wilayah_id_fk" FOREIGN KEY ("wilayah_id") REFERENCES "public"."wilayah"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wilayah_tipe_idx" ON "wilayah" USING btree ("tipe");--> statement-breakpoint
CREATE INDEX "wilayah_parent_idx" ON "wilayah" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "program_status_idx" ON "program" USING btree ("status");--> statement-breakpoint
CREATE INDEX "penerima_wilayah_idx" ON "penerima_manfaat" USING btree ("wilayah_id");--> statement-breakpoint
CREATE INDEX "penerima_kategori_idx" ON "penerima_manfaat" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "penyaluran_wilayah_tanggal_idx" ON "penyaluran_bantuan" USING btree ("wilayah_id","tanggal");--> statement-breakpoint
CREATE INDEX "penyaluran_program_tanggal_idx" ON "penyaluran_bantuan" USING btree ("program_id","tanggal");--> statement-breakpoint
CREATE INDEX "penyaluran_tanggal_idx" ON "penyaluran_bantuan" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "penyaluran_penerima_idx" ON "penyaluran_bantuan" USING btree ("penerima_id");