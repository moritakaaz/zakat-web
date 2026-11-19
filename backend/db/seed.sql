-- Seed data for the zakat database.
-- Generated from the Excel reference file with 30 mustahik households.
-- Demo passwords are bendahara123, sekretaris123 and kepala123.
USE zakat_al_fawwaz;

INSERT INTO users (id, name, email, password, role) VALUES
('U01', 'Bendahara TPQ', 'bendahara@alfawwaz.or.id', '$2a$10$tYpj8l0Kv.OL1qfrWUDBHe/qGrhDPOWMWyTSnr65nXKoh3LdAXa.a', 'bendahara'),
('U02', 'Sekretaris TPQ', 'sekretaris@alfawwaz.or.id', '$2a$10$9W3szvNAu8Lkmi2fv35g6.o1k21Rmy4nO9jizWog/ZyB6GbFWZh3C', 'sekretaris'),
('U03', 'Kepala TPQ', 'kepala@alfawwaz.or.id', '$2a$10$UIDTvlMt.vfIu2abPmgjJuCgfmPmKT8VQD.m3SiqHEiW/Y8LM87x6', 'kepala');

INSERT INTO periods (id, period_name, start_date, end_date, status) VALUES
(1, 'Ramadan 1446 H', '2025-03-01', '2025-03-29', 'closed'),
(2, 'Ramadan 1447 H', '2026-02-18', '2026-03-19', 'active');

INSERT INTO mustahik (id, full_name, nik, address, occupation, monthly_income, dependents, school_children, house_condition, special_status, asnaf, document_status, period_id) VALUES
('KK01', 'Siti Maryam', '3172••••••0001', 'Jl. Warakas IV Gg.5 No.12, RT.8/RW.6', 'Tidak Bekerja', 0, 5, 3, 'Menumpang', 'Janda', 'Fakir', 'Lengkap', 1),
('KK02', 'H. Abdullah Syafiq (Lansia)', '3172••••••0007', 'Jl. Warakas IV Gg.2 No.4, RT.7/RW.6', 'Tidak Bekerja', 0, 2, 0, 'Milik Sendiri', 'Lansia', 'Fakir', 'Lengkap', 1),
('KK03', 'Ustzh. Fatimah Zahra', '3172••••••0004', 'Jl. Warakas IV Gg.5 No.18, RT.8/RW.6', 'Guru Honorer TPQ', 450000, 3, 2, 'Kontrak', 'Guru Honorer TPQ', 'Fisabilillah', 'Lengkap', 1),
('KK04', 'Fitri Rahmawati', '3172••••••0022', 'Jl. Warakas I Gg.5 No.3, RT.3/RW.6', 'Guru Honorer TPQ', 500000, 3, 2, 'Kontrak', 'Guru Honorer TPQ, Wali Santri', 'Fisabilillah', 'Lengkap', 1),
('KK05', 'Aisyah Putri', '3172••••••0016', 'Jl. Warakas IV Gg.3 No.15, RT.7/RW.6', 'Guru Honorer TPQ', 550000, 2, 1, 'Menumpang', 'Guru Honorer TPQ', 'Fisabilillah', 'Lengkap', 1),
('KK06', 'Nurhayati', '3172••••••0003', 'Jl. Warakas IV Gg.3 No.8, RT.7/RW.6', 'Tukang Cuci', 600000, 4, 2, 'Kontrak', 'Janda, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK07', 'Dewi Lestari', '3172••••••0010', 'Jl. Warakas III No.14, RT.6/RW.6', 'Guru Honorer TPQ', 600000, 4, 2, 'Milik Sendiri', 'Guru Honorer TPQ, Wali Santri', 'Fisabilillah', 'Lengkap', 1),
('KK08', 'Ahmad Hidayat', '3172••••••0002', 'Jl. Warakas IV Gg.5 No.70, RT.8/RW.6', 'Buruh Harian', 750000, 6, 4, 'Kontrak', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK09', 'Mimin Mintarsih', '3172••••••0006', 'Jl. Warakas IV Gg.5 No.25, RT.8/RW.6', 'Penjual Gorengan', 900000, 5, 3, 'Menumpang', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK10', 'Rina Marlina', '3172••••••0008', 'Jl. Warakas I Gg.7 No.19, RT.3/RW.6', 'Asisten Rumah Tangga', 1000000, 4, 3, 'Kontrak', 'Janda, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK11', 'Slamet Riyadi', '3172••••••0005', 'Jl. Warakas II No.31, RT.5/RW.6', 'Kuli Bangunan', 1100000, 6, 4, 'Kontrak', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK12', 'Keluarga Yatim — Ibu Ratna Sari', '3172••••••0012', 'Jl. Warakas IV Gg.5 No.41, RT.9/RW.6', 'Pedagang Kecil', 1200000, 4, 3, 'Kontrak', 'Janda, Yatim, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK13', 'Bambang Sutrisno', '3172••••••0009', 'Jl. Warakas IV Gg.5 No.33, RT.8/RW.6', 'Ojek Pangkalan', 1250000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK14', 'Yusuf Ramadhan', '3172••••••0011', 'Jl. Warakas IV Gg.4 No.9, RT.8/RW.6', 'Buruh Harian', 1350000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK15', 'Sri Wahyuni', '3172••••••0014', 'Jl. Warakas IV Gg.5 No.27, RT.8/RW.6', 'Penjahit Rumahan', 1550000, 4, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK16', 'Sari Endah', '3172••••••0020', 'Jl. Warakas IV Gg.2 No.20, RT.7/RW.6', 'Tukang Cuci', 1600000, 3, 1, 'Kontrak', 'Janda', 'Miskin', 'Lengkap', 1),
('KK17', 'Eko Prasetyo', '3172••••••0013', 'Jl. Warakas II Gg.1 No.22, RT.4/RW.6', 'Sopir Angkot', 1650000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK18', 'Agus Salim', '3172••••••0021', 'Jl. Warakas IV Gg.5 No.60, RT.9/RW.6', 'Pedagang Kecil', 1700000, 2, 1, 'Milik Sendiri', 'Lansia', 'Miskin', 'Lengkap', 1),
('KK19', 'Tuti Alawiyah', '3172••••••0018', 'Jl. Warakas IV Gg.5 No.52, RT.9/RW.6', 'Warung Kecil', 1750000, 3, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK20', 'Muhammad Ridwan', '3172••••••0015', 'Jl. Warakas I No.48, RT.2/RW.6', 'Pedagang Keliling', 1800000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK21', 'Joko Santoso', '3172••••••0017', 'Jl. Warakas III Gg.6 No.11, RT.6/RW.6', 'Ojek Online', 1900000, 4, 2, 'Kontrak', '-', 'Miskin', 'Lengkap', 1),
('KK22', 'Rudi Hartono', '3172••••••0019', 'Jl. Warakas II No.7, RT.5/RW.6', 'Buruh Pabrik Harian', 1950000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'KTP saja', 1),
('KK23', 'Iwan Setiawan', '3172••••••0027', 'Jl. Warakas I No.55, RT.2/RW.6', 'Buruh Harian', 2100000, 2, 1, 'Milik Sendiri', '-', 'Miskin', 'Lengkap', 1),
('KK24', 'Dedi Supriadi', '3172••••••0023', 'Jl. Warakas III No.29, RT.6/RW.6', 'Kuli Bangunan', 2150000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK25', 'Hendra Gunawan', '3172••••••0025', 'Jl. Warakas II Gg.8 No.26, RT.4/RW.6', 'Ojek Online', 2250000, 3, 2, 'Kontrak', '-', 'Miskin', 'Lengkap', 1),
('KK26', 'Lilis Suryani', '3172••••••0024', 'Jl. Warakas IV Gg.4 No.17, RT.8/RW.6', 'Penjual Makanan', 2300000, 4, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK27', 'Neneng Hasanah', '3172••••••0026', 'Jl. Warakas IV Gg.5 No.71, RT.9/RW.6', 'Warung Kecil', 2400000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK28', 'Rahmat Hidayatullah', '3172••••••0030', 'Jl. Warakas IV Gg.1 No.10, RT.7/RW.6', 'Pedagang Kecil', 2750000, 2, 1, 'Milik Sendiri', '-', '-', 'Lengkap', 1),
('KK29', 'Budi Hartawan', '3172••••••0028', 'Jl. Warakas III No.40, RT.6/RW.6', 'Karyawan Toko', 2850000, 3, 2, 'Kontrak', '-', '-', 'Lengkap', 1),
('KK30', 'Andi Wijaya', '3172••••••0029', 'Jl. Warakas II No.62, RT.5/RW.6', 'Ojek Online', 3100000, 4, 2, 'Milik Sendiri', 'Wali Santri', '-', 'Lengkap', 1);

INSERT INTO zakat_receipts (muzakki_id, zakat_type, amount_rice_kg, amount_money, received_date, recorded_by) VALUES
(NULL, 'Zakat Fitrah', 50, 0, '2025-03-20', 'Bendahara'),
(NULL, 'Zakat Fitrah', 45, 0, '2025-03-22', 'Bendahara'),
(NULL, 'Zakat Fitrah', 35, 0, '2025-03-24', 'Bendahara'),
(NULL, 'Zakat Fitrah', 0, 600000, '2025-03-25', 'Bendahara'),
(NULL, 'Zakat Fitrah', 0, 250000, '2025-03-26', 'Bendahara'),
(NULL, 'Zakat Mal', 0, 2500000, '2025-03-21', 'Bendahara'),
(NULL, 'Zakat Mal', 0, 1500000, '2025-03-24', 'Bendahara'),
(NULL, 'Zakat Mal', 0, 1000000, '2025-03-27', 'Bendahara'),
(NULL, 'Infaq', 0, 850000, '2025-03-15', 'Bendahara'),
(NULL, 'Infaq', 0, 750000, '2025-03-28', 'Bendahara');

INSERT INTO rules (rule_code, condition_text, result_text, execution_order, is_active, thresholds, source) VALUES
('R10', 'Dokumen KTP atau KK tidak lengkap', 'Pending Verifikasi', 1, 1, '{}', 'Wawancara Q12'),
('R11', 'NIK atau nomor KK sama dengan data lain pada periode yang sama', 'Duplikat', 1, 1, '{}', 'Wawancara Q15'),
('R09', 'Pendapatan lebih dari Rp 2.500.000 per bulan dan tidak ada kondisi khusus', 'Tidak Layak', 2, 1, '{"incomeLimit":2500000}', 'Wawancara Q2'),
('R01a', 'Pendapatan kurang dari Rp 1.500.000 per bulan', 'Prioritas 1', 3, 1, '{"incomeLimit":1500000}', 'Wawancara Q2'),
('R01b', 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000 per bulan', 'Prioritas 2', 3, 1, '{"incomeMin":1500000,"incomeLimit":2000000}', 'Wawancara Q2'),
('R01c', 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000 per bulan', 'Prioritas 3', 3, 1, '{"incomeMin":2000001,"incomeLimit":2500000}', 'Wawancara Q2'),
('R02', 'Pendapatan per kapita kurang dari atau sama dengan Rp 300.000', 'Naik ke Prioritas 1', 4, 1, '{"perCapitaLimit":300000}', 'Wawancara Q2 dan Q3'),
('R03', 'Jumlah tanggungan 4 jiwa atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', 'Prioritas ditegaskan dan dicatat tanggungan berat', 4, 1, '{"dependentsMin":4,"incomeLimit":2000000}', 'Wawancara Q3'),
('R04', 'Pekerjaan guru honorer TPQ dengan honor Rp 300.000 sampai Rp 600.000 per bulan', 'Asnaf Fisabilillah dan Prioritas 1', 4, 1, '{"honorMin":300000,"honorMax":600000}', 'Wawancara Q4'),
('R05', 'Status wali santri dan pendapatan kurang dari Rp 2.500.000', 'Layak dipertimbangkan dan dievaluasi lanjut', 4, 1, '{"incomeLimit":2500000}', 'Wawancara Q4'),
('R06', 'Status janda atau lansia atau yatim dan pendapatan kurang dari Rp 2.000.000', 'Prioritas ditegaskan dan berhak santunan infaq', 5, 1, '{"incomeLimit":2000000}', 'Wawancara Q1 dan Q10'),
('R07', 'Kondisi rumah kontrak atau menumpang', 'Dicatat kerentanan dan dipakai sebagai penentu seri', 5, 1, '{}', 'Wawancara Q10'),
('R08', 'Jumlah anak sekolah 3 atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', 'Dicatat beban pendidikan tinggi', 5, 1, '{"schoolMin":3,"incomeLimit":2000000}', 'Wawancara Q3 dan Q10'),
('R12', 'Total dana tersedia kurang dari kebutuhan semua mustahik layak', 'Salurkan berurutan Prioritas 1 lalu Prioritas 2 lalu Prioritas 3', 6, 1, '{}', 'Wawancara Q9');

INSERT INTO muzakki (id, full_name, address, zakat_type, amount, period_id) VALUES
('MZ01', 'Hamba Allah', 'Warakas, Tanjung Priok', 'Zakat Mal', 2500000, 1),
('MZ02', 'Keluarga H. Mahmud', 'Warakas, Tanjung Priok', 'Zakat Mal', 1500000, 1),
('MZ03', 'Hamba Allah', 'Warakas, Tanjung Priok', 'Zakat Mal', 1000000, 1),
('MZ04', 'Hamba Allah', 'Warakas, Tanjung Priok', 'Zakat Fitrah', 250000, 1),
('MZ05', 'Donatur TPQ', 'Warakas, Tanjung Priok', 'Infaq', 750000, 1),
('MZ06', 'Infaq Jumat dan Kotak Amal TPQ', 'TPQ Al Fawwaz', 'Infaq', 850000, 1);

INSERT INTO approvals (period_id, status, approver_id, approver_name, note, decided_at) VALUES
(1, 'approved', 'U03', 'Kepala TPQ', 'Hasil Ramadan 1446 H disetujui setelah verifikasi lapangan', '2025-03-27 10:00:00'),
(2, 'pending', NULL, NULL, '', NULL);
