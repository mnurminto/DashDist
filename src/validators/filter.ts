import { z } from "zod";

/**
 * Filter dari dashboard memakai sentinel `semua` saat tidak ada pilihan.
 * Schema ini menormalkannya menjadi `undefined` supaya service tidak perlu
 * tahu soal sentinel UI.
 */
const sentinel = z
  .string()
  .trim()
  .transform((nilai) => (nilai === "semua" || nilai === "" ? undefined : nilai))
  .pipe(z.string().min(2).max(48).optional());

export const filterQuerySchema = z.object({
  wilayah: sentinel.optional(),
  program: sentinel.optional(),
  periode: z
    .string()
    .trim()
    .optional()
    .transform((nilai) =>
      !nilai || nilai === "semua" ? undefined : Number(nilai),
    )
    .pipe(
      z
        .number()
        .int()
        .min(2000)
        .max(2100, { message: "Periode harus tahun yang masuk akal." })
        .optional(),
    ),
});

export type FilterQuery = z.infer<typeof filterQuerySchema>;
