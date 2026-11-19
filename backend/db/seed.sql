-- Seed data for the zakat database.
-- Generated from the Excel reference file with 30 mustahik households.
USE zakat_al_fawwaz;

INSERT INTO periods (id, period_name, start_date, end_date, status) VALUES
(1, 'Ramadan 1446 H', '2025-03-01', '2025-03-29', 'closed'),
(2, 'Ramadan 1447 H', '2026-02-18', '2026-03-19', 'active');

INSERT INTO mustahik (id, full_name, address, occupation, monthly_income, dependents, school_children, house_condition, special_status, asnaf, document_status, period_id) VALUES
('KK01', 'Siti Maryam', 'Jl. Warakas IV Gg.5 No.12, RT.8/RW.6', 'Tidak Bekerja', 0, 5, 3, 'Menumpang', 'Janda', 'Fakir', 'Lengkap', 1),
('KK02', 'H. Abdullah Syafiq (Lansia)', 'Jl. Warakas IV Gg.2 No.4, RT.7/RW.6', 'Tidak Bekerja', 0, 2, 0, 'Milik Sendiri', 'Lansia', 'Fakir', 'Lengkap', 1),
('KK03', 'Ustzh. Fatimah Zahra', 'Jl. Warakas IV Gg.5 No.18, RT.8/RW.6', 'Guru Honorer TPQ', 450000, 3, 2, 'Kontrak', 'Guru Honorer TPQ', 'Fisabilillah', 'Lengkap', 1),
('KK04', 'Fitri Rahmawati', 'Jl. Warakas I Gg.5 No.3, RT.3/RW.6', 'Guru Honorer TPQ', 500000, 3, 2, 'Kontrak', 'Guru Honorer TPQ, Wali Santri', 'Fisabilillah', 'Lengkap', 1),
('KK05', 'Aisyah Putri', 'Jl. Warakas IV Gg.3 No.15, RT.7/RW.6', 'Guru Honorer TPQ', 550000, 2, 1, 'Menumpang', 'Guru Honorer TPQ', 'Fisabilillah', 'Lengkap', 1),
('KK06', 'Nurhayati', 'Jl. Warakas IV Gg.3 No.8, RT.7/RW.6', 'Tukang Cuci', 600000, 4, 2, 'Kontrak', 'Janda, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK07', 'Dewi Lestari', 'Jl. Warakas III No.14, RT.6/RW.6', 'Guru Honorer TPQ', 600000, 4, 2, 'Milik Sendiri', 'Guru Honorer TPQ, Wali Santri', 'Fisabilillah', 'Lengkap', 1),
('KK08', 'Ahmad Hidayat', 'Jl. Warakas IV Gg.5 No.70, RT.8/RW.6', 'Buruh Harian', 750000, 6, 4, 'Kontrak', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK09', 'Mimin Mintarsih', 'Jl. Warakas IV Gg.5 No.25, RT.8/RW.6', 'Penjual Gorengan', 900000, 5, 3, 'Menumpang', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK10', 'Rina Marlina', 'Jl. Warakas I Gg.7 No.19, RT.3/RW.6', 'Asisten Rumah Tangga', 1000000, 4, 3, 'Kontrak', 'Janda, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK11', 'Slamet Riyadi', 'Jl. Warakas II No.31, RT.5/RW.6', 'Kuli Bangunan', 1100000, 6, 4, 'Kontrak', 'Wali Santri', 'Fakir', 'Lengkap', 1),
('KK12', 'Keluarga Yatim — Ibu Ratna Sari', 'Jl. Warakas IV Gg.5 No.41, RT.9/RW.6', 'Pedagang Kecil', 1200000, 4, 3, 'Kontrak', 'Janda, Yatim, Wali Santri', 'Fakir', 'Lengkap', 1),
('KK13', 'Bambang Sutrisno', 'Jl. Warakas IV Gg.5 No.33, RT.8/RW.6', 'Ojek Pangkalan', 1250000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK14', 'Yusuf Ramadhan', 'Jl. Warakas IV Gg.4 No.9, RT.8/RW.6', 'Buruh Harian', 1350000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK15', 'Sri Wahyuni', 'Jl. Warakas IV Gg.5 No.27, RT.8/RW.6', 'Penjahit Rumahan', 1550000, 4, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK16', 'Sari Endah', 'Jl. Warakas IV Gg.2 No.20, RT.7/RW.6', 'Tukang Cuci', 1600000, 3, 1, 'Kontrak', 'Janda', 'Miskin', 'Lengkap', 1),
('KK17', 'Eko Prasetyo', 'Jl. Warakas II Gg.1 No.22, RT.4/RW.6', 'Sopir Angkot', 1650000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK18', 'Agus Salim', 'Jl. Warakas IV Gg.5 No.60, RT.9/RW.6', 'Pedagang Kecil', 1700000, 2, 1, 'Milik Sendiri', 'Lansia', 'Miskin', 'Lengkap', 1),
('KK19', 'Tuti Alawiyah', 'Jl. Warakas IV Gg.5 No.52, RT.9/RW.6', 'Warung Kecil', 1750000, 3, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK20', 'Muhammad Ridwan', 'Jl. Warakas I No.48, RT.2/RW.6', 'Pedagang Keliling', 1800000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK21', 'Joko Santoso', 'Jl. Warakas III Gg.6 No.11, RT.6/RW.6', 'Ojek Online', 1900000, 4, 2, 'Kontrak', '-', 'Miskin', 'Lengkap', 1),
('KK22', 'Rudi Hartono', 'Jl. Warakas II No.7, RT.5/RW.6', 'Buruh Pabrik Harian', 1950000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'KTP saja', 1),
('KK23', 'Iwan Setiawan', 'Jl. Warakas I No.55, RT.2/RW.6', 'Buruh Harian', 2100000, 2, 1, 'Milik Sendiri', '-', 'Miskin', 'Lengkap', 1),
('KK24', 'Dedi Supriadi', 'Jl. Warakas III No.29, RT.6/RW.6', 'Kuli Bangunan', 2150000, 5, 3, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK25', 'Hendra Gunawan', 'Jl. Warakas II Gg.8 No.26, RT.4/RW.6', 'Ojek Online', 2250000, 3, 2, 'Kontrak', '-', 'Miskin', 'Lengkap', 1),
('KK26', 'Lilis Suryani', 'Jl. Warakas IV Gg.4 No.17, RT.8/RW.6', 'Penjual Makanan', 2300000, 4, 2, 'Milik Sendiri', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK27', 'Neneng Hasanah', 'Jl. Warakas IV Gg.5 No.71, RT.9/RW.6', 'Warung Kecil', 2400000, 6, 4, 'Kontrak', 'Wali Santri', 'Miskin', 'Lengkap', 1),
('KK28', 'Rahmat Hidayatullah', 'Jl. Warakas IV Gg.1 No.10, RT.7/RW.6', 'Pedagang Kecil', 2750000, 2, 1, 'Milik Sendiri', '-', '-', 'Lengkap', 1),
('KK29', 'Budi Hartawan', 'Jl. Warakas III No.40, RT.6/RW.6', 'Karyawan Toko', 2850000, 3, 2, 'Kontrak', '-', '-', 'Lengkap', 1),
('KK30', 'Andi Wijaya', 'Jl. Warakas II No.62, RT.5/RW.6', 'Ojek Online', 3100000, 4, 2, 'Milik Sendiri', 'Wali Santri', '-', 'Lengkap', 1);

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
