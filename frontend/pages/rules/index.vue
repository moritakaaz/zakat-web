<template>
  <div>
    <h1 class="text-xl font-bold">Proses Rule</h1>
    <p class="text-sm text-muted mt-1">Mesin Rule-Based dengan Forward Chaining. Fakta diperiksa dari R10 sampai R08 secara berurutan.</p>

    <div class="bg-white border border-line rounded-lg p-4 mt-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold flex items-center gap-2">
            <Icon name="lucide:scale" size="18" />
            Basis pengetahuan
          </h2>
          <p class="text-sm text-muted">14 aturan dari PRD bagian 5 dan file data acuan. Ambang dan status aktif dapat diubah oleh Bendahara tanpa mengubah kode.</p>
        </div>
        <Button v-if="canRunRules" label="Jalankan Forward Chaining" @click="run" />
      </div>
      <p v-if="loadError" class="text-sm text-red-600 mt-3">{{ loadError }}</p>
      <p v-if="saveMessage" class="text-sm text-green-700 mt-3">{{ saveMessage }}</p>
      <DataTable :value="rules" size="small" class="mt-4">
        <Column field="code" header="Kode" />
        <Column field="condition" header="Kondisi IF" />
        <Column field="result" header="Kesimpulan THEN" />
        <Column field="order" header="Urutan" />
        <Column header="Ambang">
          <template #body="slotProps">
            <span class="tnum text-sm">{{ thresholdText(slotProps.data) }}</span>
          </template>
        </Column>
        <Column header="Aktif">
          <template #body="slotProps">
            <span class="text-sm">{{ slotProps.data.isActive ? 'Ya' : 'Tidak' }}</span>
          </template>
        </Column>
        <Column v-if="canRunRules" header="Aksi">
          <template #body="slotProps">
            <Button severity="secondary" size="small" @click="openEdit(slotProps.data)">
              <template #icon>
                <Icon name="lucide:pencil" size="14" />
              </template>
              Ubah
            </Button>
          </template>
        </Column>
      </DataTable>
      <p v-if="!canRunRules" class="text-xs text-muted mt-3">Hanya Bendahara yang dapat menjalankan proses dan mengubah aturan.</p>
    </div>

    <Dialog v-model:visible="showEdit" modal header="Ubah aturan" class="w-full max-w-xl">
      <div v-if="editing" class="flex flex-col gap-4">
        <p class="font-semibold">{{ editing.code }} - {{ editing.condition }}</p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Kondisi IF</label>
          <InputText v-model="editing.condition" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-semibold">Kesimpulan THEN</label>
          <InputText v-model="editing.result" class="w-full" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-semibold">Urutan</label>
            <InputNumber v-model="editing.order" class="w-full" />
          </div>
          <div class="flex items-center gap-2 mt-6">
            <Checkbox v-model="editing.isActive" :binary="true" input-id="ruleActive" />
            <label for="ruleActive" class="text-sm">Aturan aktif</label>
          </div>
        </div>
        <div v-for="field in numericFields" :key="field.key" class="flex flex-col gap-1">
          <label class="text-sm font-semibold">{{ field.label }}</label>
          <InputNumber v-model="editing[field.key]" class="w-full" />
        </div>
        <p v-if="editError" class="text-sm text-red-600">{{ editError }}</p>
        <div class="flex gap-2">
          <Button label="Simpan Aturan" @click="saveEdit" />
          <Button label="Batal" severity="secondary" @click="showEdit = false" />
        </div>
      </div>
    </Dialog>

    <div v-if="ran" class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Hasil proses untuk {{ periodMustahik.length }} KK</h2>
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <StatCard v-for="(count, label) in runSummary" :key="label" :label="label" :value="String(count)" hint="KK" />
      </div>
      <p class="text-sm text-muted mt-4">Contoh jejak untuk Ahmad Hidayat ada di bawah. Jejak lengkap per KK dapat dibuka dari halaman Data Mustahik.</p>
      <ol class="mt-4 flex flex-col gap-2 text-sm">
        <li v-for="step in example.trace" :key="step.code" class="flex gap-2">
          <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
          <span>{{ step.fired ? 'Menyala' : 'Tidak menyala' }} - {{ step.note }}</span>
        </li>
      </ol>
      <p class="text-sm mt-3 font-semibold">Kesimpulan {{ example.fullName }} adalah {{ example.result }}.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, useRules, usePeriod } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const { mustahik, periodMustahik, summary } = useZakatData()
const { authFetch, canRunRules } = useSession()
const { rules, loadRules } = useRules()
const { selectedPeriodId } = usePeriod()
const ran = ref(false)
const runSummary = ref<Record<string, number>>({})
const loadError = ref('')
const saveMessage = ref('')
const showEdit = ref(false)
const editing = ref<any>(null)
const editError = ref('')

const numericFields = [
  { key: 'incomeMin', label: 'Batas bawah pendapatan (Rp)' },
  { key: 'incomeLimit', label: 'Batas atas pendapatan (Rp)' },
  { key: 'perCapitaLimit', label: 'Batas pendapatan per kapita (Rp)' },
  { key: 'dependentsMin', label: 'Tanggungan minimum (jiwa)' },
  { key: 'honorMin', label: 'Honor minimum (Rp)' },
  { key: 'honorMax', label: 'Honor maksimum (Rp)' },
  { key: 'schoolMin', label: 'Anak sekolah minimum' }
]

const example = computed(() => {
  const item = mustahik.value.find((row: any) => row.id === 'KK08')
  const niks = mustahik.value.map((row: any) => row.nik)
  return evaluateMustahik(item, niks, rules.value.length ? rules.value : undefined)
})

function thresholdText(rule: any): string {
  const parts: string[] = []
  if (typeof rule.incomeMin === 'number') parts.push('Min Rp ' + rule.incomeMin.toLocaleString('id-ID'))
  if (typeof rule.incomeLimit === 'number') parts.push('Maks Rp ' + rule.incomeLimit.toLocaleString('id-ID'))
  if (typeof rule.perCapitaLimit === 'number') parts.push('Per kapita Rp ' + rule.perCapitaLimit.toLocaleString('id-ID'))
  if (typeof rule.dependentsMin === 'number') parts.push('Tanggungan ' + rule.dependentsMin)
  if (typeof rule.honorMin === 'number') parts.push('Honor Rp ' + rule.honorMin.toLocaleString('id-ID'))
  if (typeof rule.honorMax === 'number') parts.push('sampai Rp ' + rule.honorMax.toLocaleString('id-ID'))
  if (typeof rule.schoolMin === 'number') parts.push('Sekolah ' + rule.schoolMin)
  return parts.join(', ') || '-'
}

function openEdit(rule: any) {
  editing.value = { ...rule }
  editError.value = ''
  saveMessage.value = ''
  showEdit.value = true
}

async function saveEdit() {
  if (!editing.value) return
  editError.value = ''
  const body: any = { condition: editing.value.condition, result: editing.value.result, order: editing.value.order, isActive: editing.value.isActive }
  for (const field of numericFields) {
    if (typeof editing.value[field.key] === 'number') body[field.key] = editing.value[field.key]
  }
  const res = await authFetch('/rules/' + editing.value.code, { method: 'PUT', body: JSON.stringify(body) })
  if (!res.ok) {
    editError.value = 'Gagal menyimpan aturan. Pastikan Anda masuk sebagai Bendahara.'
    return
  }
  await loadRules(authFetch)
  saveMessage.value = 'Aturan ' + editing.value.code + ' tersimpan. Jalankan ulang proses untuk melihat hasil baru.'
  showEdit.value = false
}

async function run() {
  ran.value = false
  const res = await authFetch('/rules/evaluate', { method: 'POST', body: JSON.stringify({ periodId: selectedPeriodId.value }) })
  if (res.ok) {
    const body = await res.json()
    runSummary.value = body.summary
  } else {
    runSummary.value = summary.value
  }
  ran.value = true
}

onMounted(async () => {
  await loadRules(authFetch)
  if (!rules.value.length) loadError.value = 'Aturan dari server tidak dapat dimuat, dipakai ambang acuan.'
})
</script>
