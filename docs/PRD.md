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
- Data yang disimpan meliputi nama kepala keluarga, NIK 16 digit, alamat, pekerjaan, pendapatan per bulan, jumlah tanggungan, jumlah anak sekolah, kondisi rumah, status khusus, asnaf, dokumen, dan status survei lapangan
- Data mustahik dan hasil prioritas dapat diunduh sebagai CSV untuk lampiran skripsi dan arsip TPQ
- Data pendapatan per kapita dihitung otomatis dari pendapatan dibagi jumlah tanggungan

### 4.3 Data Muzakki

- Tambah, ubah, hapus, dan cari data muzakki
- Data yang disimpan meliputi nama, alamat, jenis zakat, dan jumlah zakat

### 4.4 Pencatatan Penerimaan

- Catat penerimaan zakat fitrah dalam bentuk beras dan uang
- Catat penerimaan zakat mal dan infaq dalam bentuk uang
- Setiap pencatatan menyimpan tanggal, nama muzakki, jenis zakat, jumlah, dan petugas pencatat
- Penerimaan dapat diubah untuk membetulkan salah catat dan setiap perubahan tercatat di riwayat perubahan

### 4.5 Pencatatan Penyaluran

- Catat penyaluran kepada mustahik berdasarkan hasil prioritas
- Setiap penyaluran menyimpan tanggal, nama penerima, prioritas, bentuk penyaluran, dan jumlah
- Sistem menghitung sisa saldo otomatis
- Penyaluran dapat diubah untuk membetulkan salah catat selama saldo masih cukup dan setiap perubahan tercatat di riwayat perubahan

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
- Riwayat perubahan data menampilkan siapa mengubah apa dan kapan

### 4.8 Akun dan Pengguna

- Setiap pengguna dapat mengubah nama tampilan dan kata sandinya sendiri lewat halaman Profil Saya
- Kepala TPQ dapat menambah pengguna baru, mengubah data pengguna, mereset kata sandi, dan menonaktifkan akun
- Pengguna nonaktif tidak dapat masuk sampai diaktifkan kembali oleh Kepala TPQ
- Kepala TPQ tidak dapat mengubah akunnya sendiri lewat halaman Pengguna

## 5 Aturan Rule-Based dan Forward Chaining

Sistem menggunakan aturan IF THEN dengan kode yang sama dengan tabel aturan di database. Forward Chaining berarti sistem mulai dari fakta input lalu memeriksa aturan secara berurutan dari urutan terkecil. Aturan penjaga diperiksa pertama dan menghentikan proses untuk mustahik itu bila terpenuhi.

- R10 Jika dokumen KTP atau KK tidak lengkap maka hasil menjadi Pending Verifikasi dan proses berhenti
- R11 Jika NIK sama dengan data lain pada periode yang sama maka hasil menjadi Duplikat dan proses berhenti
- R09 Jika pendapatan per bulan lebih dari Rp 2.500.000 maka hasil menjadi Tidak Layak dan proses berhenti
- R01a Jika pendapatan per bulan kurang dari Rp 1.500.000 maka hasil dasar menjadi Prioritas 1
- R01b Jika pendapatan per bulan Rp 1.500.000 sampai Rp 2.000.000 maka hasil dasar menjadi Prioritas 2
- R01c Jika pendapatan per bulan Rp 2.000.001 sampai Rp 2.500.000 maka hasil dasar menjadi Prioritas 3
- R02 Jika pendapatan per kapita kurang dari atau sama dengan Rp 300.000 maka hasil Prioritas 2 atau Prioritas 3 naik menjadi Prioritas 1
- R03 Jika jumlah tanggungan 4 jiwa atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000 maka status tanggungan berat ditegaskan dan dicatat, hasil akhir tetap mengikuti aturan pendapatan
- R04 Jika pekerjaan adalah guru honorer TPQ dengan honor Rp 300.000 sampai Rp 600.000 per bulan maka asnaf menjadi Fisabilillah dan hasil menjadi Prioritas 1
- R05 Jika status adalah wali santri dan pendapatan kurang dari Rp 2.500.000 maka mustahik dinyatakan layak dipertimbangkan dan dievaluasi lanjut, hasil akhir tetap mengikuti aturan pendapatan
- R06 Jika status adalah janda atau lansia atau yatim dan pendapatan kurang dari Rp 2.000.000 maka prioritas ditegaskan dan mustahik berhak santunan infaq, hasil akhir tetap mengikuti aturan pendapatan
- R07 Jika kondisi rumah adalah kontrak atau menumpang maka kerentanan dicatat dan dipakai sebagai penentu seri saat ranking
- R08 Jika jumlah anak sekolah 3 orang atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000 maka beban pendidikan tinggi dicatat dan dipakai sebagai penentu seri saat ranking
- R12 Jika total dana tersedia kurang dari kebutuhan semua mustahik layak maka penyaluran diurutkan Prioritas 1 lalu Prioritas 2 lalu Prioritas 3

Urutan ranking memakai prioritas terlebih dahulu, lalu pendapatan per kapita terendah sebagai penentu seri. R03, R05, R06, R07, dan R08 tidak menaikkan prioritas dengan sendirinya. Kelima aturan hanya menegaskan status dan dipakai sebagai penentu seri saat ranking. Bila aturan penegas dibaca sebagai peningkat tanpa syarat, hasil untuk 30 KK berubah menjadi Prioritas 1 sebanyak 22 KK dan Prioritas 3 menjadi 0 KK, sehingga tidak cocok dengan data acuan pada bagian 6. Hasil yang teruji adalah Prioritas 1 sebanyak 15 KK, Prioritas 2 sebanyak 6 KK, Prioritas 3 sebanyak 5 KK, Pending Verifikasi sebanyak 1 KK, dan Tidak Layak sebanyak 3 KK.

Aturan disimpan sebagai data di tabel aturan, bukan hard code di dalam kode program. Perubahan aturan dapat dilakukan tanpa mengubah kode utama. Jejak Forward Chaining menampilkan seluruh 14 aturan untuk setiap mustahik beserta catatan yang menyatakan fakta sebenarnya dari data mustahik itu.

Validasi input yang dipakai mesin adalah NIK wajib 16 digit angka dan dinormalisasi sebelum cek duplikat, status khusus dan pekerjaan memakai pilihan tetap dan mesin mencocokkan satu kata utuh bukan sebagian teks. Cek duplikat hanya memakai NIK karena tidak ada field nomor KK di database atau di form. Setiap mustahik juga mempunyai status survei lapangan. Kepala TPQ tidak dapat menyetujui hasil periode bila masih ada mustahik Prioritas 1 sampai Prioritas 3 yang belum disurvei lapangan.

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
- surveyed
- period_id

### 7.3 muzakki

- id
- full_name
- address
- zakat_type
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
- zakat_type
- group_name
- amount_rice_kg
- amount_money
- distribution_date
- recorded_by

Penyaluran dapat ditujukan kepada satu mustahik atau kepada satu kelompok penerima. Pada penyaluran kelompok, mustahik_id kosong dan nama kelompok disimpan pada group_name.

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

### 7.8 audit_log

- id
- actor_name
- actor_role
- action
- target
- detail
- created_at

## 8 Alur Proses

1. Bendahara menginput data mustahik dan muzakki untuk periode berjalan
2. Bendahara mencatat penerimaan zakat dari muzakki
3. Bendahara menjalankan proses Rule-Based untuk semua mustahik pada periode tersebut
4. Sistem menampilkan hasil prioritas beserta alasan aturan
5. Pengurus melakukan survei lapangan ke rumah mustahik dan menandai status survei pada data mustahik
6. Kepala TPQ memeriksa dan menyetujui hasil prioritas. Persetujuan ditolak sistem bila masih ada mustahik Prioritas 1 sampai Prioritas 3 yang belum disurvei
7. Bendahara mencatat penyaluran sesuai urutan prioritas dan ketersediaan dana
8. Sistem memperbarui sisa saldo secara otomatis
9. Pengurus mencetak laporan dan menyimpan arsip periode

## 9 Teknologi

- Frontend NuxtJS dengan TailwindCSS
- UI Library Nuxt UI sebagai library komponen untuk tampilan aplikasi
- Migrasi dari PrimeVue ke Nuxt UI dilakukan atas permintaan pengguna setelah melihat aplikasi berjalan
- Tampilan aplikasi hanya memakai mode terang atas permintaan pengguna dan tidak memakai mode gelap
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
