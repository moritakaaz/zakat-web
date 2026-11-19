<template>
  <div>
    <h1 class="text-xl font-bold">Muzakki dan Penerimaan</h1>
    <p class="text-sm text-muted mt-1">Pencatatan penerimaan zakat {{ periodName }} mengikuti buku bendahara.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" hint="Pada data acuan" icon="lucide:wheat" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Fitrah, mal, dan infaq" icon="lucide:wallet" />
      <StatCard label="Baris penerimaan" :value="String(receipts.length)" hint="Baris pada data acuan" icon="lucide:receipt" />
      <StatCard label="Sisa saldo uang" :value="formatMoney(balance)" hint="Setelah penyaluran" icon="lucide:hand-coins" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold flex items-center gap-2">
          <Icon name="lucide:users" size="18" />
          Data muzakki
        </h2>
        <Button v-if="canInput" label="Tambah Muzakki" size="small" @click="openCreate" />
      </div>
      <p v-if="muzakkiError" class="text-sm text-red-600 mt-3">{{ muzakkiError }}</p>
      <DataTable :value="muzakki" paginator :rows="10" size="small" class="mt-3">
        <Column field="id" header="Kode" />
        <Column field="fullName" header="Nama" sortable />
        <Column field="address" header="Alamat" />
        <Column field="zakatType" header="Jenis Zakat" />
        <Column field="amount" header="Jumlah">
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.amount) }}</span>
          </template>
        </Column>
        <Column v-if="canInput" header="Aksi">
          <template #body="slotProps">
            <div class="flex gap-1">
              <Button severity="secondary" size="small" @click="openEdit(slotProps.data)">
                <template #icon>
                  <Icon name="lucide:pencil" size="14" />
                </template>
                Ubah
              </Button>
              <Button v-if="canDelete" severity="danger" size="small" @click="removeMuzakki(slotProps.data.id)">
                <template #icon>
                  <Icon name="lucide:trash-2" size="14" />
                </template>
                Hapus
              </Button>
            </div>
          </template>
        </Column>
      </DataTable>
      <Message v-if="!muzakki.length" severity="info" class="mt-4">Data muzakki dari server belum dimuat. Pastikan backend berjalan dan Anda sudah masuk.</Message>
    </div>

    <Dialog v-model:visible="showForm" modal :header="editingId ? 'Ubah muzakki' : 'Tambah muzakki'" class="w-full max-w-md">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Nama muzakki</label>
          <InputText v-model="form.fullName" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Alamat</label>
          <InputText v-model="form.address" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Jenis zakat</label>
            <Select v-model="form.zakatType" :options="['Zakat Fitrah', 'Zakat Mal', 'Infaq']" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Jumlah (Rp)</label>
            <InputNumber v-model="form.amount" class="w-full" />
          </div>
        </div>
        <p v-if="muzakkiError" class="text-sm text-red-600">{{ muzakkiError }}</p>
        <div class="flex gap-2">
          <Button label="Simpan Muzakki" @click="saveMuzakki" />
          <Button label="Batal" severity="secondary" @click="showForm = false" />
        </div>
      </div>
    </Dialog>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Penerimaan dari muzakki</h2>
      <DataTable :value="receipts" paginator :rows="10" size="small" class="mt-3">
        <Column field="date" header="Tanggal" />
        <Column field="zakatType" header="Jenis Zakat" />
        <Column field="name" header="Muzakki" />
        <Column field="form" header="Bentuk" />
        <Column field="quantityKg" header="Beras (kg)">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.quantityKg || '-' }}</span>
          </template>
        </Column>
        <Column field="amountMoney" header="Nilai Uang">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.amountMoney ? formatMoney(slotProps.data.amountMoney) : '-' }}</span>
          </template>
        </Column>
        <Column field="note" header="Keterangan" />
      </DataTable>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Penyaluran kepada mustahik</h2>
      <DataTable :value="distributions" size="small" class="mt-3">
        <Column field="date" header="Tanggal" />
        <Column field="zakatType" header="Jenis Zakat" />
        <Column field="name" header="Kelompok Penerima" />
        <Column field="quantityKg" header="Beras (kg)">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.quantityKg || '-' }}</span>
          </template>
        </Column>
        <Column field="amountMoney" header="Nilai Uang">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.amountMoney ? formatMoney(slotProps.data.amountMoney) : '-' }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

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
const editingId = ref('')
const form = ref({ fullName: '', address: '', zakatType: 'Infaq', amount: 0 })

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

async function removeMuzakki(id: string) {
  muzakkiError.value = ''
  const res = await authFetch('/muzakki/' + id, { method: 'DELETE' })
  if (!res.ok) {
    muzakkiError.value = 'Gagal menghapus muzakki. Hanya Bendahara yang dapat menghapus data.'
    return
  }
  await loadMuzakki()
}

onMounted(loadMuzakki)
</script>
