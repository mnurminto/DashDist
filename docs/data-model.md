# Model data bantuan

Skema ini menyimpan data penyaluran bantuan Baznas Bazis DKI Jakarta. Semua
tabel didefinisikan di `src/db/schema/` dan diekspor dari `src/db/schema/index.ts`.

| Tabel                | Isi                                                                   |
| -------------------- | --------------------------------------------------------------------- |
| `wilayah`            | Kecamatan dan kota administrasi. `parent_id` menunjuk kota induknya.  |
| `program`            | Jenis bantuan (sembako, beasiswa, rutilahu, …) beserta statusnya.     |
| `penerima_manfaat`   | Penerima bantuan; `nik` opsional dan hanya untuk peran berwenang.     |
| `penyaluran_bantuan` | Satu baris per penyaluran: penerima, program, wilayah, dana, tanggal. |
| `log_pembaruan_data` | Riwayat impor/sinkronisasi untuk indikator "terakhir diperbarui".     |

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

- `penyaluran_laporan_wilayah_program_tahun_idx` — laporan per wilayah + program
  - tahun (ekspor CSV/Excel/PDF).
- `penyaluran_laporan_program_tahun_idx` — laporan per program untuk seluruh DKI.
- `penyaluran_waktu_idx`, `penyaluran_wilayah_waktu_idx`,
  `penyaluran_program_waktu_idx` — grafik bulanan/tahunan memakai kolom
  turunan `tahun` dan `bulan`.

## Tabel autentikasi (dikelola Better Auth)

Tabel `user`, `session`, `account`, dan `verification` dibuat oleh Better Auth
lewat plugin admin, bukan oleh `src/db/schema`. Jangan menambah kolomnya dari
Drizzle; ubah konfigurasi di `src/lib/auth.ts` bila perlu.

| Kolom                                        | Dipakai untuk                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| `user.role`                                  | Peran (`user`, `admin`); nilai bawaan `'user'` di database dan di plugin admin. |
| `user.banned` / `ban_reason` / `ban_expires` | Menonaktifkan akun tanpa menghapus riwayat penyaluran.                          |
| `session.user_id`                            | Menemukan sesi aktif; sudah berindeks (`session_user_id_idx`).                  |
| `session.created_at`                         | Menghitung "terakhir masuk" pada daftar pengguna.                               |

Migrasi `0009_user_role_default.sql` menambahkan default `'user'`, mengisi peran
yang kosong, dan membuat `user_role_idx` agar daftar pengguna per peran cepat.

Peran aplikasi dipetakan di `src/lib/permissions.ts`: `user` tidak punya akses
lintas akun, `admin` mendapat `notes:*` dan `penyaluran:read-penerima`. Akun
tidak bisa memilih perannya saat mendaftar; gunakan
`npm run role:set -- <email> <role>`.
