import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatAngka,
  formatRupiah,
  formatRupiahRingkas,
  formatWaktu,
} from "../src/lib/dashboard/format.ts";

test("formatAngka memakai pemisah ribuan Indonesia", () => {
  assert.equal(formatAngka(111_992), "111.992");
  assert.equal(formatAngka(0), "0");
  assert.equal(formatAngka(2434.6), "2.435");
});

test("formatRupiah menulis satuan panjang", () => {
  assert.equal(formatRupiah(72_600_000_000), "Rp 72,6 miliar");
  assert.equal(formatRupiah(2_500_000), "Rp 2,5 juta");
  assert.equal(formatRupiah(999_950_000), "Rp 1 miliar");
  assert.equal(formatRupiah(648_127), "Rp 648.127");
});

test("formatRupiahRingkas memakai satuan pendek", () => {
  assert.equal(formatRupiahRingkas(448_000_000), "Rp 448 jt");
  assert.equal(formatRupiahRingkas(1_250_000_000), "Rp 1,3 M");
  assert.equal(formatRupiahRingkas(72_600_000_000), "Rp 72,6 M");
  assert.equal(formatRupiahRingkas(2_100_000_000), "Rp 2,1 M");
  assert.equal(formatRupiahRingkas(850_000), "Rp 850.000");
});

test("formatRupiahRingkas tidak menghasilkan '1000 jt' atau '1000 M'", () => {
  assert.equal(formatRupiahRingkas(999_600_000), "Rp 1 M");
  assert.equal(formatRupiahRingkas(999_960_000_000), "Rp 1 T");
  // 999,5 M masih wajar ditulis sebagai miliar.
  assert.equal(formatRupiahRingkas(999_500_000_000), "Rp 999,5 M");
});

test("formatWaktu memakai zona waktu Jakarta", () => {
  assert.equal(formatWaktu("2026-10-20T03:15:00.000Z"), "20 Okt 2026, 10:15");
});
