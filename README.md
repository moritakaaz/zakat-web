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

Backend berjalan di port 3001. Buka alamat health di browser untuk memastikan backend hidup. Bila MySQL belum dipasang, backend tetap jalan tetapi tidak menampilkan data apa pun dan memberi tahu lewat health bahwa database belum terhubung.

Untuk membuat database MySQL secara manual, jalankan perintah seed berikut dari folder backend. Perintah itu menjalankan file db schema sql lalu file db seed sql. Jangan jalankan kedua file itu di MySQL lalu menjalankan npm run seed karena data seed akan dimasukkan dua kali dan gagal duplikat.

```
npm run seed
```

## Menjalankan MySQL dengan Docker

Bila Docker sudah terpasang, jalankan MySQL dari folder proyek dengan perintah berikut.

```
docker compose up -d mysql
```

Perintah itu membuat database zakat_al_fawwaz beserta skema dan data awal 30 KK secara otomatis pada pertama kali volume dibuat. Jangan jalankan npm run seed lagi setelah docker compose up karena data seed sudah masuk dan perintah itu akan gagal duplikat. Perintah npm run seed hanya dipakai bila MySQL dipasang manual tanpa Docker.

Lalu jalankan backend seperti biasa. Backend memakai MySQL bila database terhubung dan memberi tahu lewat health bila database belum terhubung. Bila MySQL belum tersedia, backend tetap jalan dalam mode memori tetapi toko data kosong. Mode memori hanya berarti database belum terhubung, bukan untuk produksi.

## Keadaan Data MySQL

Bagian ini menjelaskan isi database pada tiap keadaan agar tidak ada data yang muncul tanpa jelas asalnya.

- Hanya schema sql berarti database kosong. Aplikasi menampilkan 0 mustahik, 0 muzakki, 0 penerimaan, dan 0 penyaluran, serta tidak ada pengguna dan tidak ada aturan. Login belum bisa sebelum data seed dimasukkan.
- Seed sql atau npm run seed berarti data acuan Excel masuk. Isinya 30 KK dengan Prioritas 1 sebanyak 15 KK, Prioritas 2 sebanyak 6 KK, Prioritas 3 sebanyak 5 KK, Pending Verifikasi sebanyak 1 KK, dan Tidak Layak sebanyak 3 KK, ditambah 6 muzakki, 10 baris penerimaan, 8 baris penyaluran, 14 aturan, 2 periode, dan 3 akun demo.
- Data seed berisi 10 baris penerimaan dengan beras 130 kg dan uang Rp 7.450.000 serta 8 baris penyaluran dengan beras 130 kg dan uang Rp 6.800.000. Sisa saldo uang acuan adalah Rp 650.000 dan sisa beras acuan adalah 0 kg.
- Perubahan skema pada versi baru tidak diterapkan oleh schema sql pada database lama karena schema sql memakai IF NOT EXISTS. Setelah menarik versi dengan perubahan skema, hapus dulu databasenya lalu jalankan npm run seed agar tabel baru terbentuk dan data seed masuk.
- Docker compose up pada volume baru membuat skema dan data seed otomatis. Menjalankan schema sql lagi pada database yang sudah berisi data tidak menghapus data karena schema sql memakai IF NOT EXISTS dan tidak berisi INSERT atau DELETE.
- Untuk mulai dari kosong pada database yang sudah terisi seed, hapus dulu databasenya lalu jalankan schema sql saja. Pada MySQL manual, jalankan DROP DATABASE zakat_al_fawwaz lalu jalankan schema sql. Pada Docker, jalankan docker compose down -v untuk menghapus volume. Volume baru yang dibuat oleh up berikutnya selalu menjalankan seed otomatis, jadi untuk database kosong, hapus database hasil seed dengan DROP DATABASE lalu jalankan schema sql saja.

## Tidak Ada Data Hard Code

- Tidak ada lagi data contoh di dalam kode aplikasi. File data backend sudah dihapus dan toko data backend mulai kosong.
- MySQL yang diisi dari seed sql adalah satu-satunya sumber data. Aplikasi menampilkan 0 bila MySQL belum terhubung atau tabel masih kosong.
- Login hanya bisa dilakukan setelah data seed dimasukkan karena akun pengguna juga hanya ada di database.
- Data acuan tetap dijelaskan di PRD dan di bagian Data Acuan README ini, tetapi penjelasan itu bukan data yang dipakai aplikasi.

## Data Frontend dari API

Frontend membaca semua data dari API backend dan tidak lagi memakai file data contoh di dalam folder frontend. Dashboard memakai angka dari API dashboard, daftar mustahik memakai API mustahik, penerimaan dan penyaluran memakai API receipts dan distributions, periode memakai API periods, dan aturan memakai API rules. Bila API mengembalikan data kosong, aplikasi menampilkan 0 dan bukan data contoh. Bila backend tidak berjalan, aplikasi menampilkan pesan galat dan tabel kosong. File data mustahik dan finance di folder frontend sudah dihapus.

## Penyaluran per Kelompok

- Delapan baris penyaluran pada data acuan dicatat per kelompok penerima, bukan per kepala keluarga, sesuai lembar Excel acuan. Kolom mustahik_id boleh kosong pada baris kelompok dan nama kelompok disimpan pada kolom group_name beserta jenis zakat pada kolom zakat_type.
- Baris infaq untuk anak yatim dan operasional amil tercatat sebagai baris kelompok tanpa mustahik, bukan atas nama satu mustahik.
- Halaman Muzakki dan Penerimaan menyediakan tombol Catat Penyaluran untuk Bendahara. Penyaluran baru dapat ditujukan kepada satu mustahik atau kepada satu kelompok penerima. Mustahik yang dipilih harus berstatus Prioritas 1, Prioritas 2, atau Prioritas 3 menurut hasil proses Rule-Based.
- API menolak penyaluran bila hasil prioritas periode belum disetujui Kepala TPQ atau bila jumlahnya melebihi sisa saldo uang dan sisa beras periode tersebut.

## Total Penerimaan per Muzakki

- Kolom jumlah pada form Tambah Muzakki sudah dihapus karena jumlah itu hanya data profil dan tidak pernah masuk ke uang masuk. Uang dan beras hanya tercatat lewat Catat Penerimaan.
- Kolom Jumlah pada tabel muzakki menampilkan total penerimaan yang tercatat untuk muzakki tersebut pada periode berjalan. Total dihitung dari tabel penerimaan dan diperbarui setiap ada penerimaan baru.
- Enam dari sepuluh baris penerimaan seed sudah terhubung ke muzakkinya berdasarkan jenis zakat dan jumlah yang sama persis. Empat baris sisanya tetap tanpa muzakki, yaitu uang fitrah Rp 600.000 dan beras fitrah 130 kg, karena pemberinya tidak tercatat pada tabel muzakki.

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

## Glosarium

Halaman Glosarium dapat dibuka semua peran dari menu samping. Isinya daftar istilah seperti mustahik, muzakki, asnaf, dan Forward Chaining, arti tiap status hasil, tugas tiap peran, dan seluruh 14 aturan rule. Aturan dibaca langsung dari API, bukan dari daftar hard code di frontend, sehingga kalau Bendahara mengubah ambang atau menonaktifkan aturan di halaman Proses Rule, halaman Glosarium ikut berubah. Halaman ini mempunyai kotak pencarian untuk mencari istilah atau aturan berdasarkan kode, kondisi, atau kesimpulan.

## Periode dan Arsip

Pemilih periode ada di menu samping dan berlaku untuk dashboard, data mustahik, hasil prioritas, dan laporan. Bendahara dapat membuat periode baru dan menutup periode dari halaman Laporan. Arsip periode dibaca dari API dan tiap periode baru mendapat status persetujuan menunggu. Data acuan 30 KK, penerimaan, dan penyaluran tercatat pada periode Ramadan 1446 H.

## Peran Pengguna

Bendahara mempunyai akses penuh termasuk menjalankan proses rule, mengubah aturan, membuat dan menutup periode, serta menghapus data. Sekretaris membantu pendataan mustahik dan muzakki serta pencatatan penerimaan, tetapi tidak dapat menjalankan proses rule, menghapus data, atau menyetujui hasil. Kepala TPQ hanya melihat dashboard, hasil prioritas, dan laporan, serta menyetujui atau menolak hasil. Pembatasan ini ditegakkan di backend dan menu serta tombol yang tidak sesuai peran disembunyikan di frontend.

## Pengaman Penyaluran

Penyaluran hanya dapat dicatat oleh Bendahara setelah hasil prioritas periode itu disetujui Kepala TPQ. Sistem menolak penyaluran bila jumlah uang melebihi sisa saldo atau jumlah beras melebihi sisa beras, dan memberi pesan yang jelas untuk tiap penolakan. Form mustahik memakai NIK asli 16 digit, memberi peringatan bila NIK sudah tercatat pada periode yang sama, memberi peringatan bila dokumen KTP atau KK belum lengkap, dan menampilkan pendapatan per kapita yang dihitung otomatis dari pendapatan dibagi jumlah tanggungan.

## Halaman Aplikasi

- Login untuk masuk aplikasi
- Dashboard untuk total muzakki, mustahik, penerimaan, penyaluran, dan sisa saldo
- Data Mustahik untuk tabel mustahik dengan pencarian dan pagination, serta ubah dan hapus data. Judul kolom dapat diklik untuk mengurutkan tabel, klik kedua membalik urutan, dan klik ketiga mengembalikan urutan awal. Klik baris membuka Jejak Forward Chaining dengan badge Terpenuhi hijau dan Tidak terpenuhi merah serta filter Semua, Terpenuhi, dan Tidak terpenuhi
- Tambah Mustahik untuk form data calon penerima dengan NIK asli dan peringatan duplikat
- Muzakki dan Penerimaan untuk pencatatan penerimaan dan penyaluran, serta data muzakki yang dapat ditambah, diubah, dan dihapus. Tabel muzakki, penerimaan, dan penyaluran dapat diurutkan dengan klik judul kolom
- Proses Rule untuk 14 aturan dan jejak Forward Chaining
- Hasil Prioritas untuk ranking penerima. Tabel ranking dapat diurutkan dengan klik judul kolom, dan ada tombol untuk kembali ke urutan ranking
- Laporan untuk rekap akhir dan arsip periode
- Glosarium untuk istilah, 14 aturan dari API, arti status hasil, dan tugas tiap peran
- Menu di layar kecil tampil sebagai drawer dari kiri dengan tombol tutup di kiri atas, sejajar dengan tombol hamburger yang membukanya

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

Pengujian mencakup mesin rule, autentikasi JWT, login dan perlindungan rute lewat API, persetujuan Kepala TPQ, dan toko data kosong bila MySQL tidak tersedia. Pengujian upgrade mencakup aturan yang dapat diubah, pembuatan dan penutupan periode, CRUD mustahik dan muzakki beserta batasan peran, duplikat NIK, pengaman penyaluran berupa persetujuan dan sisa saldo, serta dashboard per periode. Pengujian memakai data contoh kecil yang ditulis di dalam file pengujian dan tidak memakai data hard code dari kode aplikasi.

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
