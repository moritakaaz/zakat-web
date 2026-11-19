<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
    <p class="text-sm text-slate-500 mt-1">Periode {{ periodName }}. Angka dari pencatatan bendahara.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Mustahik terdata" :value="String(data.totalMustahik)" hint="KK pada periode ini" icon="i-lucide-users" />
      <StatCard label="Uang masuk" :value="formatMoney(data.moneyIn)" hint="Fitrah, mal, dan infaq" icon="i-lucide-wallet" />
      <StatCard label="Uang tersalur" :value="formatMoney(data.moneyOut)" hint="Sisa saldo" icon="i-lucide-hand-coins" />
      <StatCard label="Beras masuk dan tersalur" :value="formatKg(data.riceIn)" hint="Sisa beras" icon="i-lucide-wheat" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
      <UCard class="shadow-sm ring-slate-200">
        <template #header>
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-chart-pie" class="size-4.5 text-emerald-700" />
            Penerima berdasarkan prioritas
          </h2>
        </template>
        <ClientOnly>
          <ChartCanvas type="doughnut" :data="priorityChart" :options="donutOptions" />
        </ClientOnly>
        <div class="mt-4 flex flex-col gap-3">
          <div v-for="(count, label) in data.summary" :key="label" class="flex items-center justify-between text-sm">
            <PriorityTag :value="label" />
            <span class="tnum font-bold">{{ count }} KK</span>
          </div>
        </div>
        <p class="text-xs text-slate-500 mt-4">Penerima layak sebanyak {{ layakCount }} KK. Prioritas 1 disalurkan pertama bila dana terbatas.</p>
      </UCard>
      <UCard class="shadow-sm ring-slate-200">
        <template #header>
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-chart-column" class="size-4.5 text-emerald-700" />
            Penerimaan lawan penyaluran
          </h2>
        </template>
        <ClientOnly>
          <ChartCanvas type="bar" :data="financeChart" :options="barOptions" />
        </ClientOnly>
        <div class="mt-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between"><span>Uang masuk</span><span class="tnum font-semibold">{{ formatMoney(data.moneyIn) }}</span></div>
          <div class="flex justify-between"><span>Uang tersalur</span><span class="tnum font-semibold">{{ formatMoney(data.moneyOut) }}</span></div>
          <div class="flex justify-between border-t border-slate-200 pt-2"><span class="font-semibold">Sisa saldo</span><span class="tnum font-bold">{{ formatMoney(data.balance) }}</span></div>
          <div class="flex justify-between"><span>Beras masuk</span><span class="tnum font-semibold">{{ formatKg(data.riceIn) }}</span></div>
          <div class="flex justify-between"><span>Beras tersalur</span><span class="tnum font-semibold">{{ formatKg(data.riceOut) }}</span></div>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton size="sm" @click="navigateTo('/results')">Lihat Hasil Prioritas</UButton>
          <UButton color="neutral" variant="soft" size="sm" @click="navigateTo('/reports')">Buka Laporan</UButton>
        </div>
      </UCard>
    </div>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold text-slate-900">Prioritas 1 teratas</h2>
      </template>
      <div class="overflow-x-auto">
        <UTable :data="topPriority" :columns="topColumns">
          <template #monthlyIncome-cell="{ row }">
            <span class="tnum">{{ formatMoney(row.original.monthlyIncome) }}</span>
          </template>
          <template #perCapita-cell="{ row }">
            <span class="tnum">{{ formatMoney(row.original.perCapita) }}</span>
          </template>
          <template #result-cell="{ row }">
            <PriorityTag :value="row.original.result" />
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod, useRules } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

const { dashboard, evaluations, mustahik } = useZakatData()
const { authFetch } = useSession()
const { periods, selectedPeriodId } = usePeriod()
const { loadRules } = useRules()
const data = dashboard
const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const layakCount = computed(() => (data.value.summary['Prioritas 1'] || 0) + (data.value.summary['Prioritas 2'] || 0) + (data.value.summary['Prioritas 3'] || 0))
const topPriority = computed(() => {
  const byId = new Map(mustahik.value.map((item) => [item.id, item]))
  return evaluations.value
    .filter((item) => item.result === 'Prioritas 1')
    .slice(0, 5)
    .map((item) => ({
      ...item,
      occupation: byId.get(item.id)?.occupation || '-',
      monthlyIncome: byId.get(item.id)?.monthlyIncome || 0
    }))
})
const topColumns = [
  { accessorKey: 'id', header: 'Kode' },
  { accessorKey: 'fullName', header: 'Nama Kepala Keluarga' },
  { accessorKey: 'occupation', header: 'Pekerjaan' },
  { accessorKey: 'monthlyIncome', header: 'Pendapatan' },
  { accessorKey: 'perCapita', header: 'Per Kapita' },
  { accessorKey: 'result', header: 'Hasil' }
]

const priorityLabels = ['Prioritas 1', 'Prioritas 2', 'Prioritas 3', 'Pending Verifikasi', 'Tidak Layak']
const priorityChart = computed(() => ({
  labels: priorityLabels,
  datasets: [{
    data: priorityLabels.map((label) => data.value.summary[label] || 0),
    backgroundColor: ['#15803d', '#0369a1', '#b45309', '#64748b', '#b91c1c']
  }]
}))
const donutOptions = { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }

const financeChart = computed(() => ({
  labels: ['Masuk', 'Tersalur'],
  datasets: [
    { label: 'Uang (Rp)', data: [data.value.moneyIn, data.value.moneyOut], backgroundColor: '#15803d', yAxisID: 'y' },
    { label: 'Beras (kg)', data: [data.value.riceIn, data.value.riceOut], backgroundColor: '#0369a1', yAxisID: 'y1' }
  ]
}))
const barOptions = {
  maintainAspectRatio: false,
  scales: {
    y: { type: 'linear', position: 'left', ticks: { callback: (value: any) => 'Rp ' + Number(value).toLocaleString('id-ID') } },
    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { callback: (value: any) => value + ' kg' } }
  },
  plugins: { legend: { position: 'bottom' } }
}

onMounted(() => loadRules(authFetch))
</script>
