<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Laporan</h1>
    <p class="text-sm text-slate-500 mt-1">Laporan penerimaan dan penyaluran periode {{ periodName }}. Klik judul kolom pada arsip untuk mengurutkan.</p>

    <UAlert v-if="loadError" color="error" variant="soft" :title="loadError" icon="i-lucide-circle-x" class="mt-6" />
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" :hint="formatKg(riceIn)" icon="i-lucide-wheat" />
      <StatCard label="Beras tersalur" :value="formatKg(riceOut)" :hint="'Sisa ' + formatKg(riceIn - riceOut)" icon="i-lucide-wheat" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Fitrah, mal, dan infaq" icon="i-lucide-wallet" />
      <StatCard label="Sisa saldo" :value="formatMoney(balance)" hint="Setelah penyaluran" icon="i-lucide-hand-coins" />
    </div>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-file-text" class="size-4.5 text-emerald-700" />
            Rekap akhir
          </h2>
          <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-printer" @click="printReport">Cetak Laporan</UButton>
        </div>
      </template>
      <div class="mt-4 flex flex-col gap-2 text-sm max-w-xl">
        <div class="flex justify-between"><span>Total penerimaan beras</span><span class="tnum font-semibold">{{ formatKg(riceIn) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran beras</span><span class="tnum font-semibold">{{ formatKg(riceOut) }}</span></div>
        <div class="flex justify-between"><span>Total penerimaan uang</span><span class="tnum font-semibold">{{ formatMoney(moneyIn) }}</span></div>
        <div class="flex justify-between"><span>Zakat fitrah uang</span><span class="tnum">{{ formatMoney(fitrahMoney) }}</span></div>
        <div class="flex justify-between"><span>Zakat mal</span><span class="tnum">{{ formatMoney(malMoney) }}</span></div>
        <div class="flex justify-between"><span>Infaq</span><span class="tnum">{{ formatMoney(infaqMoney) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran uang</span><span class="tnum font-semibold">{{ formatMoney(moneyOut) }}</span></div>
        <div class="flex justify-between border-t border-slate-200 pt-2"><span class="font-semibold">Sisa saldo uang</span><span class="tnum font-bold">{{ formatMoney(balance) }}</span></div>
        <div class="flex justify-between"><span>Jumlah KK menerima penyaluran</span><span class="tnum font-semibold">{{ layakCount }} KK</span></div>
      </div>
      <p class="text-xs text-slate-500 mt-4">Sisa saldo dipertahankan sebagai cadangan penyaluran susulan dan santunan bulan berikutnya, dicatat di buku dan ditandatangani Kepala TPQ.</p>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-archive" class="size-4.5 text-emerald-700" />
            Arsip periode
          </h2>
          <UButton v-if="isBendahara" size="sm" icon="i-lucide-plus" @click="showCreate = true">Buat Periode Baru</UButton>
        </div>
      </template>
      <p v-if="periodError" class="text-sm text-red-600 mt-3">{{ periodError }}</p>
      <div class="overflow-x-auto mt-3">
        <UTable :data="sortedPeriods" :columns="periodColumns">
          <template #periodName-header>
            <SortButton label="Periode" column="periodName" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #startDate-header>
            <SortButton label="Mulai" column="startDate" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #endDate-header>
            <SortButton label="Selesai" column="endDate" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #status-header>
            <SortButton label="Status" column="status" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #status-cell="{ row }">
            <UBadge :color="row.original.status === 'active' ? 'success' : 'neutral'" variant="soft">{{ row.original.status === 'active' ? 'Aktif' : 'Tutup' }}</UBadge>
          </template>
          <template #actions-cell="{ row }">
            <div class="flex gap-2">
              <UButton color="neutral" variant="soft" size="sm" @click="selectPeriod(row.original.id)">Lihat</UButton>
              <UButton v-if="isBendahara && row.original.status === 'active'" color="neutral" variant="soft" size="sm" @click="closePeriod(row.original.id)">Tutup Periode</UButton>
            </div>
          </template>
        </UTable>
      </div>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold flex items-center gap-2 text-slate-900">
          <UIcon name="i-lucide-history" class="size-4.5 text-emerald-700" />
          Riwayat perubahan
        </h2>
      </template>
      <p class="text-sm text-slate-500">Siapa mengubah apa dan kapan. Menampilkan 20 perubahan terakhir.</p>
      <div class="overflow-x-auto mt-3">
        <UTable :data="auditPage" :columns="auditColumns">
          <template #createdAt-cell="{ row }">
            <span class="tnum whitespace-nowrap">{{ formatDateTime(row.original.createdAt) }}</span>
          </template>
          <template #actorName-cell="{ row }">
            <div>
              <span class="font-medium">{{ row.original.actorName || '-' }}</span>
              <span class="block text-xs text-slate-500">{{ row.original.actorRole || '' }}</span>
            </div>
          </template>
        </UTable>
      </div>
      <p v-if="auditLog.length === 0" class="text-sm text-slate-500 mt-3">Belum ada perubahan tercatat.</p>
    </UCard>

    <UModal v-model:open="showCreate" title="Buat periode baru">
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField label="Nama periode" name="periodName">
            <UInput v-model="newPeriod.periodName" placeholder="Nama periode baru" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Tanggal mulai" name="startDate">
              <UInput v-model="newPeriod.startDate" type="date" class="w-full" />
            </UFormField>
            <UFormField label="Tanggal selesai" name="endDate">
              <UInput v-model="newPeriod.endDate" type="date" class="w-full" />
            </UFormField>
          </div>
          <p v-if="periodError" class="text-sm text-red-600">{{ periodError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="createPeriod">Simpan Periode</UButton>
          <UButton color="neutral" variant="soft" @click="showCreate = false">Batal</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney, formatKg, formatDateTime } from '~/utils/format'
import { useTableSort } from '~/utils/tableSort'

const { receipts, distributions, summary, loadError, loadAll, loadDashboard } = useZakatData()
const { authFetch, isBendahara } = useSession()
const { periods, selectedPeriodId, selectPeriod, loadPeriods } = usePeriod()
const { sortKey, sortDirection, toggleSort, sortRows } = useTableSort()
const sortedPeriods = computed(() => sortRows(periods.value, (row: any, key: string) => row[key]))

const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const periodReceipts = computed(() => receipts.value.filter((row: any) => Number(row.periodId || 1) === selectedPeriodId.value))
const periodDistributions = computed(() => distributions.value.filter((row: any) => Number(row.periodId || 1) === selectedPeriodId.value))
const moneyIn = computed(() => periodReceipts.value.reduce((sum, row) => sum + row.amountMoney, 0))
const moneyOut = computed(() => periodDistributions.value.reduce((sum, row) => sum + row.amountMoney, 0))
const balance = computed(() => moneyIn.value - moneyOut.value)
const riceIn = computed(() => periodReceipts.value.reduce((sum, row) => sum + row.quantityKg, 0))
const riceOut = computed(() => periodDistributions.value.reduce((sum, row) => sum + row.quantityKg, 0))
const moneyByType = (type: string) => periodReceipts.value.filter((row) => row.zakatType === type).reduce((sum, row) => sum + row.amountMoney, 0)
const fitrahMoney = computed(() => moneyByType('Zakat Fitrah'))
const malMoney = computed(() => moneyByType('Zakat Mal'))
const infaqMoney = computed(() => moneyByType('Infaq'))
const layakCount = computed(() => (summary.value['Prioritas 1'] || 0) + (summary.value['Prioritas 2'] || 0) + (summary.value['Prioritas 3'] || 0))
const periodColumns = [
  { accessorKey: 'periodName', header: 'Periode' },
  { accessorKey: 'startDate', header: 'Mulai' },
  { accessorKey: 'endDate', header: 'Selesai' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: 'Aksi' }
]

const showCreate = ref(false)
const periodError = ref('')
const newPeriod = ref({ periodName: '', startDate: '', endDate: '' })
const auditLog = ref<any[]>([])
const auditPage = computed(() => auditLog.value.slice(0, 20))
const auditColumns = [
  { accessorKey: 'createdAt', header: 'Waktu' },
  { accessorKey: 'actorName', header: 'Pengguna' },
  { accessorKey: 'action', header: 'Aksi' },
  { accessorKey: 'target', header: 'Target' },
  { accessorKey: 'detail', header: 'Detail' }
]

async function loadAuditLog() {
  try {
    const res = await authFetch('/audit-log')
    if (!res.ok) return
    const body = await res.json()
    auditLog.value = Array.isArray(body.data) ? body.data : []
  } catch (error) {
    auditLog.value = []
  }
}

async function createPeriod() {
  periodError.value = ''
  if (!newPeriod.value.periodName || !newPeriod.value.startDate || !newPeriod.value.endDate) {
    periodError.value = 'Nama periode, tanggal mulai, dan tanggal selesai wajib diisi.'
    return
  }
  const res = await authFetch('/periods', { method: 'POST', body: JSON.stringify(newPeriod.value) })
  if (!res.ok) {
    periodError.value = 'Gagal membuat periode. Pastikan Anda masuk sebagai Bendahara.'
    return
  }
  await loadPeriods(authFetch)
  showCreate.value = false
  newPeriod.value = { periodName: '', startDate: '', endDate: '' }
}

async function closePeriod(id: number) {
  periodError.value = ''
  const res = await authFetch('/periods/' + id + '/close', { method: 'POST', body: JSON.stringify({}) })
  if (!res.ok) {
    periodError.value = 'Gagal menutup periode. Pastikan Anda masuk sebagai Bendahara.'
    return
  }
  await loadPeriods(authFetch)
}

function printReport() {
  window.print()
}

onMounted(async () => {
  await loadAll(authFetch)
  await loadAuditLog()
})

watch(selectedPeriodId, () => loadDashboard(authFetch))
</script>
