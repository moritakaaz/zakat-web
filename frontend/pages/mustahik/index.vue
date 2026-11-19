<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Data Mustahik</h1>
        <p class="text-sm text-slate-500 mt-1">{{ periodMustahik.length }} KK pada periode {{ periodName }}. Klik judul kolom untuk mengurutkan, klik baris untuk melihat jejak rule.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="soft" icon="i-lucide-file-spreadsheet" @click="downloadCsvFile">Unduh CSV</UButton>
        <UButton v-if="canInput" icon="i-lucide-user-plus" @click="navigateTo('/mustahik/new')">Tambah Mustahik</UButton>
      </div>
    </div>

    <UCard class="shadow-sm ring-slate-200 mt-6">
      <div class="flex flex-col sm:flex-row gap-2 mb-4">
        <UInput v-model="search" placeholder="Cari nama, alamat, atau pekerjaan" icon="i-lucide-search" class="w-full" />
        <USelect v-model="filterResult" :items="filterOptions" placeholder="Semua hasil" class="w-full sm:w-56" />
      </div>

      <div class="overflow-x-auto">
        <UTable :data="pageRows" :columns="columns" :on-select="(row) => openDetail(row.original)" :ui="{ tr: 'cursor-pointer', th: 'px-2', td: 'px-2 py-2.5' }">
          <template #id-header>
            <SortButton label="Kode / NIK" column="id" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #fullName-header>
            <SortButton label="Nama Kepala Keluarga" column="fullName" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #occupation-header>
            <SortButton label="Pekerjaan" column="occupation" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #monthlyIncome-header>
            <SortButton label="Pendapatan" column="monthlyIncome" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #dependents-header>
            <SortButton label="Tanggungan" column="dependents" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #houseCondition-header>
            <SortButton label="Rumah" column="houseCondition" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #result-header>
            <SortButton label="Hasil" column="result" :sort-key="sortKey" :sort-direction="sortDirection" @toggle="toggleSort" />
          </template>
          <template #surveyed-cell="{ row }">
            <UBadge :color="row.original.surveyed ? 'success' : 'warning'" variant="soft" :icon="row.original.surveyed ? 'i-lucide-check' : 'i-lucide-hourglass'">{{ row.original.surveyed ? 'Sudah' : 'Belum' }}</UBadge>
          </template>
          <template #id-cell="{ row }">
            <div>
              <span class="font-medium">{{ row.original.id }}</span>
              <span class="tnum block text-xs text-slate-500">{{ row.original.nik }}</span>
            </div>
          </template>
          <template #monthlyIncome-cell="{ row }">
            <span class="tnum">{{ formatMoney(row.original.monthlyIncome) }}</span>
          </template>
          <template #result-cell="{ row }">
            <PriorityTag :value="row.original.result" />
          </template>
          <template #actions-cell="{ row }">
            <div v-if="canInput" class="flex gap-1" @click.stop>
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-pencil" aria-label="Ubah" title="Ubah" @click="openEdit(row.original)" />
              <UButton v-if="canDelete" color="error" variant="soft" size="sm" icon="i-lucide-trash-2" aria-label="Hapus" title="Hapus" @click="askDelete(row.original)" />
            </div>
          </template>
        </UTable>
      </div>

      <div class="flex justify-center mt-4">
        <UPagination v-model:page="page" :total="filtered.length" :items-per-page="10" />
      </div>
      <UAlert v-if="loadError" color="error" variant="soft" :title="loadError" icon="i-lucide-circle-x" class="mt-4" />
      <UAlert v-if="filtered.length === 0 && !loadError" color="info" variant="soft" title="Tidak ada mustahik yang cocok dengan pencarian." icon="i-lucide-info" class="mt-4" />
      <UAlert v-if="editSaved" color="success" variant="soft" :title="'Data tersimpan dengan hasil ' + editSaved + '.'" icon="i-lucide-circle-check" class="mt-4" />
      <UAlert v-if="deleteError" color="error" variant="soft" :title="deleteError" icon="i-lucide-circle-x" class="mt-4" />
    </UCard>

    <UModal v-model:open="showEdit" title="Ubah mustahik" :ui="{ content: 'max-w-2xl' }">
      <template #body>
        <MustahikForm v-if="editing" :initial="editing" :duplicate-warning="editDuplicateWarning" :error="editError" submit-label="Simpan Perubahan" :modal="true" @submit="submitEdit" />
      </template>
    </UModal>

    <UModal v-model:open="showDelete" title="Hapus mustahik" :description="'Hapus ' + (toDelete?.fullName || '') + ' (' + (toDelete?.id || '') + ') dari data periode ini? Tindakan ini tidak dapat dibatalkan.'">
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" @click="confirmDelete">Hapus</UButton>
          <UButton color="neutral" variant="soft" @click="showDelete = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showDetail" title="Jejak Forward Chaining">
      <template #body>
        <div v-if="selected">
          <p class="font-semibold">{{ selected.fullName }} ({{ selected.id }})</p>
          <p class="text-sm text-slate-500 mt-1">Hasil {{ selected.result }} dengan pendapatan per kapita {{ formatMoney(selected.perCapita) }}.</p>
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
            <div><span class="text-slate-500">NIK</span><p class="tnum font-medium">{{ selected.nik || '-' }}</p></div>
            <div><span class="text-slate-500">Alamat</span><p class="font-medium">{{ selected.address || '-' }}</p></div>
            <div><span class="text-slate-500">Pekerjaan</span><p class="font-medium">{{ selected.occupation || '-' }}</p></div>
            <div><span class="text-slate-500">Pendapatan</span><p class="tnum font-medium">{{ formatMoney(selected.monthlyIncome) }}</p></div>
            <div><span class="text-slate-500">Tanggungan</span><p class="tnum font-medium">{{ selected.dependents }} jiwa</p></div>
            <div><span class="text-slate-500">Anak sekolah</span><p class="tnum font-medium">{{ selected.schoolChildren }} orang</p></div>
            <div><span class="text-slate-500">Kondisi rumah</span><p class="font-medium">{{ selected.houseCondition || '-' }}</p></div>
            <div><span class="text-slate-500">Dokumen</span><p class="font-medium">{{ selected.documentStatus || '-' }}</p></div>
            <div><span class="text-slate-500">Status khusus</span><p class="font-medium">{{ selected.specialStatus || '-' }}</p></div>
            <div><span class="text-slate-500">Asnaf</span><p class="font-medium">{{ selected.asnaf || '-' }}</p></div>
            <div><span class="text-slate-500">Survei</span><p class="font-medium">{{ selected.surveyed ? 'Sudah disurvei' : 'Belum disurvei' }}</p></div>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <UButton size="xs" :color="traceFilter === 'Semua' ? 'primary' : 'neutral'" :variant="traceFilter === 'Semua' ? 'solid' : 'soft'" @click="traceFilter = 'Semua'">Semua ({{ selected.trace.length }})</UButton>
            <UButton size="xs" color="success" :variant="traceFilter === 'Terpenuhi' ? 'solid' : 'soft'" @click="traceFilter = 'Terpenuhi'">Terpenuhi ({{ firedCount }})</UButton>
            <UButton size="xs" color="error" :variant="traceFilter === 'Tidak terpenuhi' ? 'solid' : 'soft'" @click="traceFilter = 'Tidak terpenuhi'">Tidak terpenuhi ({{ unfiredCount }})</UButton>
          </div>
          <ol class="mt-3 flex flex-col gap-2 text-sm">
            <li v-for="step in filteredTrace" :key="step.code" class="flex gap-2 items-center">
              <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
              <UBadge :color="step.fired === true ? 'success' : step.fired === false ? 'error' : 'neutral'" variant="soft">{{ step.fired === true ? 'Terpenuhi' : step.fired === false ? 'Tidak terpenuhi' : 'Info' }}</UBadge>
              <span>{{ step.note }}</span>
            </li>
          </ol>
          <p v-if="!filteredTrace.length" class="text-sm text-slate-500 mt-3">Tidak ada aturan pada filter ini.</p>
          <p class="text-sm mt-4">Aturan yang terpenuhi {{ selected.firedRules.join(', ') || 'tidak ada' }}.</p>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod, useRules } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'
import { formatMoney } from '~/utils/format'
import { downloadCsv, fileNameSlug } from '~/utils/csv'
import { useTableSort, resultRank } from '~/utils/tableSort'

const { mustahik, periodMustahik, evaluations, loadError, loadMustahik } = useZakatData()
const { canInput, canDelete, authFetch } = useSession()
const { periods, selectedPeriodId, loadPeriods } = usePeriod()
const { rules, loadRules } = useRules()
const route = useRoute()
const search = ref('')
const filterResult = ref('Semua hasil')
const filterOptions = ['Semua hasil', 'Prioritas 1', 'Prioritas 2', 'Prioritas 3', 'Pending Verifikasi', 'Tidak Layak']
const page = ref(1)
const { sortKey, sortDirection, toggleSort, sortRows } = useTableSort()
const sortValue = (row: any, key: string) => key === 'result' ? (resultRank[row.result] ?? 99) : row[key]
const showDetail = ref(false)
const selected = ref<any>(null)
const traceFilter = ref('Semua')
const filteredTrace = computed(() => {
  if (!selected.value) return []
  if (traceFilter.value === 'Terpenuhi') return selected.value.trace.filter((step: any) => step.fired === true)
  if (traceFilter.value === 'Tidak terpenuhi') return selected.value.trace.filter((step: any) => step.fired === false)
  return selected.value.trace
})
const firedCount = computed(() => selected.value ? selected.value.trace.filter((step: any) => step.fired === true).length : 0)
const unfiredCount = computed(() => selected.value ? selected.value.trace.filter((step: any) => step.fired === false).length : 0)
const showDelete = ref(false)
const toDelete = ref<any>(null)
const deleteError = ref('')
const showEdit = ref(false)
const editing = ref<any>(null)
const editError = ref('')
const editDuplicateWarning = ref('')
const editSaved = ref('')

const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const columns = computed(() => {
  const base = [
    { accessorKey: 'id', header: 'Kode / NIK' },
    { accessorKey: 'fullName', header: 'Nama Kepala Keluarga' },
    { accessorKey: 'occupation', header: 'Pekerjaan' },
    { accessorKey: 'monthlyIncome', header: 'Pendapatan' },
    { accessorKey: 'dependents', header: 'Tanggungan' },
    { accessorKey: 'houseCondition', header: 'Rumah' },
    { accessorKey: 'surveyed', header: 'Survei' },
    { accessorKey: 'result', header: 'Hasil' }
  ]
  if (canInput.value) base.push({ id: 'actions', header: 'Aksi' } as any)
  return base
})

const rows = computed(() => {
  const byId = new Map(evaluations.value.map((item) => [item.id, item]))
  return periodMustahik.value.map((item) => ({ ...item, result: byId.get(item.id)?.result || '-', perCapita: byId.get(item.id)?.perCapita || 0 }))
})

const filtered = computed(() => {
  const query = search.value.trim().toLowerCase()
  return rows.value.filter((item) => {
    if (filterResult.value && filterResult.value !== 'Semua hasil' && item.result !== filterResult.value) return false
    if (!query) return true
    return [item.fullName, item.nik, item.address, item.occupation].join(' ').toLowerCase().includes(query)
  })
})
const sorted = computed(() => sortRows(filtered.value, sortValue))
const pageRows = computed(() => sorted.value.slice((page.value - 1) * 10, page.value * 10))

watch([search, filterResult, sortKey], () => { page.value = 1 })

function openDetail(item: any) {
  const niks = mustahik.value.map((row) => row.nik)
  selected.value = { ...item, ...evaluateMustahik(item, niks, rules.value.length ? rules.value : undefined) }
  traceFilter.value = 'Semua'
  showDetail.value = true
}

function openEdit(item: any) {
  editing.value = { ...item }
  delete editing.value.result
  delete editing.value.perCapita
  editError.value = ''
  editDuplicateWarning.value = ''
  editSaved.value = ''
  showEdit.value = true
}

async function submitEdit(form: any) {
  if (!editing.value) return
  editError.value = ''
  editDuplicateWarning.value = ''
  editSaved.value = ''
  if (!form.fullName || !form.address) {
    editError.value = 'Nama kepala keluarga dan alamat wajib diisi.'
    return
  }
  if (!form.nik || String(form.nik).replace(/\D/g, '').length !== 16) {
    editError.value = 'NIK wajib diisi 16 digit angka.'
    return
  }
  const cleanNik = String(form.nik).replace(/\D/g, '')
  const duplicate = mustahik.value.some((row: any) => String(row.nik).replace(/\D/g, '') === cleanNik && row.id !== editing.value.id && Number(row.periodId || 1) === selectedPeriodId.value)
  if (duplicate) {
    editDuplicateWarning.value = 'NIK ini sudah tercatat pada periode yang sama. Data tidak disimpan.'
    editError.value = 'NIK sudah tercatat pada periode yang sama.'
    return
  }
  let res: Response
  try {
    res = await authFetch('/mustahik/' + editing.value.id, { method: 'PUT', body: JSON.stringify({ ...form, nik: cleanNik }) })
  } catch (error) {
    editError.value = 'Gagal menyimpan data. Periksa apakah backend berjalan lalu coba lagi.'
    return
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    editError.value = (body && body.error) || 'Gagal menyimpan data. Pastikan Anda masuk sebagai Bendahara atau Sekretaris.'
    return
  }
  const editedId = editing.value.id
  await loadMustahik(authFetch)
  const updated = mustahik.value.find((row: any) => row.id === editedId)
  const niks = mustahik.value.map((row: any) => row.nik)
  const result = updated ? evaluateMustahik(updated, niks, rules.value.length ? rules.value : undefined).result : ''
  editSaved.value = result
  showEdit.value = false
  editing.value = null
}

function askDelete(item: any) {
  toDelete.value = item
  deleteError.value = ''
  showDelete.value = true
}

function downloadCsvFile() {
  const headers = ['Kode', 'Nama Kepala Keluarga', 'NIK', 'Alamat', 'Pekerjaan', 'Pendapatan', 'Tanggungan', 'Anak Sekolah', 'Rumah', 'Dokumen', 'Status Khusus', 'Asnaf', 'Survei', 'Per Kapita', 'Hasil']
  const rows = filtered.value.map((item: any) => [item.id, item.fullName, item.nik, item.address, item.occupation, item.monthlyIncome, item.dependents, item.schoolChildren, item.houseCondition, item.documentStatus, item.specialStatus, item.asnaf, item.surveyed ? 'Sudah disurvei' : 'Belum disurvei', item.perCapita, item.result])
  downloadCsv('data-mustahik-' + fileNameSlug(periodName.value) + '.csv', headers, rows)
}

async function confirmDelete() {
  if (!toDelete.value) return
  const res = await authFetch('/mustahik/' + toDelete.value.id, { method: 'DELETE' })
  if (!res.ok) {
    deleteError.value = 'Gagal menghapus data. Pastikan Anda masuk sebagai Bendahara.'
    showDelete.value = false
    return
  }
  await loadMustahik(authFetch)
  showDelete.value = false
  toDelete.value = null
}

onMounted(async () => {
  await loadRules(authFetch)
  await loadMustahik(authFetch)
  await loadPeriods(authFetch)
  const editId = route.query.edit
  if (typeof editId === 'string' && canInput.value) {
    const item = mustahik.value.find((row: any) => row.id === editId)
    if (item) openEdit(item)
  }
})
</script>
