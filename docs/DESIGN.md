# Catatan Desain Sistem Zakat Al-Fawwaz

Catatan ini merekam pilihan desain untuk seluruh layar aplikasi agar tampilan tetap konsisten dan tidak terlihat seperti hasil AI generik.

## Kategori dan Gaya

Kategori produk adalah alat admin untuk yayasan keagamaan. Gaya yang dipakai adalah minimalisme yang tenang dan padat. Tidak dipakai efek kaca, tidak dipakai efek neumorphism, dan tidak dipakai gradien ungu.

## Palet Warna

- Latar utama warna netral hangat dengan kode F7F5F0
- Permukaan utama warna putih
- Teks utama warna biru gelap dengan kode 1E293B
- Teks sekunder warna abu dengan kode 64748B
- Garis pemisah warna abu terang dengan kode E2E8F0
- Warna utama hijau tua dengan kode 166534 untuk aksi dan prioritas
- Warna aksen kuning tua dengan kode B45309 dipakai hemat untuk uang dan peringatan

Perbandingan pemakaian warna adalah 60 persen netral, 30 persen nada sekunder, dan 10 persen aksen. Warna dipakai untuk menyampaikan status dan aksi, bukan untuk hiasan.

## Tipografi

Font yang dipakai adalah Inter dengan cadangan system-ui. Judul dan isi memakai font yang sama dengan ketebalan berbeda. Skala ukuran memakai rasio 1.25. Semua angka uang dan jumlah memakai angka tabular agar kolom tidak bergeser.

## Elemen Khas

Elemen khas aplikasi ini adalah buku prioritas dan neraca penyaluran. Dashboard selalu menampilkan jumlah penerima per prioritas di samping sisa saldo beras dan uang. Elemen ini membedakan aplikasi zakat dari dashboard admin generik.

## Kepadatan dan Hierarki

Tabel memakai kepadatan tinggi dengan padding kecil. Laporan memakai ruang yang lebih longgar. Setiap layar punya satu titik fokus yang dibuat menonjol lewat ukuran, ketebalan, dan ruang di sekitarnya.

## Komponen

Komponen PrimeVue dipakai terlebih dahulu. DataTable dipakai untuk tabel mustahik dan laporan. Dialog dipakai untuk jejak rule. Tag dipakai untuk label prioritas. Tombol dan input memakai komponen PrimeVue dengan utilitas Tailwind untuk tata letak.

## Status Layar

Setiap layar menyediakan status muat, kosong, error, dan sukses. Tabel kosong menampilkan pesan yang jelas. Nama panjang dipotong rapi. Semua elemen interaktif dapat dijangkau keyboard dan punya urutan fokus yang benar.

## Gerakan

Durasi gerakan memakai token 40 milidetik sampai 500 milidetik dengan easing ease-out yang halus. Gerakan dipakai untuk membuka dialog dan perubahan kecil, bukan untuk hiasan.
