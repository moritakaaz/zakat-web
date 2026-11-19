<template>
  <div>
    <h1 class="text-xl font-bold">Hasil Prioritas</h1>
    <p class="text-sm text-muted mt-1">Ranking setelah Forward Chaining. Urutan memakai prioritas, lalu pendapatan per kapita terendah.</p>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      <StatCard v-for="(count, label) in summary" :key="label" :label="label" :value="String(count)" hint="KK" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">Ranking penerima</h2>
        <Button label="Unduh Laporan" severity="secondary" size="small" @click="download" />
      </div>
      <DataTable :value="evaluations" paginator :rows="10" size="small" class="mt-3">
        <Column field="rank" header="Urutan">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.index + 1 }}</span>
          </template>
        </Column>
        <Column field="id" header="Kode" />
        <Column field="fullName" header="Nama Kepala Keluarga" />
        <Column field="perCapita" header="Per Kapita">
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.perCapita) }}</span>
          </template>
        </Column>
        <Column field="firedRules" header="Aturan Menyala">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.firedRules.join(', ') }}</span>
          </template>
        </Column>
        <Column field="result" header="Hasil">
          <template #body="slotProps">
            <PriorityTag :value="slotProps.data.result" />
          </template>
        </Column>
      </DataTable>
      <p class="text-xs text-muted mt-3">Aturan R12 dipakai di sini. Bila dana tidak cukup, Prioritas 1 disalurkan pertama, lalu Prioritas 2, lalu Prioritas 3.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { formatMoney } from '~/utils/format'

const { evaluations, summary } = useZakatData()

function download() {
  const lines = ['Hasil Prioritas Mustahik Ramadan 1446 H', '']
  evaluations.value.forEach((item, index) => {
    lines.push((index + 1) + '. ' + item.fullName + ' - ' + item.result + ' - ' + item.firedRules.join(', '))
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'hasil-prioritas-1446H.txt'
  link.click()
  URL.revokeObjectURL(url)
}
</script>
