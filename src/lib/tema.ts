"use client";

/**
 * Pengaturan tema terang/gelap.
 *
 * Tema disimpan di localStorage dan diterapkan sebagai kelas `dark` pada
 * elemen <html>. Skrip kecil di layout sudah menerapkannya sebelum halaman
 * dilukis, jadi tidak ada kedipan saat memuat ulang.
 */

export type Tema = "terang" | "gelap";

const KUNCI = "baznas.tema";
const EVENT = "baznas-tema-berubah";

export function bacaTema(): Tema {
  if (typeof window === "undefined") return "terang";
  try {
    return window.localStorage.getItem(KUNCI) === "gelap" ? "gelap" : "terang";
  } catch {
    return "terang";
  }
}

export function temaAktif(): Tema {
  if (typeof document === "undefined") return "terang";
  return document.documentElement.classList.contains("dark")
    ? "gelap"
    : "terang";
}

export function terapkanTema(tema: Tema) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", tema === "gelap");
  root.style.colorScheme = tema === "gelap" ? "dark" : "light";
  try {
    window.localStorage.setItem(KUNCI, tema);
  } catch {
    // Mode privat bisa memblokir localStorage; tema tetap berlaku sesi ini.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function gantiTema() {
  terapkanTema(temaAktif() === "gelap" ? "terang" : "gelap");
}

/** Nama event agar komponen lain bisa ikut bereaksi bila perlu. */
export const EVENT_TEMA = EVENT;
