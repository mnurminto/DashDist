"use client";

/**
 * Salin teks ke clipboard dengan dua jalur:
 * 1. Clipboard API (butuh HTTPS atau localhost).
 * 2. `document.execCommand("copy")` lewat textarea tersembunyi, untuk browser
 *    lama atau konteks yang tidak mengizinkan Clipboard API.
 *
 * Mengembalikan `true` bila teks berhasil disalin.
 */
export async function salinKeClipboard(teks: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(teks);
      return true;
    }
  } catch {
    // Lanjut ke cara lama di bawah.
  }

  if (typeof document === "undefined") return false;

  try {
    const area = document.createElement("textarea");
    area.value = teks;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, teks.length);
    const berhasil = document.execCommand("copy");
    area.remove();
    return berhasil;
  } catch {
    return false;
  }
}
