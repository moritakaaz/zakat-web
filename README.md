# Sistem Pengelolaan Zakat Al-Fawwaz

Aplikasi web untuk mengelola zakat di Yayasan Pendidikan Al-Quran Al-Fawwaz Jakarta Utara. Aplikasi menggantikan pencatatan di buku tulis dengan pencatatan digital dan menentukan prioritas penerima zakat dengan algoritma Rule-Based dan Forward Chaining.

## Teknologi

- Frontend NuxtJS dengan TailwindCSS dan Nuxt UI
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

## Menjalankan MySQL dengan Docker

Bila Docker sudah terpasang, jalankan MySQL dari folder proyek dengan perintah berikut.

```
docker compose up -d mysql
```

Perintah itu membuat database zakat_al_fawwaz beserta skema dan data awal 30 KK secara otomatis pada pertama kali volume dibuat. Setelah MySQL siap, jalankan perintah seed berikut sekali dari folder backend pada database baru.

```
npm run seed
```

Lalu jalankan backend seperti biasa. Backend memakai MySQL bila database terhubung dan memberi tahu lewat health bila database belum terhubung. Bila MySQL belum tersedia, backend tetap jalan dalam mode memori dengan data contoh. Mode memori hanya untuk pengembangan dan pengujian, bukan untuk produksi.

## Cara Menjalankan Frontend

Buka terminal kedua lalu jalankan perintah berikut.

```
cd frontend
npm install
npm run dev
```

Frontend berjalan di port 3000. Buka alamat itu di browser dan masuk dengan salah satu akun demo di bawah.

## Akun Demo

Login memakai kata sandi yang diperiksa dengan bcrypt dan token JWT yang berlaku 8 jam. Token disimpan di browser dan dikirim pada setiap permintaan ke API.

- bendahara dengan email bendahara at alfawwaz.or.id dan kata sandi bendahara123
- sekretaris dengan email sekretaris at alfawwaz.or.id dan kata sandi sekretaris123
- kepala dengan email kepala at alfawwaz.or.id dan kata sandi kepala123

Ganti kata sandi demo dan JWT_SECRET sebelum dipakai di produksi.

## Persetujuan Kepala TPQ

Halaman Hasil Prioritas menampilkan status persetujuan untuk periode berjalan. Status awal adalah menunggu persetujuan. Hanya Kepala TPQ yang dapat menyetujui atau menolak hasil, beserta catatan dan waktu keputusan. Keputusan tersimpan di database pada tabel approvals dan dapat dibuka kembali dari halaman Hasil Prioritas.

## Ikon dan Chart

Tampilan memakai satu set ikon saja yaitu Lucide lewat Nuxt UI. Ikon dipakai di menu samping, kartu dashboard, tombol, dan badge prioritas. Tampilan aplikasi hanya memakai mode terang atas permintaan pengguna dan tidak memakai mode gelap. Dashboard memakai Chart.js langsung dengan dua chart saja yaitu chart donut sebaran prioritas dan chart bar penerimaan lawan penyaluran untuk uang dan beras. Tidak ada chart tren bulanan karena data acuan hanya satu periode yaitu Ramadan 1446 H.

## Aturan yang Dapat Diubah

Halaman Proses Rule memuat 14 aturan dari API, bukan dari daftar hard code di frontend. Bendahara dapat mengubah kondisi, kesimpulan, urutan, ambang, dan status aktif tiap aturan. Ambang yang dapat diubah meliputi batas pendapatan, batas per kapita, tanggungan minimum, honor guru, dan anak sekolah minimum. Setelah aturan diubah, jalankan ulang Forward Chaining untuk melihat hasil baru. Nilai acuan tetap menghasilkan Prioritas 1 sebanyak 15 KK, Prioritas 2 sebanyak 6 KK, Prioritas 3 sebanyak 5 KK, Pending Verifikasi sebanyak 1 KK, dan Tidak Layak sebanyak 3 KK.

## Periode dan Arsip

Pemilih periode ada di menu samping dan berlaku untuk dashboard, data mustahik, hasil prioritas, dan laporan. Bendahara dapat membuat periode baru dan menutup periode dari halaman Laporan. Arsip periode dibaca dari API dan tiap periode baru mendapat status persetujuan menunggu. Data acuan 30 KK, penerimaan, dan penyaluran tercatat pada periode Ramadan 1446 H.

## Peran Pengguna

Bendahara mempunyai akses penuh termasuk menjalankan proses rule, mengubah aturan, membuat dan menutup periode, serta menghapus data. Sekretaris membantu pendataan mustahik dan muzakki serta pencatatan penerimaan, tetapi tidak dapat menjalankan proses rule, menghapus data, atau menyetujui hasil. Kepala TPQ hanya melihat dashboard, hasil prioritas, dan laporan, serta menyetujui atau menolak hasil. Pembatasan ini ditegakkan di backend dan menu serta tombol yang tidak sesuai peran disembunyikan di frontend.

## Pengaman Penyaluran

Penyaluran hanya dapat dicatat oleh Bendahara setelah hasil prioritas periode itu disetujui Kepala TPQ. Sistem menolak penyaluran bila jumlah uang melebihi sisa saldo atau jumlah beras melebihi sisa beras, dan memberi pesan yang jelas untuk tiap penolakan. Form mustahik memakai NIK asli 16 digit, memberi peringatan bila NIK sudah tercatat pada periode yang sama, memberi peringatan bila dokumen KTP atau KK belum lengkap, dan menampilkan pendapatan per kapita yang dihitung otomatis dari pendapatan dibagi jumlah tanggungan.

## Halaman Aplikasi

- Login untuk masuk aplikasi
- Dashboard untuk total muzakki, mustahik, penerimaan, penyaluran, dan sisa saldo
- Data Mustahik untuk tabel 30 KK dengan pencarian dan pagination, serta ubah dan hapus data
- Tambah Mustahik untuk form data calon penerima dengan NIK asli dan peringatan duplikat
- Muzakki dan Penerimaan untuk pencatatan penerimaan dan penyaluran, serta data muzakki yang dapat ditambah, diubah, dan dihapus
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

Jalankan seluruh pengujian backend dari folder backend dengan perintah berikut.

```
npm test
```

Pengujian mencakup mesin rule, autentikasi JWT, login dan perlindungan rute lewat API, persetujuan Kepala TPQ, dan mode memori bila MySQL tidak tersedia. Pengujian upgrade mencakup aturan yang dapat diubah, pembuatan dan penutupan periode, CRUD mustahik dan muzakki beserta batasan peran, duplikat NIK, pengaman penyaluran berupa persetujuan dan sisa saldo, serta dashboard per periode. Pengujian memastikan hasil untuk 30 KK sama persis dengan data acuan dan jejak Ahmad Hidayat menyalakan R01a dan R02.

Pemeriksaan tampilan frontend dijalankan dari folder frontend dengan perintah berikut.

```
node scripts/smoke.mjs
```

Perintah itu memastikan kesembilan file halaman ada. Bila alamat preview sudah disiapkan lewat variabel FRONTEND_URL, perintah yang sama memeriksa kesembilan rute dan memastikan semuanya mengembalikan 200.

## Penyiapan Produksi

Langkah berikut menyiapkan aplikasi untuk dipakai di server.

1. Siapkan server dengan NodeJS versi 20 atau lebih baru dan MySQL versi 8
2. Salin proyek ke server lalu salin file backend env example menjadi file env dan isi kata sandi database dan JWT_SECRET dengan nilai rahasia yang panjang
3. Jalankan MySQL lalu buat database dengan file db schema sql dan isi data awal dengan file db seed sql
4. Dari folder backend jalankan npm install lalu npm start agar API berjalan di port 3001
5. Dari folder frontend jalankan npm install lalu npm run build lalu npm run preview agar aplikasi berjalan di port 3000
6. Pasang reverse proxy agar domain mengarah ke frontend dan API, lalu aktifkan HTTPS
7. Ganti semua kata sandi demo dan JWT_SECRET, lalu uji login untuk ketiga peran

Variabel lingkungan yang dipakai backend adalah PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, dan JWT_EXPIRES_IN. Frontend memakai NUXT_PUBLIC_API_BASE untuk alamat API.
