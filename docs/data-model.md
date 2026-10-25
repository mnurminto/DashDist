# Model data bantuan

Skema ini menyimpan data penyaluran bantuan Baznas Bazis DKI Jakarta. Semua
tabel didefinisikan di `src/db/schema/` dan diekspor dari `src/db/schema/index.ts`.

| Tabel               | Isi                                                                 |
| ------------------- | ------------------------------------------------------------------- |
| `wilayah`           | Kecamatan dan kota administrasi. `parent_id` menunjuk kota induknya. |
| `program`           | Jenis bantuan (sembako, beasiswa, rutilahu, …) beserta statusnya.    |
| `penerima_manfaat`  | Penerima bantuan; `nik` opsional dan hanya untuk peran berwenang.    |
| `penyaluran_bantuan`| Satu baris per penyaluran: penerima, program, wilayah, dana, tanggal.|
| `log_pembaruan_data`| Riwayat impor/sinkronisasi untuk indikator "terakhir diperbarui".    |

## Hubungan

```
wilayah ──┬─< wilayah            (kota administrasi → kecamatan)
          ├─< penerima_manfaat
          └─< penyaluran_bantuan
program   ───< penyaluran_bantuan
penerima_manfaat ───< penyaluran_bantuan
```

- `penyaluran_bantuan.jumlah_dana` memakai `numeric(14,2)`, bukan float, supaya
  nilai rupiah tidak terkena pembulatan.
- `penyaluran_bantuan.diperbarui_pada` diperbarui otomatis setiap baris berubah
  (`$onUpdate`), sehingga kesegaran data bisa ditampilkan per rekaman.
- Semua foreign key memakai `restrict`/`cascade` yang eksplisit: menghapus
  wilayah atau program yang sudah dipakai akan ditolak, sedangkan menghapus
  penerima ikut menghapus riwayat penyalurannya.

## Indeks

Indeks disiapkan untuk pola query dashboard: rekap per wilayah + tanggal,
per program + tanggal, dan pencarian penerima per wilayah.
