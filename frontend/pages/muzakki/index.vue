<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Muzakki dan Penerimaan</h1>
    <p class="text-sm text-slate-500 mt-1">Pencatatan penerimaan zakat {{ periodName }} mengikuti buku bendahara. Klik judul kolom untuk mengurutkan.</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" hint="Pada data acuan" icon="i-lucide-wheat" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Fitrah, mal, dan infaq" icon="i-lucide-wallet" />
      <StatCard label="Baris penerimaan" :value="String(receipts.length)" hint="Baris pada data acuan" icon="i-lucide-receipt" />
      <StatCard label="Sisa saldo uang" :value="formatMoney(balance)" hint="Setelah penyaluran" icon="i-lucide-hand-coins" />
    </div>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-users" class="size-4.5 text-emerald-700" />
            Data muzakki
          </h2>
          <UButton v-if="canInput" size="sm" icon="i-lucide-user-plus" @click="openCreate">Tambah Muzakki</UButton>
        </div>
      </template>
      <p v-if="muzakkiError" class="text-sm text-red-600 mt-3">{{ muzakkiError }}</p>
      <div class="overflow-x-auto">
        <UTable :data="muzakkiPage" :columns="muzakkiColumns">
          <template #id-header>
            <SortButton label="Kode" column="id" :sort-key="muzakkiSortKey" :sort-direction="muzakkiSortDirection" @toggle="toggleMuzakkiSort" />
          </template>
          <template #fullName-header>
            <SortButton label="Nama" column="fullName" :sort-key="muzakkiSortKey" :sort-direction="muzakkiSortDirection" @toggle="toggleMuzakkiSort" />
          </template>
          <template #address-header>
            <SortButton label="Alamat" column="address" :sort-key="muzakkiSortKey" :sort-direction="muzakkiSortDirection" @toggle="toggleMuzakkiSort" />
          </template>
          <template #zakatType-header>
            <SortButton label="Jenis Zakat" column="zakatType" :sort-key="muzakkiSortKey" :sort-direction="muzakkiSortDirection" @toggle="toggleMuzakkiSort" />
          </template>
          <template #amount-header>
            <SortButton label="Jumlah" column="amount" :sort-key="muzakkiSortKey" :sort-direction="muzakkiSortDirection" @toggle="toggleMuzakkiSort" />
          </template>
          <template #amount-cell="{ row }">
            <span class="tnum">{{ formatMoney(row.original.amount) }}</span>
          </template>
          <template #actions-cell="{ row }">
            <div v-if="canInput" class="flex gap-1">
              <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-pencil" @click="openEdit(row.original)">Ubah</UButton>
              <UButton v-if="canDelete" color="error" variant="soft" size="sm" icon="i-lucide-trash-2" @click="askDelete(row.original)">Hapus</UButton>
            </div>
          </template>
        </UTable>
      </div>
      <div class="flex justify-center mt-4">
        <UPagination v-model:page="muzakkiPageNo" :total="muzakki.length" :items-per-page="10" />
      </div>
      <UAlert v-if="!muzakki.length" color="info" variant="soft" title="Data muzakki dari server belum dimuat. Pastikan backend berjalan dan Anda sudah masuk." icon="i-lucide-info" class="mt-4" />
    </UCard>

    <UModal v-model:open="showDelete" title="Hapus muzakki" :description="'Hapus ' + (toDelete?.fullName || '') + ' (' + (toDelete?.id || '') + ') dari data periode ini? Tindakan ini tidak dapat dibatalkan.'">
      <template #footer>
        <div class="flex gap-2">
          <UButton color="error" @click="confirmDelete">Hapus</UButton>
          <UButton color="neutral" variant="soft" @click="showDelete = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showForm" :title="editingId ? 'Ubah muzakki' : 'Tambah muzakki'">
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField label="Nama muzakki" name="fullName">
            <UInput v-model="form.fullName" class="w-full" />
          </UFormField>
          <UFormField label="Alamat" name="address">
            <UInput v-model="form.address" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Jenis zakat" name="zakatType">
              <USelect v-model="form.zakatType" :items="['Zakat Fitrah', 'Zakat Mal', 'Infaq']" class="w-full" />
            </UFormField>
            <UFormField label="Jumlah (Rp)" name="amount">
              <UInputNumber v-model="form.amount" :min="0" class="w-full" />
            </UFormField>
          </div>
          <p v-if="muzakkiError" class="text-sm text-red-600">{{ muzakkiError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="saveMuzakki">Simpan Muzakki</UButton>
          <UButton color="neutral" variant="soft" @click="showForm = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold text-slate-900">Penerimaan dari muzakki</h2>
      </template>
      <div class="overflow-x-auto">
        <UTable :data="receiptsPage" :columns="receiptColumns">
          <template #date-header>
            <SortButton label="Tanggal" column="date" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #zakatType-header>
            <SortButton label="Jenis Zakat" column="zakatType" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #name-header>
            <SortButton label="Muzakki" column="name" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #form-header>
            <SortButton label="Bentuk" column="form" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #quantityKg-header>
            <SortButton label="Beras (kg)" column="quantityKg" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #amountMoney-header>
            <SortButton label="Nilai Uang" column="amountMoney" :sort-key="receiptSortKey" :sort-direction="receiptSortDirection" @toggle="toggleReceiptSort" />
          </template>
          <template #quantityKg-cell="{ row }">
            <span class="tnum">{{ row.original.quantityKg || '-' }}</span>
          </template>
          <template #amountMoney-cell="{ row }">
            <span class="tnum">{{ row.original.amountMoney ? formatMoney(row.original.amountMoney) : '-' }}</span>
          </template>
        </UTable>
      </div>
      <div class="flex justify-center mt-4">
        <UPagination v-model:page="receiptsPageNo" :total="receipts.length" :items-per-page="10" />
      </div>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold text-slate-900">Penyaluran kepada mustahik</h2>
      </template>
      <div class="overflow-x-auto">
        <UTable :data="sortedDistributions" :columns="distributionColumns">
          <template #date-header>
            <SortButton label="Tanggal" column="date" :sort-key="distributionSortKey" :sort-direction="distributionSortDirection" @toggle="toggleDistributionSort" />
          </template>
          <template #zakatType-header>
            <SortButton label="Jenis Zakat" column="zakatType" :sort-key="distributionSortKey" :sort-direction="distributionSortDirection" @toggle="toggleDistributionSort" />
          </template>
          <template #name-header>
            <SortButton label="Kelompok Penerima" column="name" :sort-key="distributionSortKey" :sort-direction="distributionSortDirection" @toggle="toggleDistributionSort" />
          </template>
          <template #quantityKg-header>
            <SortButton label="Beras (kg)" column="quantityKg" :sort-key="distributionSortKey" :sort-direction="distributionSortDirection" @toggle="toggleDistributionSort" />
          </template>
          <template #amountMoney-header>
            <SortButton label="Nilai Uang" column="amountMoney" :sort-key="distributionSortKey" :sort-direction="distributionSortDirection" @toggle="toggleDistributionSort" />
          </template>
          <template #quantityKg-cell="{ row }">
            <span class="tnum">{{ row.original.quantityKg || '-' }}</span>
          </template>
          <template #amountMoney-cell="{ row }">
            <span class="tnum">{{ row.original.amountMoney ? formatMoney(row.original.amountMoney) : '-' }}</span>
          </template>
        </UTable>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'
import { useTableSort } from '~/utils/tableSort'

const { receipts, distributions } = useZakatData()
const { authFetch, canInput, canDelete } = useSession()
const { periods, selectedPeriodId } = usePeriod()
const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const moneyIn = computed(() => receipts.reduce((sum, row) => sum + row.amountMoney, 0))
const moneyOut = computed(() => distributions.reduce((sum, row) => sum + row.amountMoney, 0))
const balance = computed(() => moneyIn.value - moneyOut.value)
const riceIn = computed(() => receipts.reduce((sum, row) => sum + row.quantityKg, 0))

const muzakki = ref<any[]>([])
const muzakkiError = ref('')
const showForm = ref(false)
const showDelete = ref(false)
const toDelete = ref<any>(null)
const editingId = ref('')
const form = ref({ fullName: '', address: '', zakatType: 'Infaq', amount: 0 })
const muzakkiPageNo = ref(1)
const receiptsPageNo = ref(1)
const { sortKey: muzakkiSortKey, sortDirection: muzakkiSortDirection, toggleSort: toggleMuzakkiSort, sortRows: sortMuzakkiRows } = useTableSort()
const { sortKey: receiptSortKey, sortDirection: receiptSortDirection, toggleSort: toggleReceiptSort, sortRows: sortReceiptRows } = useTableSort()
const { sortKey: distributionSortKey, sortDirection: distributionSortDirection, toggleSort: toggleDistributionSort, sortRows: sortDistributionRows } = useTableSort()
const plainValue = (row: any, key: string) => row[key]
const muzakkiPage = computed(() => sortMuzakkiRows(muzakki.value, plainValue).slice((muzakkiPageNo.value - 1) * 10, muzakkiPageNo.value * 10))
const receiptsPage = computed(() => sortReceiptRows(receipts, plainValue).slice((receiptsPageNo.value - 1) * 10, receiptsPageNo.value * 10))
const sortedDistributions = computed(() => sortDistributionRows(distributions, plainValue))

watch(muzakkiSortKey, () => { muzakkiPageNo.value = 1 })
watch(receiptSortKey, () => { receiptsPageNo.value = 1 })

const muzakkiColumns = computed(() => {
  const base = [
    { accessorKey: 'id', header: 'Kode' },
    { accessorKey: 'fullName', header: 'Nama' },
    { accessorKey: 'address', header: 'Alamat' },
    { accessorKey: 'zakatType', header: 'Jenis Zakat' },
    { accessorKey: 'amount', header: 'Jumlah' }
  ]
  if (canInput.value) base.push({ id: 'actions', header: 'Aksi' } as any)
  return base
})
const receiptColumns = [
  { accessorKey: 'date', header: 'Tanggal' },
  { accessorKey: 'zakatType', header: 'Jenis Zakat' },
  { accessorKey: 'name', header: 'Muzakki' },
  { accessorKey: 'form', header: 'Bentuk' },
  { accessorKey: 'quantityKg', header: 'Beras (kg)' },
  { accessorKey: 'amountMoney', header: 'Nilai Uang' },
  { accessorKey: 'note', header: 'Keterangan' }
]
const distributionColumns = [
  { accessorKey: 'date', header: 'Tanggal' },
  { accessorKey: 'zakatType', header: 'Jenis Zakat' },
  { accessorKey: 'name', header: 'Kelompok Penerima' },
  { accessorKey: 'quantityKg', header: 'Beras (kg)' },
  { accessorKey: 'amountMoney', header: 'Nilai Uang' }
]

async function loadMuzakki() {
  try {
    const res = await authFetch('/muzakki?periodId=' + selectedPeriodId.value)
    if (!res.ok) return
    const body = await res.json()
    muzakki.value = body.data || []
  } catch (error) {
    // Table stays empty when the API is not reachable.
  }
}

function openCreate() {
  editingId.value = ''
  form.value = { fullName: '', address: '', zakatType: 'Infaq', amount: 0 }
  muzakkiError.value = ''
  showForm.value = true
}

function openEdit(item: any) {
  editingId.value = item.id
  form.value = { fullName: item.fullName, address: item.address, zakatType: item.zakatType, amount: item.amount }
  muzakkiError.value = ''
  showForm.value = true
}

async function saveMuzakki() {
  muzakkiError.value = ''
  if (!form.value.fullName || !form.value.zakatType) {
    muzakkiError.value = 'Nama muzakki dan jenis zakat wajib diisi.'
    return
  }
  const body = JSON.stringify({ ...form.value, periodId: selectedPeriodId.value })
  const res = editingId.value
    ? await authFetch('/muzakki/' + editingId.value, { method: 'PUT', body })
    : await authFetch('/muzakki', { method: 'POST', body })
  if (!res.ok) {
    muzakkiError.value = 'Gagal menyimpan muzakki. Pastikan Anda masuk sebagai Bendahara atau Sekretaris.'
    return
  }
  showForm.value = false
  await loadMuzakki()
}

function askDelete(item: any) {
  toDelete.value = item
  muzakkiError.value = ''
  showDelete.value = true
}

async function confirmDelete() {
  if (!toDelete.value) return
  muzakkiError.value = ''
  const res = await authFetch('/muzakki/' + toDelete.value.id, { method: 'DELETE' })
  if (!res.ok) {
    muzakkiError.value = 'Gagal menghapus muzakki. Hanya Bendahara yang dapat menghapus data.'
    showDelete.value = false
    return
  }
  showDelete.value = false
  toDelete.value = null
  await loadMuzakki()
}

onMounted(loadMuzakki)
</script>
