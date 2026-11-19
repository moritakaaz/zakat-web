# Sistem Pengelolaan Zakat Al-Fawwaz

Aplikasi web untuk mengelola zakat di Yayasan Pendidikan Al-Quran Al-Fawwaz Jakarta Utara. Aplikasi menggantikan pencatatan di buku tulis dengan pencatatan digital dan menentukan prioritas penerima zakat dengan algoritma Rule-Based dan Forward Chaining.

## Teknologi

- Frontend NuxtJS dengan TailwindCSS dan PrimeVue
- Backend NodeJS dengan Express
- Database MySQL
- Bahasa pemrograman JavaScript dan TypeScript

## Struktur Proyek

- folder frontend berisi aplikasi NuxtJS
- folder backend berisi API Express dan mesin rule
- folder docs berisi PRD dan catatan desain
- file CLAUDE dan AGENTS berisi aturan penulisan kode

## Cara Menjalankan Backend

Buka terminal pertama lalu jalankan perintah berikut.

```
cd backend
npm install
cp .env.example .env
npm start
```

Backend berjalan di port 3001. Buka alamat health di browser untuk memastikan backend hidup. Bila MySQL belum dipasang, backend tetap jalan dengan data contoh dan memberi tahu bahwa database belum terhubung.

Untuk membuat database MySQL, jalankan file db schema sql lalu file db seed sql di MySQL. Setelah itu jalankan perintah seed berikut.

```
npm run seed
```

## Cara Menjalankan Frontend

Buka terminal kedua lalu jalankan perintah berikut.

```
cd frontend
npm install
npm run dev
```

Frontend berjalan di port 3000. Buka alamat itu di browser dan masuk dengan salah satu akun demo di bawah.

## Akun Demo

- bendahara dengan email bendahara at alfawwaz.or.id dan peran bendahara
- sekretaris dengan email sekretaris at alfawwaz.or.id dan peran sekretaris
- kepala dengan email kepala at alfawwaz.or.id dan peran kepala

Kata sandi demo apa saja dapat dipakai pada versi awal ini.

## Halaman Aplikasi

- Login untuk masuk aplikasi
- Dashboard untuk total muzakki, mustahik, penerimaan, penyaluran, dan sisa saldo
- Data Mustahik untuk tabel 30 KK dengan pencarian dan pagination
- Tambah Mustahik untuk form data calon penerima
- Muzakki dan Penerimaan untuk pencatatan penerimaan dan penyaluran
- Proses Rule untuk 14 aturan dan jejak Forward Chaining
- Hasil Prioritas untuk ranking penerima
- Laporan untuk rekap akhir dan arsip periode

## Data Acuan

Data acuan berasal dari periode Ramadan 1446 H.

- Mustahik sebanyak 30 KK
- Prioritas 1 sebanyak 15 KK
- Prioritas 2 sebanyak 6 KK
- Prioritas 3 sebanyak 5 KK
- Pending Verifikasi sebanyak 1 KK
- Tidak Layak sebanyak 3 KK
- Beras masuk 130 kg dan tersalur 130 kg
- Uang masuk Rp 7.450.000 dan tersalur Rp 6.800.000
- Sisa saldo Rp 650.000

## Catatan Aturan

Mesin rule memakai 14 aturan dari file data acuan. Aturan diperiksa berurutan dari penjaga dokumen dan duplikat, lalu ambang pendapatan, lalu per kapita dan tanggungan, lalu status khusus, lalu penentu seri, dan terakhir aturan penyaluran bila dana terbatas. Aturan R05 dan R11 pada PRD bagian 5 diterapkan sebagai penegasan dan penentu seri, bukan sebagai peningkat prioritas tanpa syarat. Tanpa penafsiran ini, hasil untuk 30 KK berubah menjadi Prioritas 1 sebanyak 22 KK dan Prioritas 3 menjadi 0 KK, sehingga tidak cocok dengan data acuan pada PRD bagian 6. Aturan disimpan sebagai data di tabel aturan agar ambang dapat diubah tanpa mengubah kode utama.

## Pengujian

Jalankan pengujian mesin rule dari folder backend dengan perintah berikut.

```
npm test
```

Pengujian memastikan hasil untuk 30 KK sama persis dengan data acuan dan jejak Ahmad Hidayat menyalakan R01a dan R02.
