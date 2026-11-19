<template>
  <div>
    <h1 class="text-xl font-bold">Laporan</h1>
    <p class="text-sm text-muted mt-1">Laporan penerimaan dan penyaluran periode {{ periodName }}.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" :hint="formatKg(riceIn)" icon="lucide:wheat" />
      <StatCard label="Beras tersalur" :value="formatKg(riceOut)" :hint="'Sisa ' + formatKg(riceIn - riceOut)" icon="lucide:wheat" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Fitrah, mal, dan infaq" icon="lucide:wallet" />
      <StatCard label="Sisa saldo" :value="formatMoney(balance)" hint="Setelah penyaluran" icon="lucide:hand-coins" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold flex items-center gap-2">
          <Icon name="lucide:file-text" size="18" />
          Rekap akhir
        </h2>
        <Button label="Cetak Laporan" severity="secondary" size="small" @click="printReport" />
      </div>
      <div class="mt-4 flex flex-col gap-2 text-sm max-w-xl">
        <div class="flex justify-between"><span>Total penerimaan beras</span><span class="tnum font-semibold">{{ formatKg(riceIn) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran beras</span><span class="tnum font-semibold">{{ formatKg(riceOut) }}</span></div>
        <div class="flex justify-between"><span>Total penerimaan uang</span><span class="tnum font-semibold">{{ formatMoney(moneyIn) }}</span></div>
        <div class="flex justify-between"><span>Zakat fitrah uang</span><span class="tnum">{{ formatMoney(fitrahMoney) }}</span></div>
        <div class="flex justify-between"><span>Zakat mal</span><span class="tnum">{{ formatMoney(malMoney) }}</span></div>
        <div class="flex justify-between"><span>Infaq</span><span class="tnum">{{ formatMoney(infaqMoney) }}</span></div>
        <div class="flex justify-between"><span>Total penyaluran uang</span><span class="tnum font-semibold">{{ formatMoney(moneyOut) }}</span></div>
        <div class="flex justify-between border-t border-line pt-2"><span class="font-semibold">Sisa saldo uang</span><span class="tnum font-bold">{{ formatMoney(balance) }}</span></div>
        <div class="flex justify-between"><span>Jumlah KK menerima penyaluran</span><span class="tnum font-semibold">{{ layakCount }} KK</span></div>
      </div>
      <p class="text-xs text-muted mt-4">Sisa saldo dipertahankan sebagai cadangan penyaluran susulan dan santunan bulan berikutnya, dicatat di buku dan ditandatangani Kepala TPQ.</p>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold flex items-center gap-2">
          <Icon name="lucide:archive" size="18" />
          Arsip periode
        </h2>
        <Button v-if="isBendahara" label="Buat Periode Baru" size="small" @click="showCreate = true" />
      </div>
      <p v-if="periodError" class="text-sm text-red-600 mt-3">{{ periodError }}</p>
      <DataTable :value="periods" size="small" class="mt-3">
        <Column field="periodName" header="Periode" />
        <Column field="startDate" header="Mulai" />
        <Column field="endDate" header="Selesai" />
        <Column field="status" header="Status" />
        <Column header="Aksi">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button severity="secondary" size="small" @click="selectPeriod(slotProps.data.id)">Lihat</Button>
              <Button v-if="isBendahara && slotProps.data.status === 'active'" severity="secondary" size="small" @click="closePeriod(slotProps.data.id)">Tutup Periode</Button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog v-model:visible="showCreate" modal header="Buat periode baru" class="w-full max-w-md">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Nama periode</label>
          <InputText v-model="newPeriod.periodName" placeholder="Contoh: Ramadan 1448 H" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Tanggal mulai</label>
            <InputText v-model="newPeriod.startDate" type="date" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Tanggal selesai</label>
            <InputText v-model="newPeriod.endDate" type="date" class="w-full" />
          </div>
        </div>
        <p v-if="periodError" class="text-sm text-red-600">{{ periodError }}</p>
        <div class="flex gap-2">
          <Button label="Simpan Periode" @click="createPeriod" />
          <Button label="Batal" severity="secondary" @click="showCreate = false" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

const { receipts, distributions, summary } = useZakatData()
const { authFetch, isBendahara } = useSession()
const { periods, selectedPeriodId, selectPeriod, loadPeriods } = usePeriod()

const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const isPeriodOne = computed(() => selectedPeriodId.value === 1)
const periodReceipts = computed(() => isPeriodOne.value ? receipts : [])
const periodDistributions = computed(() => isPeriodOne.value ? distributions : [])
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

const showCreate = ref(false)
const periodError = ref('')
const newPeriod = ref({ periodName: '', startDate: '', endDate: '' })

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

onMounted(() => loadPeriods(authFetch))
</script>
