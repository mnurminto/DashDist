/** Pemformat angka dan tanggal dengan gaya Indonesia. */

const nf = new Intl.NumberFormat("id-ID");

/** 1234567 -> "1.234.567" */
export function formatAngka(value: number): string {
  return nf.format(Math.round(value));
}

/** 55400000000 -> "Rp 55,4 miliar" */
export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} triliun`;
  }
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} miliar`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} juta`;
  }
  return `Rp ${formatAngka(value)}`;
}

/** ISO date -> "20 Okt 2026, 10.15" */
export function formatWaktu(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
    .format(date)
    .replace(".", ":");
}
