// Receipt and distribution records for Ramadan 1446 H.
export interface FinanceRecord { id: string, date: string, zakatType: string, name: string, souls: number, form: string, quantityKg: number, amountMoney: number, note: string }

export const receipts: FinanceRecord[] = [
  { id: 'RC01', date: '2025-03-20', zakatType: 'Zakat Fitrah', name: 'Warga RT.8/RW.6 (kolektif)', souls: 20, form: 'Beras', quantityKg: 50, amountMoney: 0, note: '2,5 kg × 20 jiwa — dicatat kolektif seperti di buku' },
  { id: 'RC02', date: '2025-03-22', zakatType: 'Zakat Fitrah', name: 'Warga RT.7/RW.6 (kolektif)', souls: 18, form: 'Beras', quantityKg: 45, amountMoney: 0, note: '2,5 kg × 18 jiwa' },
  { id: 'RC03', date: '2025-03-24', zakatType: 'Zakat Fitrah', name: 'Warga RT.9/RW.6 (kolektif)', souls: 14, form: 'Beras', quantityKg: 35, amountMoney: 0, note: '2,5 kg × 14 jiwa' },
  { id: 'RC04', date: '2025-03-25', zakatType: 'Zakat Fitrah', name: '12 KK membayar tunai', souls: 12, form: 'Uang', quantityKg: 0, amountMoney: 600000, note: 'Rp50.000 × 12 jiwa (setara beras)' },
  { id: 'RC05', date: '2025-03-26', zakatType: 'Zakat Fitrah', name: 'Hamba Allah (tunai)', souls: 5, form: 'Uang', quantityKg: 0, amountMoney: 250000, note: 'Rp50.000 × 5 jiwa' },
  { id: 'RC06', date: '2025-03-21', zakatType: 'Zakat Mal', name: 'Hamba Allah — Warakas', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 2500000, note: 'Zakat mal penghasilan' },
  { id: 'RC07', date: '2025-03-24', zakatType: 'Zakat Mal', name: 'Keluarga H. Mahmud', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 1500000, note: 'Zakat mal' },
  { id: 'RC08', date: '2025-03-27', zakatType: 'Zakat Mal', name: 'Hamba Allah — pedagang', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 1000000, note: 'Zakat mal' },
  { id: 'RC09', date: '2025-03-15', zakatType: 'Infaq', name: 'Infaq Jumat & kotak amal TPQ', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 850000, note: 'Akumulasi 1–15 Maret 2025' },
  { id: 'RC10', date: '2025-03-28', zakatType: 'Infaq', name: 'Donatur TPQ', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 750000, note: 'Untuk operasional penyaluran & santunan yatim' },
]

export const distributions: FinanceRecord[] = [
  { id: 'DS01', date: '2025-03-28', zakatType: 'Zakat Fitrah', name: 'Mustahik Prioritas 1 (lihat Data Mustahik)', souls: 15, form: 'Beras', quantityKg: 75, amountMoney: 0, note: '5 kg beras / KK — 15 KK × 5 kg (termasuk 1 KK naik ke P1 via R02 per kapita Rp300.000)' },
  { id: 'DS02', date: '2025-03-28', zakatType: 'Zakat Fitrah', name: 'Mustahik Prioritas 2', souls: 6, form: 'Beras', quantityKg: 30, amountMoney: 0, note: '5 kg beras / KK — 6 KK × 5 kg (1 KK lain Pending Verifikasi — Rudi Hartono)' },
  { id: 'DS03', date: '2025-03-29', zakatType: 'Zakat Fitrah', name: 'Mustahik Prioritas 3', souls: 5, form: 'Beras', quantityKg: 25, amountMoney: 0, note: '5 kg beras / KK — 5 KK × 5 kg (total beras tersalur 130 kg = habis)' },
  { id: 'DS04', date: '2025-03-29', zakatType: 'Zakat Fitrah', name: 'Mustahik Prioritas 1–3 (uang fitrah tunai)', souls: 17, form: 'Uang', quantityKg: 0, amountMoney: 850000, note: 'Rp50.000 / KK untuk 17 KK yang menerima bentuk uang' },
  { id: 'DS05', date: '2025-03-29', zakatType: 'Zakat Mal', name: 'Mustahik Prioritas 1 (santunan tunai)', souls: 10, form: 'Uang', quantityKg: 0, amountMoney: 3000000, note: 'Rp300.000 / KK × 10 KK' },
  { id: 'DS06', date: '2025-03-29', zakatType: 'Zakat Mal', name: 'Guru Honorer TPQ (Fisabilillah)', souls: 4, form: 'Uang', quantityKg: 0, amountMoney: 1200000, note: 'Rp300.000 / guru × 4 guru' },
  { id: 'DS07', date: '2025-03-29', zakatType: 'Zakat Mal', name: 'Mustahik Prioritas 2 (santunan tunai)', souls: 4, form: 'Uang', quantityKg: 0, amountMoney: 800000, note: 'Sisa zakat mal: Rp200.000 / KK × 4 KK' },
  { id: 'DS08', date: '2025-03-29', zakatType: 'Infaq', name: 'Santunan anak yatim & operasional amil', souls: 0, form: 'Uang', quantityKg: 0, amountMoney: 950000, note: 'Yatim Rp650.000 + operasional penyaluran Rp300.000' },
]
