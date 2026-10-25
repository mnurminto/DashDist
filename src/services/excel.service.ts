import "server-only";
import type { BarisLaporan } from "@/services/sebaran.service";
import type { SebaranQuery } from "@/validators/sebaran";

/**
 * Pembuat berkas Excel (SpreadsheetML 2003) di sisi server.
 *
 * Dua lembar: "Ringkasan" berisi filter dan total, "Data" berisi rincian
 * wilayah × program × tahun dengan angka asli (bukan teks).
 */

export type RingkasanExcel = {
  wilayah: string;
  program: string;
  periode: string;
  penerima: number;
  dana: number;
  programAktif: number;
  transaksi: number;
  dicetak: string;
};

function xml(nilai: string | number) {
  return String(nilai)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sel(nilai: string | number, gaya?: string) {
  const atribut = gaya ? ` ss:StyleID="${gaya}"` : "";
  const tipe = typeof nilai === "number" ? "Number" : "String";
  return `<Cell${atribut}><Data ss:Type="${tipe}">${xml(nilai)}</Data></Cell>`;
}

const KEPALA = [
  "Kode wilayah",
  "Kecamatan",
  "Kota",
  "Program",
  "Tahun",
  "Penerima",
  "Dana",
  "Transaksi",
];

export function buatExcelLaporan(
  ringkasan: RingkasanExcel,
  baris: readonly BarisLaporan[],
): string {
  const barisRingkasan: [string, string | number][] = [
    ["Laporan Distribusi Bantuan Baznas Bazis DKI", ""],
    ["Wilayah", ringkasan.wilayah],
    ["Program", ringkasan.program],
    ["Periode", ringkasan.periode],
    ["Dicetak", ringkasan.dicetak],
    ["", ""],
    ["Penerima", ringkasan.penerima],
    ["Dana tersalurkan", ringkasan.dana],
    ["Program menyalurkan", ringkasan.programAktif],
    ["Transaksi", ringkasan.transaksi],
    ["Jumlah baris data", baris.length],
  ];

  const isiRingkasan = barisRingkasan
    .map(
      ([label, nilai], i) =>
        `<Row>${sel(label, i === 0 ? "judul" : "label")}${sel(
          nilai,
          typeof nilai === "number" && i >= 6 ? "angka" : undefined,
        )}</Row>`,
    )
    .join("");

  const isiData = baris
    .map(
      (item) =>
        `<Row>${sel(item.kodeWilayah)}${sel(item.kecamatan)}${sel(
          item.kota,
        )}${sel(item.program)}${sel(
          item.tahun === null ? "-" : String(item.tahun),
        )}${sel(item.penerima, "angka")}${sel(item.dana, "rupiah")}${sel(
          item.transaksi,
          "angka",
        )}</Row>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Font ss:FontName="Calibri" ss:Size="11"/>
  </Style>
  <Style ss:ID="judul"><Font ss:Bold="1" ss:Size="14"/></Style>
  <Style ss:ID="label"><Font ss:Bold="1"/></Style>
  <Style ss:ID="kepala">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#3F3F2E" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="angka"><NumberFormat ss:Format="#,##0"/></Style>
  <Style ss:ID="rupiah"><NumberFormat ss:Format="&quot;Rp&quot;\\ #,##0"/></Style>
 </Styles>
 <Worksheet ss:Name="Ringkasan">
  <Table>
   <Column ss:Width="220"/><Column ss:Width="260"/>
   ${isiRingkasan}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Data">
  <Table>
   <Column ss:Width="110"/><Column ss:Width="150"/><Column ss:Width="140"/>
   <Column ss:Width="180"/><Column ss:Width="60"/><Column ss:Width="80"/>
   <Column ss:Width="110"/><Column ss:Width="80"/>
   <Row>${KEPALA.map((judul) => sel(judul, "kepala")).join("")}</Row>
   ${isiData}
  </Table>
 </Worksheet>
</Workbook>`;
}

function labelFilter(filter: SebaranQuery) {
  return {
    wilayah: filter.wilayah ?? "Seluruh DKI Jakarta",
    program: filter.program ?? "Semua program",
    periode: filter.periode ? `Tahun ${filter.periode}` : "Semua tahun",
  };
}

/** Susun berkas Excel + nama berkas sesuai filter. */
export function susunExcel(
  filter: SebaranQuery,
  baris: readonly BarisLaporan[],
  total: {
    penerima: number;
    dana: number;
    program: number;
    transaksi: number;
  },
) {
  const label = labelFilter(filter);
  const dicetak = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const isi = buatExcelLaporan(
    {
      wilayah: label.wilayah,
      program: label.program,
      periode: label.periode,
      penerima: total.penerima,
      dana: total.dana,
      programAktif: total.program,
      transaksi: total.transaksi,
      dicetak,
    },
    baris,
  );

  const bagian = [
    "laporan-baznas",
    filter.wilayah ?? "dki",
    filter.program ?? "semua-program",
    filter.periode ? String(filter.periode) : "semua-tahun",
    new Date().toISOString().slice(0, 10),
  ];

  return { isi, namaBerkas: `${bagian.join("-")}.xls` };
}
