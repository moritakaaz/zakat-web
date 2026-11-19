<template>
  <div>
    <h1 class="text-xl font-bold">Dashboard</h1>
    <p class="text-sm text-muted mt-1">Periode {{ periodName }}. Angka dari pencatatan bendahara.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Mustahik terdata" :value="String(data.totalMustahik)" hint="KK pada periode ini" icon="lucide:users" />
      <StatCard label="Uang masuk" :value="formatMoney(data.moneyIn)" hint="Fitrah, mal, dan infaq" icon="lucide:wallet" />
      <StatCard label="Uang tersalur" :value="formatMoney(data.moneyOut)" hint="Sisa saldo" icon="lucide:hand-coins" />
      <StatCard label="Beras masuk dan tersalur" :value="formatKg(data.riceIn)" hint="Sisa beras" icon="lucide:wheat" />
    </div>

    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <div class="bg-white border border-line rounded-lg p-4">
        <h2 class="font-semibold flex items-center gap-2">
          <Icon name="lucide:chart-pie" size="18" />
          Penerima berdasarkan prioritas
        </h2>
        <ClientOnly>
          <Chart type="doughnut" :data="priorityChart" :options="donutOptions" class="mt-4" style="height: 220px" />
        </ClientOnly>
        <div class="mt-4 flex flex-col gap-3">
          <div v-for="(count, label) in data.summary" :key="label" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2">
              <PriorityTag :value="label" />
            </span>
            <span class="tnum font-bold">{{ count }} KK</span>
          </div>
        </div>
        <p class="text-xs text-muted mt-4">Penerima layak sebanyak {{ layakCount }} KK. Prioritas 1 disalurkan pertama bila dana terbatas.</p>
      </div>
      <div class="bg-white border border-line rounded-lg p-4">
        <h2 class="font-semibold flex items-center gap-2">
          <Icon name="lucide:chart-column" size="18" />
          Penerimaan lawan penyaluran
        </h2>
        <ClientOnly>
          <Chart type="bar" :data="financeChart" :options="barOptions" class="mt-4" style="height: 220px" />
        </ClientOnly>
        <div class="mt-4 flex flex-col gap-2 text-sm">
          <div class="flex justify-between"><span>Uang masuk</span><span class="tnum font-semibold">{{ formatMoney(data.moneyIn) }}</span></div>
          <div class="flex justify-between"><span>Uang tersalur</span><span class="tnum font-semibold">{{ formatMoney(data.moneyOut) }}</span></div>
          <div class="flex justify-between border-t border-line pt-2"><span class="font-semibold">Sisa saldo</span><span class="tnum font-bold">{{ formatMoney(data.balance) }}</span></div>
          <div class="flex justify-between"><span>Beras masuk</span><span class="tnum font-semibold">{{ formatKg(data.riceIn) }}</span></div>
          <div class="flex justify-between"><span>Beras tersalur</span><span class="tnum font-semibold">{{ formatKg(data.riceOut) }}</span></div>
        </div>
        <div class="mt-4 flex gap-2">
          <Button label="Lihat Hasil Prioritas" size="small" @click="navigateTo('/results')" />
          <Button label="Buka Laporan" severity="secondary" size="small" @click="navigateTo('/reports')" />
        </div>
      </div>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Prioritas 1 teratas</h2>
      <DataTable :value="topPriority" size="small" class="mt-3">
        <Column field="id" header="Kode" />
        <Column field="fullName" header="Nama Kepala Keluarga" />
        <Column field="occupation" header="Pekerjaan" />
        <Column field="monthlyIncome" header="Pendapatan">
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.monthlyIncome) }}</span>
          </template>
        </Column>
        <Column field="perCapita" header="Per Kapita">
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.perCapita) }}</span>
          </template>
        </Column>
        <Column field="result" header="Hasil">
          <template #body="slotProps">
            <PriorityTag :value="slotProps.data.result" />
          </template>
        </Column>
      </DataTable>
    </div>
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
