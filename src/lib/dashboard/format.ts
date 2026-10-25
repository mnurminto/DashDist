/** Pemformat angka dan tanggal dengan gaya Indonesia. */

const nf = new Intl.NumberFormat("id-ID");

/** 1234567 -> "1.234.567" */
export function formatAngka(value: number): string {
  return nf.format(Math.round(value));
}

/** Satu angka di belakang koma, dengan koma desimal Indonesia. */
function satuDesimal(value: number): string {
  return value.toLocaleString("id-ID", { maximumFractionDigits: 1 });
}

const JUTA = 1_000_000;
const MILIAR = 1_000_000_000;
const TRILIUN = 1_000_000_000_000;

/** 55400000000 -> "Rp 55,4 miliar" */
export function formatRupiah(value: number): string {
  if (value >= TRILIUN) {
    return `Rp ${satuDesimal(value / TRILIUN)} triliun`;
  }
  if (value >= MILIAR) {
    const miliar = Math.round((value / MILIAR) * 10) / 10;
    // 999,96 miliar dibulatkan menjadi "1 triliun", bukan "1.000 miliar".
    if (miliar >= 1000) {
      return `Rp ${satuDesimal(value / TRILIUN)} triliun`;
    }
    return `Rp ${satuDesimal(miliar)} miliar`;
  }
  if (value >= JUTA) {
    const juta = Math.round((value / JUTA) * 10) / 10;
    if (juta >= 1000) {
      return `Rp ${satuDesimal(value / MILIAR)} miliar`;
    }
    return `Rp ${satuDesimal(juta)} juta`;
  }
  return `Rp ${formatAngka(value)}`;
}

/**
 * Versi pendek untuk tempat sempit (legenda, sumbu grafik):
 * 1250000000 -> "Rp 1,3 M"; 640000000 -> "Rp 640 jt"; 850000 -> "Rp 850.000".
 *
 * Pembulatan ikut naik satuan supaya tidak muncul "Rp 1.000 jt".
 */
export function formatRupiahRingkas(value: number): string {
  const negatif = value < 0;
  const angka = Math.abs(value);
  let hasil: string;

  if (angka >= TRILIUN) {
    hasil = `${satuDesimal(Math.round((angka / TRILIUN) * 10) / 10)} T`;
  } else if (angka >= MILIAR) {
    const miliar = Math.round((angka / MILIAR) * 10) / 10;
    hasil =
      miliar >= 1000
        ? `${satuDesimal(Math.round((angka / TRILIUN) * 10) / 10)} T`
        : `${satuDesimal(miliar)} M`;
  } else if (angka >= JUTA) {
    const juta = Math.round(angka / JUTA);
    hasil =
      juta >= 1000
        ? `${satuDesimal(Math.round((angka / MILIAR) * 10) / 10)} M`
        : `${nf.format(juta)} jt`;
  } else {
    hasil = formatAngka(angka);
  }

  return `${negatif ? "−" : ""}Rp ${hasil}`;
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
