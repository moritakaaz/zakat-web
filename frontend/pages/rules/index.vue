<template>
  <div>
    <h1 class="text-xl font-bold">Proses Rule</h1>
    <p class="text-sm text-muted mt-1">Mesin Rule-Based dengan Forward Chaining. Fakta diperiksa dari R10 sampai R08 secara berurutan.</p>

    <div class="bg-white border border-line rounded-lg p-4 mt-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold">Basis pengetahuan</h2>
          <p class="text-sm text-muted">14 aturan dari PRD bagian 5 dan file data acuan.</p>
        </div>
        <Button label="Jalankan Forward Chaining" @click="run" />
      </div>
      <DataTable :value="rules" size="small" class="mt-4">
        <Column field="code" header="Kode" />
        <Column field="condition" header="Kondisi IF" />
        <Column field="result" header="Kesimpulan THEN" />
        <Column field="source" header="Sumber" />
      </DataTable>
    </div>

    <div v-if="ran" class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Hasil proses untuk 30 KK</h2>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <StatCard v-for="(count, label) in summary" :key="label" :label="label" :value="String(count)" hint="KK" />
      </div>
      <p class="text-sm text-muted mt-4">Contoh jejak untuk Ahmad Hidayat ada di bawah. Jejak lengkap per KK dapat dibuka dari halaman Data Mustahik.</p>
      <ol class="mt-4 flex flex-col gap-2 text-sm">
        <li v-for="step in example.trace" :key="step.code" class="flex gap-2">
          <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
          <span>{{ step.fired ? 'Menyala' : 'Tidak menyala' }} - {{ step.note }}</span>
        </li>
      </ol>
      <p class="text-sm mt-3 font-semibold">Kesimpulan {{ example.fullName }} adalah {{ example.result }}.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const { mustahik, summary } = useZakatData()
const ran = ref(false)

const rules = [
  { code: 'R10', condition: 'Dokumen KTP atau KK tidak lengkap', result: 'Pending Verifikasi', source: 'Wawancara Q12' },
  { code: 'R11', condition: 'NIK atau nomor KK sama dengan data lain pada periode yang sama', result: 'Duplikat', source: 'Wawancara Q15' },
  { code: 'R09', condition: 'Pendapatan lebih dari Rp 2.500.000 per bulan dan tidak ada kondisi khusus', result: 'Tidak Layak', source: 'Wawancara Q2' },
  { code: 'R01a', condition: 'Pendapatan kurang dari Rp 1.500.000 per bulan', result: 'Prioritas 1', source: 'Wawancara Q2' },
  { code: 'R01b', condition: 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000 per bulan', result: 'Prioritas 2', source: 'Wawancara Q2' },
  { code: 'R01c', condition: 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000 per bulan', result: 'Prioritas 3', source: 'Wawancara Q2' },
  { code: 'R02', condition: 'Pendapatan per kapita kurang dari atau sama dengan Rp 300.000', result: 'Naik ke Prioritas 1', source: 'Wawancara Q2 dan Q3' },
  { code: 'R03', condition: 'Jumlah tanggungan 4 jiwa atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', result: 'Prioritas ditegaskan', source: 'Wawancara Q3' },
  { code: 'R04', condition: 'Guru honorer TPQ dengan honor Rp 300.000 sampai Rp 600.000 per bulan', result: 'Fisabilillah dan Prioritas 1', source: 'Wawancara Q4' },
  { code: 'R05', condition: 'Status wali santri dan pendapatan kurang dari Rp 2.500.000', result: 'Layak dipertimbangkan', source: 'Wawancara Q4' },
  { code: 'R06', condition: 'Status janda atau lansia atau yatim dan pendapatan kurang dari Rp 2.000.000', result: 'Prioritas ditegaskan', source: 'Wawancara Q1 dan Q10' },
  { code: 'R07', condition: 'Kondisi rumah kontrak atau menumpang', result: 'Penentu seri saat ranking', source: 'Wawancara Q10' },
  { code: 'R08', condition: 'Jumlah anak sekolah 3 atau lebih dan pendapatan kurang dari atau sama dengan Rp 2.000.000', result: 'Beban pendidikan tinggi', source: 'Wawancara Q3 dan Q10' },
  { code: 'R12', condition: 'Total dana tersedia kurang dari kebutuhan semua mustahik layak', result: 'Salurkan Prioritas 1 lalu 2 lalu 3', source: 'Wawancara Q9' }
]

const example = computed(() => {
  const item = mustahik.value.find((row) => row.id === 'KK08')
  const niks = mustahik.value.map((row) => row.nik)
  return evaluateMustahik(item, niks)
})

function run() {
  ran.value = true
}
</script>
