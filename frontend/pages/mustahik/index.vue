<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold">Data Mustahik</h1>
        <p class="text-sm text-muted mt-1">30 KK pada periode Ramadan 1446 H. Klik baris untuk melihat jejak rule.</p>
      </div>
      <Button label="Tambah Mustahik" @click="navigateTo('/mustahik/new')" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-6">
      <div class="flex gap-2 mb-4">
        <InputText v-model="search" placeholder="Cari nama, alamat, atau pekerjaan" class="w-full" />
        <Select v-model="filterResult" :options="filterOptions" placeholder="Semua hasil" class="w-56" />
      </div>

      <DataTable :value="filtered" paginator :rows="10" size="small" data-key="id" selection-mode="single" @row-select="openDetail">
        <Column field="id" header="Kode" />
        <Column field="fullName" header="Nama Kepala Keluarga" sortable />
        <Column field="occupation" header="Pekerjaan" />
        <Column field="monthlyIncome" header="Pendapatan" sortable>
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.monthlyIncome) }}</span>
          </template>
        </Column>
        <Column field="dependents" header="Tanggungan" />
        <Column field="houseCondition" header="Rumah" />
        <Column field="result" header="Hasil">
          <template #body="slotProps">
            <PriorityTag :value="slotProps.data.result" />
          </template>
        </Column>
      </DataTable>

      <Message v-if="filtered.length === 0" severity="info" class="mt-4">Tidak ada mustahik yang cocok dengan pencarian.</Message>
    </div>

    <Dialog v-model:visible="showDetail" modal header="Jejak Forward Chaining" class="w-full max-w-2xl">
      <div v-if="selected">
        <p class="font-semibold">{{ selected.fullName }} ({{ selected.id }})</p>
        <p class="text-sm text-muted mt-1">Hasil {{ selected.result }} dengan pendapatan per kapita {{ formatMoney(selected.perCapita) }}.</p>
        <ol class="mt-4 flex flex-col gap-2 text-sm">
          <li v-for="step in selected.trace" :key="step.code" class="flex gap-2">
            <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
            <span>{{ step.fired ? 'Menyala' : 'Tidak menyala' }} - {{ step.note }}</span>
          </li>
        </ol>
        <p class="text-sm mt-4">Aturan yang menyala {{ selected.firedRules.join(', ') || 'tidak ada' }}.</p>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'
import { formatMoney } from '~/utils/format'

const { mustahik, evaluations } = useZakatData()
const search = ref('')
const filterResult = ref('')
const filterOptions = ['', 'Prioritas 1', 'Prioritas 2', 'Prioritas 3', 'Pending Verifikasi', 'Tidak Layak']
const showDetail = ref(false)
const selected = ref<any>(null)

const rows = computed(() => {
  const byId = new Map(evaluations.value.map((item) => [item.id, item]))
  return mustahik.value.map((item) => ({ ...item, result: byId.get(item.id)?.result || '-', perCapita: byId.get(item.id)?.perCapita || 0 }))
})

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    if (filterResult.value && item.result !== filterResult.value) return false
    if (!query) return true
    return [item.fullName, item.address, item.occupation].join(' ').toLowerCase().includes(query)
  })
})

function openDetail(event: any) {
  const niks = mustahik.value.map((item) => item.nik)
  selected.value = evaluateMustahik(event.data, niks)
  showDetail.value = true
}
</script>
