<template>
  <div>
    <h1 class="text-xl font-bold">Dashboard</h1>
    <p class="text-sm text-muted mt-1">Periode Ramadan 1446 H. Angka dari pencatatan bendahara.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Mustahik terdata" :value="String(data.totalMustahik)" hint="30 KK pada data acuan" />
      <StatCard label="Uang masuk" :value="formatMoney(data.moneyIn)" hint="Fitrah, mal, dan infaq" />
      <StatCard label="Uang tersalur" :value="formatMoney(data.moneyOut)" hint="Sisa saldo Rp 650.000" />
      <StatCard label="Beras masuk dan tersalur" :value="formatKg(data.riceIn)" hint="Sisa beras 0 kg" />
    </div>

    <div class="grid lg:grid-cols-2 gap-4 mt-4">
      <div class="bg-white border border-line rounded-lg p-4">
        <h2 class="font-semibold">Penerima berdasarkan prioritas</h2>
        <div class="mt-4 flex flex-col gap-3">
          <div v-for="(count, label) in data.summary" :key="label" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2">
              <PriorityTag :value="label" />
            </span>
            <span class="tnum font-bold">{{ count }} KK</span>
          </div>
        </div>
        <p class="text-xs text-muted mt-4">Penerima layak sebanyak 26 KK. Prioritas 1 disalurkan pertama bila dana terbatas.</p>
      </div>
      <div class="bg-white border border-line rounded-lg p-4">
        <h2 class="font-semibold">Neraca penyaluran</h2>
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
import { useZakatData } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

const { dashboard, evaluations, mustahik } = useZakatData()
const data = dashboard
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
</script>
