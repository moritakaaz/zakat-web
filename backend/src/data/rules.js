// Knowledge base for the rule engine.
// The 14 rules below are the tested version of PRD section 5.
// They reproduce the reference counts in PRD section 6 exactly.
const rules = [
  { code: 'R10', order: 1, condition: 'Dokumen KTP atau KK tidak lengkap', result: 'Pending Verifikasi', source: 'Wawancara Q12' },
  { code: 'R11', order: 1, condition: 'NIK atau nomor KK sama dengan data lain pada periode yang sama', result: 'Duplikat', source: 'Wawancara Q15' },
  { code: 'R09', order: 2, condition: 'Pendapatan lebih dari Rp 2.500.000 per bulan dan tidak ada kondisi khusus', result: 'Tidak Layak', source: 'Wawancara Q2' },
  { code: 'R01a', order: 3, condition: 'Pendapatan kurang dari Rp 1.500.000 per bulan', result: 'Prioritas 1', source: 'Wawancara Q2' },
  { code: 'R01b', order: 3, condition: 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000 per bulan', result: 'Prioritas 2', source: 'Wawancara Q2' },
  { code: 'R01c', order: 3, condition: 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000 per bulan', result: 'Prioritas 3', source: 'Wawancara Q2' },
  { code: 'R02', order: 4, condition: 'Pendapatan per kapita kurang dari atau sama dengan Rp 300.000', result: 'Naik ke Prioritas 1', source: 'Wawancara Q2 dan Q3' },
  { code: 'R03', order: 4, condition: 'Jumlah tanggungan 4 jiwa atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', result: 'Prioritas ditegaskan dan dicatat tanggungan berat', source: 'Wawancara Q3' },
  { code: 'R04', order: 4, condition: 'Pekerjaan guru honorer TPQ dengan honor Rp 300.000 sampai Rp 600.000 per bulan', result: 'Asnaf Fisabilillah dan Prioritas 1', source: 'Wawancara Q4' },
  { code: 'R05', order: 4, condition: 'Status wali santri dan pendapatan kurang dari Rp 2.500.000', result: 'Layak dipertimbangkan dan dievaluasi lanjut', source: 'Wawancara Q4' },
  { code: 'R06', order: 5, condition: 'Status janda atau lansia atau yatim dan pendapatan kurang dari Rp 2.000.000', result: 'Prioritas ditegaskan dan berhak santunan infaq', source: 'Wawancara Q1 dan Q10' },
  { code: 'R07', order: 5, condition: 'Kondisi rumah kontrak atau menumpang', result: 'Dicatat kerentanan dan dipakai sebagai penentu seri', source: 'Wawancara Q10' },
  { code: 'R08', order: 5, condition: 'Jumlah anak sekolah 3 atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', result: 'Dicatat beban pendidikan tinggi', source: 'Wawancara Q3 dan Q10' },
  { code: 'R12', order: 6, condition: 'Total dana tersedia kurang dari kebutuhan semua mustahik layak', result: 'Salurkan berurutan Prioritas 1 lalu Prioritas 2 lalu Prioritas 3', source: 'Wawancara Q9' }
]

module.exports = rules
