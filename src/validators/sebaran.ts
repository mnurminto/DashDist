import { z } from "zod";

/** Parameter query untuk endpoint sebaran bantuan. */
export const sebaranQuerySchema = z.object({
  /** Kode wilayah (BPS), mis. id3171010. Kosongkan untuk seluruh DKI. */
  wilayah: z.string().trim().min(3).max(32).optional(),
  /** Kode program, mis. beasiswa. Kosongkan untuk semua program. */
  program: z.string().trim().min(2).max(48).optional(),
  /** Tahun penyaluran, mis. 2025. */
  periode: z.coerce.number().int().min(2000).max(2100).optional(),
});

export type SebaranQuery = z.infer<typeof sebaranQuerySchema>;
