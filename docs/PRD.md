# PRD Sistem Pengelolaan Zakat Berbasis Web

## Informasi Proyek

- Nama proyek Sistem Pengelolaan Zakat Yayasan Al-Fawwaz
- Judul skripsi Implementasi Sistem Pengelolaan Zakat Berbasis Web Menggunakan Algoritma Rule-Based Pada Yayasan Pendidikan Al-Quran Al-Fawwaz Jakarta Utara
- Lokasi Yayasan Pendidikan Al-Quran Al-Fawwaz, Jl Warakas IV Gg 5 No 70, RT 8 RW 6, Warakas, Tanjung Priok, Jakarta Utara 14370
- Metode Rule-Based dengan Forward Chaining
- Pengguna utama Bendahara, Sekretaris, dan Kepala TPQ

## 1 Tujuan

Sistem ini dibuat untuk membantu pengurus Yayasan Pendidikan Al-Quran Al-Fawwaz dalam mengelola zakat secara tertib dan transparan. Sistem menggantikan pencatatan di buku tulis dengan pencatatan digital. Sistem membantu pengurus menentukan penerima zakat berdasarkan aturan yang jelas dan dapat dilacak. Sistem menyimpan arsip tahunan sehingga data tahun lalu mudah dicari.

## 2 Ruang Lingkup

Sistem mencakup pendataan mustahik dan muzakki. Sistem mencakup pencatatan penerimaan zakat fitrah, zakat mal, dan infaq. Sistem mencakup pencatatan penyaluran zakat dalam bentuk beras dan uang. Sistem mencakup proses penentuan prioritas penerima dengan algoritma Rule-Based. Sistem mencakup laporan dan arsip. Sistem tidak mencakup pembayaran online. Sistem tidak mencakup pengelolaan santri dan kegiatan belajar TPQ.

## 3 Pengguna dan Peran

### 3.1 Bendahara

- Mengelola data mustahik dan muzakki
- Mencatat penerimaan dan penyaluran zakat
- Menjalankan proses penentuan prioritas
- Melihat dan mencetak laporan

### 3.2 Kepala TPQ

- Melihat dashboard dan laporan
- Menyetujui hasil prioritas
- Melihat arsip tahunan

### 3.3 Sekretaris

- Membantu pendataan mustahik dan muzakki
- Membantu pencatatan penerimaan

## 4 Fitur Utama

### 4.1 Login dan Dashboard

- Login dengan email dan kata sandi
- Dashboard menampilkan total muzakki, total mustahik, total penerimaan, total penyaluran, dan sisa saldo
- Dashboard menampilkan jumlah penerima berdasarkan prioritas

### 4.2 Data Mustahik

- Tambah, ubah, hapus, dan cari data mustahik
- Data yang disimpan meliputi nama kepala keluarga, alamat, pekerjaan, pendapatan per bulan, jumlah tanggungan, jumlah anak sekolah, kondisi rumah, status khusus, asnaf, dan dokumen
- Data pendapatan per kapita dihitung otomatis dari pendapatan dibagi jumlah tanggungan

### 4.3 Data Muzakki

- Tambah, ubah, hapus, dan cari data muzakki
- Data yang disimpan meliputi nama, alamat, jenis zakat, dan jumlah zakat

### 4.4 Pencatatan Penerimaan

- Catat penerimaan zakat fitrah dalam bentuk beras dan uang
- Catat penerimaan zakat mal dan infaq dalam bentuk uang
- Setiap pencatatan menyimpan tanggal, nama muzakki, jenis zakat, jumlah, dan petugas pencatat

### 4.5 Pencatatan Penyaluran

- Catat penyaluran kepada mustahik berdasarkan hasil prioritas
- Setiap penyaluran menyimpan tanggal, nama penerima, prioritas, bentuk penyaluran, dan jumlah
- Sistem menghitung sisa saldo otomatis

### 4.6 Proses Rule-Based

- Pengurus memilih periode lalu menjalankan proses penentuan prioritas
- Sistem memeriksa setiap mustahik dengan aturan secara berurutan
- Sistem menampilkan hasil prioritas dan alasan aturan yang terpenuhi
- Hasil dapat disetujui oleh Kepala TPQ sebelum penyaluran

### 4.7 Laporan dan Arsip

- Laporan penerimaan dan penyaluran per periode
- Laporan daftar penerima berdasarkan prioritas
- Laporan dapat dicetak
- Arsip periode lalu dapat dibuka dan dicari

## 5 Aturan Rule-Based dan Forward Chaining

Sistem menggunakan aturan IF THEN. Forward Chaining berarti sistem mulai dari fakta input lalu memeriksa aturan secara berurutan dari R01 sampai R14 sampai mendapat kesimpulan.

- R01 Jika dokumen KTP atau KK tidak lengkap maka status menjadi Pending Verifikasi dan proses berhenti
- R02 Jika nama sudah tercatat sebagai penerima pada periode yang sama maka status menjadi Duplikat dan proses berhenti
- R03 Jika pendapatan per bulan kurang dari Rp 1.500.000 dan jumlah tanggungan 4 atau lebih maka hasil menjadi Prioritas 1
- R04 Jika pendapatan per bulan kurang dari Rp 1.500.000 dan jumlah tanggungan 2 sampai 3 maka hasil menjadi Prioritas 1
- R05 Jika pendapatan per bulan 1.500.000 sampai 2.500.000 dan jumlah tanggungan 4 atau lebih maka status tanggungan berat ditegaskan dan dipakai sebagai penentu seri saat ranking, hasil akhir tetap mengikuti aturan pendapatan
- R06 Jika pendapatan per bulan 1.500.000 sampai 2.500.000 dan jumlah tanggungan 2 sampai 3 maka hasil menjadi Prioritas 2
- R07 Jika pendapatan per bulan 1.500.000 sampai 2.500.000 dan jumlah tanggungan 0 sampai 1 maka hasil menjadi Prioritas 3
- R08 Jika pendapatan per bulan lebih dari Rp 2.500.000 dan jumlah tanggungan 4 atau lebih dan kondisi rumah tidak layak maka hasil menjadi Prioritas 2
- R09 Jika pendapatan per bulan lebih dari Rp 2.500.000 dan jumlah tanggungan kurang dari 4 maka hasil menjadi Tidak Layak
- R10 Jika status adalah guru honorer TPQ dengan honor kurang dari Rp 600.000 maka hasil menjadi Prioritas 1
- R11 Jika status adalah janda atau dhuafa atau anak yatim dan pendapatan kurang dari Rp 2.500.000 maka status rentan ditegaskan dan dipakai sebagai penentu seri saat ranking, hasil akhir tetap mengikuti aturan pendapatan
- R12 Jika kondisi adalah sakit kronis atau disabilitas dan tidak punya penghasilan tetap maka hasil menjadi Prioritas 1
- R13 Jika dana tidak cukup untuk semua Prioritas 1 maka urutkan berdasarkan pendapatan per kapita terendah lalu jumlah tanggungan terbanyak
- R14 Jika dana masih tersisa setelah Prioritas 1 terpenuhi maka lanjutkan ke Prioritas 2 lalu Prioritas 3

Aturan disimpan sebagai data di tabel aturan, bukan hard code di dalam kode program. Perubahan aturan dapat dilakukan tanpa mengubah kode utama.

R05 dan R11 tidak menaikkan prioritas dengan sendirinya. Kedua aturan hanya menegaskan status dan dipakai sebagai penentu seri saat ranking. Bila kedua aturan dibaca sebagai peningkat tanpa syarat, hasil untuk 30 KK berubah menjadi Prioritas 1 sebanyak 22 KK dan Prioritas 3 menjadi 0 KK, sehingga tidak cocok dengan data acuan pada bagian 6. Hasil yang teruji adalah Prioritas 1 sebanyak 15 KK, Prioritas 2 sebanyak 6 KK, Prioritas 3 sebanyak 5 KK, Pending Verifikasi sebanyak 1 KK, dan Tidak Layak sebanyak 3 KK.

## 6 Data Acuan

Data acuan berasal dari wawancara dengan pengurus dan pencatatan buku bendahara untuk periode Ramadan 1446 H.

- Jumlah mustahik sebanyak 30 KK
- Prioritas 1 sebanyak 15 KK
- Prioritas 2 sebanyak 6 KK
- Prioritas 3 sebanyak 5 KK
- Pending Verifikasi sebanyak 1 KK
- Tidak Layak sebanyak 3 KK
- Penerima layak sebanyak 26 KK
- Beras masuk sebanyak 130 kg dan tersalur sebanyak 130 kg
- Uang masuk sebanyak Rp 7.450.000 dan tersalur sebanyak Rp 6.800.000
- Sisa saldo sebanyak Rp 650.000
- Guru honorer TPQ sebanyak 4 orang dengan honor Rp 450.000 sampai Rp 600.000 dan semuanya masuk Prioritas 1

## 7 Database

### 7.1 users

- id
- name
- email
- password
- role

### 7.2 mustahik

- id
- full_name
- address
- occupation
- monthly_income
- dependents
- school_children
- house_condition
- special_status
- asnaf
- document_status
- period_id

### 7.3 muzakki

- id
- full_name
- address
- zakat_type
- amount
- period_id

### 7.4 zakat_receipts

- id
- muzakki_id
- zakat_type
- amount_rice_kg
- amount_money
- received_date
- recorded_by

### 7.5 zakat_distributions

- id
- mustahik_id
- priority
- distribution_type
- amount_rice_kg
- amount_money
- distribution_date
- recorded_by

### 7.6 rules

- id
- rule_code
- condition_text
- result_text
- execution_order
- is_active

### 7.7 periods

- id
- period_name
- start_date
- end_date
- status

## 8 Alur Proses

1. Bendahara menginput data mustahik dan muzakki untuk periode berjalan
2. Bendahara mencatat penerimaan zakat dari muzakki
3. Bendahara menjalankan proses Rule-Based untuk semua mustahik pada periode tersebut
4. Sistem menampilkan hasil prioritas beserta alasan aturan
5. Kepala TPQ memeriksa dan menyetujui hasil prioritas
6. Bendahara mencatat penyaluran sesuai urutan prioritas dan ketersediaan dana
7. Sistem memperbarui sisa saldo secara otomatis
8. Pengurus mencetak laporan dan menyimpan arsip periode

## 9 Teknologi

- Frontend NuxtJS dengan TailwindCSS
- UI Library PrimeVue sebagai library komponen paling lengkap
- Backend NodeJS dengan Express atau Hono
- Database MySQL
- Bahasa pemrograman JavaScript dan TypeScript
- Pengembangan lokal menggunakan NodeJS dan npm
- Semua nama variabel, fungsi, kelas, tabel, dan kolom ditulis dalam bahasa Inggris
- Semua dokumentasi ditulis dalam bahasa Indonesia

## 10 Kriteria Penerimaan

- Semua fitur utama pada bagian 4 dapat digunakan tanpa error
- Hasil proses Rule-Based untuk 30 KK sesuai dengan data acuan pada bagian 6
- Laporan penerimaan dan penyaluran dapat dicetak dengan benar
- Data dapat dicari berdasarkan nama dan periode
- Arsip periode lalu dapat dibuka kembali
- Login hanya dapat dilakukan oleh pengguna terdaftar dengan peran yang sesuai

## 11 Pengujian

- Pengujian black box untuk setiap fitur
- Pengujian akurasi rule dengan membandingkan hasil sistem dan hasil manual pengurus
- Pengujian dengan data 30 KK dari data acuan
- Pengujian pencatatan penerimaan dan penyaluran sampai saldo akhir sesuai

## 12 Tahapan Pengerjaan

1. Finalisasi PRD ini
2. Perancangan database dan antarmuka
3. Pembuatan fitur login dan dashboard
4. Pembuatan fitur data mustahik dan muzakki
5. Pembuatan fitur pencatatan penerimaan dan penyaluran
6. Pembuatan mesin Rule-Based dengan Forward Chaining
7. Pembuatan laporan dan arsip
8. Pengujian dan perbaikan
