"use client";

/**
 * Klien tipis untuk API dashboard.
 *
 * Bentuk respons mengikuti kontrak backend: sukses `{ data }`, gagal
 * `{ error: { code, message } }`. Semua pemanggil mendapat objek yang sama,
 * jadi tidak perlu menebak isi respons di tiap komponen.
 */

export type GalatApi = {
  status: number;
  kode: string;
  pesan: string;
};

export type HasilApi<T> =
  { ok: true; data: T } | { ok: false; galat: GalatApi };

async function bacaJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function galatDari(status: number, isi: unknown): GalatApi {
  const error = (isi as { error?: { code?: string; message?: string } })?.error;
  return {
    status,
    kode: error?.code ?? "GALAT_TIDAK_DIKENAL",
    pesan: error?.message ?? "Permintaan gagal. Coba lagi.",
  };
}

/** GET JSON dengan penanganan galat seragam. */
export async function ambilApi<T>(jalur: string): Promise<HasilApi<T>> {
  try {
    const res = await fetch(jalur, {
      headers: { Accept: "application/json" },
    });
    const isi = await bacaJson(res);
    if (!res.ok) return { ok: false, galat: galatDari(res.status, isi) };
    return { ok: true, data: (isi as { data: T }).data };
  } catch {
    return {
      ok: false,
      galat: {
        status: 0,
        kode: "TIDAK_TERHUBUNG",
        pesan: "Tidak dapat menghubungi server.",
      },
    };
  }
}

/** POST JSON dengan penanganan galat seragam. */
export async function kirimApi<T>(
  jalur: string,
  body: unknown,
): Promise<HasilApi<T>> {
  try {
    const res = await fetch(jalur, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const isi = await bacaJson(res);
    if (!res.ok) return { ok: false, galat: galatDari(res.status, isi) };
    return { ok: true, data: (isi as { data: T }).data };
  } catch {
    return {
      ok: false,
      galat: {
        status: 0,
        kode: "TIDAK_TERHUBUNG",
        pesan: "Tidak dapat menghubungi server.",
      },
    };
  }
}
