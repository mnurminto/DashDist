"use client";

import { useSyncExternalStore } from "react";
import type { PenggunaTiruan } from "./auth-tiruan";

const KUNCI_SESI = "baznas.sesi-tiruan";
const EVENT_SESI = "baznas-sesi-berubah";

let cache: { mentah: string | null; nilai: PenggunaTiruan | null } = {
  mentah: null,
  nilai: null,
};

function bacaMentah() {
  try {
    return window.localStorage.getItem(KUNCI_SESI);
  } catch {
    return null;
  }
}

function parse(mentah: string | null): PenggunaTiruan | null {
  if (!mentah) return null;
  try {
    const data = JSON.parse(mentah) as PenggunaTiruan;
    return data?.email && data?.peran ? data : null;
  } catch {
    return null;
  }
}

function getSnapshot(): PenggunaTiruan | null {
  const mentah = bacaMentah();
  if (mentah !== cache.mentah) cache = { mentah, nilai: parse(mentah) };
  return cache.nilai;
}

function getServerSnapshot() {
  return null;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT_SESI, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT_SESI, onChange);
  };
}

/** Sesi tiruan yang reaktif di seluruh komponen (null = belum masuk). */
export function useSesiTiruan() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Umumkan perubahan sesi ke semua komponen yang memakai hook di atas. */
export function kabarkanPerubahanSesi() {
  window.dispatchEvent(new Event(EVENT_SESI));
}
