<template>
  <div>
    <h1 class="text-xl font-bold">Laporan</h1>
    <p class="text-sm text-muted mt-1">Laporan penerimaan dan penyaluran periode Ramadan 1446 H.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" hint="130 kg" />
      <StatCard label="Beras tersalur" :value="formatKg(riceOut)" hint="130 kg, sisa 0 kg" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Rp 7.450.000" />
      <StatCard label="Sisa saldo" :value="formatMoney(balance)" hint="Rp 650.000" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">Rekap akhir</h2>
        <Button label="Cetak Laporan" severity="secondary" size="small" @click="printReport" />
      </div>
      <div class="mt-4 flex flex-col gap-2 text-sm max-w-xl">
        <div class="flex justify-between"><span>Total penerimaan beras</span><span class="tnum font-semibold">{{ formatKg(riceIn) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran beras</span><span class="tnum font-semibold">{{ formatKg(riceOut) }}</span></div>
        <div class="flex justify-between"><span>Total penerimaan uang</span><span class="tnum font-semibold">{{ formatMoney(moneyIn) }}</span></div>
        <div class="flex justify-between"><span>Zakat fitrah uang</span><span class="tnum">{{ formatMoney(850000) }}</span></div>
        <div class="flex justify-between"><span>Zakat mal</span><span class="tnum">{{ formatMoney(5000000) }}</span></div>
        <div class="flex justify-between"><span>Infaq</span><span class="tnum">{{ formatMoney(1600000) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran uang</span><span class="tnum font-semibold">{{ formatMoney(moneyOut) }}</span></div>
        <div class="flex justify-between border-t border-line pt-2"><span class="font-semibold">Sisa saldo uang</span><span class="tnum font-bold">{{ formatMoney(balance) }}</span></div>
        <div class="flex justify-between"><span>Jumlah KK menerima penyaluran</span><span class="tnum font-semibold">26 KK</span></div>
      </div>
      <p class="text-xs text-muted mt-4">Sisa saldo dipertahankan sebagai cadangan penyaluran susulan dan santunan bulan berikutnya, dicatat di buku dan ditandatangani Kepala TPQ.</p>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Arsip periode</h2>
      <DataTable :value="periods" size="small" class="mt-3">
        <Column field="periodName" header="Periode" />
        <Column field="startDate" header="Mulai" />
        <Column field="endDate" header="Selesai" />
        <Column field="status" header="Status" />
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

const { receipts, distributions } = useZakatData()
const moneyIn = computed(() => receipts.reduce((sum, row) => sum + row.amountMoney, 0))
const moneyOut = computed(() => distributions.reduce((sum, row) => sum + row.amountMoney, 0))
const balance = computed(() => moneyIn.value - moneyOut.value)
const riceIn = computed(() => receipts.reduce((sum, row) => sum + row.quantityKg, 0))
const riceOut = computed(() => distributions.reduce((sum, row) => sum + row.quantityKg, 0))
const periods = [
  { periodName: 'Ramadan 1446 H', startDate: '2025-03-01', endDate: '2025-03-29', status: 'closed' },
  { periodName: 'Ramadan 1447 H', startDate: '2026-02-18', endDate: '2026-03-19', status: 'active' }
]

function printReport() {
  window.print()
}
</script>
