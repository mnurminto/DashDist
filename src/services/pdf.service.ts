import "server-only";

/**
 * Pembuat PDF sederhana tanpa pustaka tambahan.
 *
 * Menghasilkan PDF 1.4 satu kolom (teks + tabel) memakai font standar
 * Helvetica. Cukup untuk laporan distribusi: judul, ringkasan, tabel
 * berhalaman, dan nomor halaman.
 */

const HALAMAN_LEBAR = 595; // A4 dalam point
const HALAMAN_TINGGI = 842;
const MARGIN = 42;
const LEBAR_ISI = HALAMAN_LEBAR - MARGIN * 2;

export type KolomPdf = {
  judul: string;
  lebar: number;
  rata?: "kiri" | "kanan";
};

export type IsiPdf = {
  judul: string;
  subjudul: string;
  dibuatPada: string;
  ringkasan: { label: string; nilai: string }[];
  catatan: string;
  kolom: KolomPdf[];
  baris: string[][];
  total?: { label: string; nilai: string[] };
};

function teksPdf(nilai: string) {
  // Font standar hanya mendukung WinAnsi; karakter di luar itu diganti.
  const aman = nilai.replace(/[^\x20-\x7E]/g, "");
  return aman
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Perkiraan lebar teks Helvetica (cukup akurat untuk perataan kanan). */
function lebarTeks(nilai: string, ukuran: number) {
  return nilai.length * ukuran * 0.5;
}

type Operasi = string;

function potong(nilai: string, lebar: number, ukuran: number) {
  let hasil = nilai;
  while (hasil.length > 0 && lebarTeks(hasil, ukuran) > lebar) {
    hasil = hasil.slice(0, -1);
  }
  return hasil.length < nilai.length ? `${hasil.slice(0, -1)}…` : hasil;
}

class Halaman {
  operasi: Operasi[] = [];

  teks(x: number, y: number, isi: string, ukuran: number, tebal = false) {
    this.operasi.push(
      `BT /${tebal ? "F2" : "F1"} ${ukuran} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${teksPdf(isi)}) Tj ET`,
    );
  }

  teksKanan(x: number, y: number, isi: string, ukuran: number) {
    this.teks(x - lebarTeks(isi, ukuran), y, isi, ukuran);
  }

  garis(x1: number, y: number, x2: number) {
    this.operasi.push(
      `0.7 w 0.72 0.72 0.72 RG ${x1.toFixed(2)} ${y.toFixed(2)} m ${x2.toFixed(2)} ${y.toFixed(2)} l S`,
    );
  }
}

function formatAngka(nilai: number) {
  return new Intl.NumberFormat("id-ID").format(nilai);
}

export function buatPdfLaporan(isi: IsiPdf): Uint8Array {
  const halaman: Halaman[] = [];
  const barisPerHalaman = 42;

  // Halaman pertama memuat judul + ringkasan, jadi lebih sedikit baris.
  let sisa = [...isi.baris];
  let indeksHalaman = 0;

  while (sisa.length > 0 || indeksHalaman === 0) {
    const h = new Halaman();
    let y = HALAMAN_TINGGI - MARGIN;

    h.teks(MARGIN, y, isi.judul, 15, true);
    y -= 16;
    h.teks(MARGIN, y, isi.subjudul, 9);
    y -= 12;
    h.teks(MARGIN, y, `Dicetak ${isi.dibuatPada}`, 8);
    y -= 10;
    h.garis(MARGIN, y, HALAMAN_LEBAR - MARGIN);
    y -= 18;

    if (indeksHalaman === 0) {
      let x = MARGIN;
      for (const item of isi.ringkasan) {
        h.teks(x, y, item.label.toUpperCase(), 7);
        h.teks(x, y - 12, item.nilai, 11, true);
        x += LEBAR_ISI / isi.ringkasan.length;
      }
      y -= 30;
    }

    // Kepala tabel
    let x = MARGIN;
    h.teks(MARGIN, y, "Tabel penyaluran", 9, true);
    y -= 14;
    isi.kolom.forEach((kolom) => {
      if (kolom.rata === "kanan")
        h.teksKanan(x + kolom.lebar - 4, y, kolom.judul, 8);
      else h.teks(x, y, kolom.judul, 8);
      x += kolom.lebar;
    });
    y -= 4;
    h.garis(MARGIN, y, HALAMAN_LEBAR - MARGIN);
    y -= 12;

    const kapasitas =
      indeksHalaman === 0 ? barisPerHalaman - 6 : barisPerHalaman;
    const potongBaris = sisa.slice(0, kapasitas);
    sisa = sisa.slice(kapasitas);

    for (const baris of potongBaris) {
      let kolomX = MARGIN;
      baris.forEach((sel, i) => {
        const kolom = isi.kolom[i];
        const teks = potong(sel, kolom.lebar - 6, 8);
        if (kolom.rata === "kanan")
          h.teksKanan(kolomX + kolom.lebar - 4, y, teks, 8);
        else h.teks(kolomX, y, teks, 8);
        kolomX += kolom.lebar;
      });
      y -= 13;
    }

    if (sisa.length === 0 && isi.total) {
      h.garis(MARGIN, y + 4, HALAMAN_LEBAR - MARGIN);
      h.teks(MARGIN, y - 8, isi.total.label, 9, true);
      let kolomX = MARGIN;
      isi.total.nilai.forEach((nilai, i) => {
        const kolom = isi.kolom[isi.kolom.length - isi.total!.nilai.length + i];
        h.teksKanan(kolomX + kolom.lebar - 4, y - 8, nilai, 9);
        kolomX += kolom.lebar;
      });
      y -= 26;
    }

    h.garis(MARGIN, MARGIN + 16, HALAMAN_LEBAR - MARGIN);
    h.teks(MARGIN, MARGIN + 6, isi.catatan, 7);
    h.teksKanan(
      HALAMAN_LEBAR - MARGIN,
      MARGIN + 6,
      `Halaman ${indeksHalaman + 1}`,
      7,
    );

    halaman.push(h);
    indeksHalaman += 1;

    // Jaga agar loop berhenti kalau tidak ada baris sama sekali.
    if (isi.baris.length === 0) break;
  }

  return susunPdf(halaman);
}

function susunPdf(halaman: Halaman[]): Uint8Array {
  const objek: string[] = [];
  const jumlahHalaman = halaman.length;

  // 1: catalog, 2: pages, 3: font Helvetica, 4: font Helvetica-Bold
  const nomorHalaman = halaman.map((_, i) => 5 + i * 2);
  objek.push(`<< /Type /Catalog /Pages 2 0 R >>`);
  objek.push(
    `<< /Type /Pages /Kids [${nomorHalaman.map((n) => `${n} 0 R`).join(" ")}] /Count ${jumlahHalaman} >>`,
  );
  objek.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,
  );
  objek.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
  );

  halaman.forEach((h, i) => {
    const nomorIsi = nomorHalaman[i] + 1;
    objek.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${HALAMAN_LEBAR} ${HALAMAN_TINGGI}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${nomorIsi} 0 R >>`,
    );

    const isi = h.operasi.join("\n");
    objek.push(
      `<< /Length ${Buffer.byteLength(isi, "latin1")} >>\nstream\n${isi}\nendstream`,
    );
  });

  let keluaran = "%PDF-1.4\n";
  const offset: number[] = [];

  objek.forEach((isi, i) => {
    offset.push(Buffer.byteLength(keluaran, "latin1"));
    keluaran += `${i + 1} 0 obj\n${isi}\nendobj\n`;
  });

  const awalXref = Buffer.byteLength(keluaran, "latin1");
  keluaran += `xref\n0 ${objek.length + 1}\n0000000000 65535 f \n`;
  for (const posisi of offset) {
    keluaran += `${posisi.toString().padStart(10, "0")} 00000 n \n`;
  }
  keluaran += `trailer\n<< /Size ${objek.length + 1} /Root 1 0 R >>\nstartxref\n${awalXref}\n%%EOF\n`;

  return new Uint8Array(Buffer.from(keluaran, "latin1"));
}

export { formatAngka };
