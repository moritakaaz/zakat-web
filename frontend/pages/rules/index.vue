<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Proses Rule</h1>
    <p class="text-sm text-slate-500 mt-1">Mesin Rule-Based dengan Forward Chaining. Aturan diperiksa dari urutan terkecil, dari R10 dan R11 sampai R12.</p>

    <UCard class="shadow-sm ring-slate-200 mt-6">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-semibold flex items-center gap-2 text-slate-900">
              <UIcon name="i-lucide-scale" class="size-4.5 text-emerald-700" />
              Basis pengetahuan
            </h2>
            <p class="text-sm text-slate-500">14 aturan dari PRD bagian 5 dan file data acuan. Ambang dan status aktif dapat diubah oleh Bendahara tanpa mengubah kode.</p>
          </div>
          <UButton v-if="canRunRules" icon="i-lucide-play" @click="run">Jalankan Forward Chaining</UButton>
        </div>
      </template>
      <p v-if="loadError" class="text-sm text-red-600 mt-3">{{ loadError }}</p>
      <p v-if="saveMessage" class="text-sm text-emerald-700 mt-3">{{ saveMessage }}</p>
      <RuleList :rules="sortedRules" show-edit class="mt-4" @edit="openEdit" />
      <p v-if="!canRunRules" class="text-xs text-slate-500 mt-3">Hanya Bendahara yang dapat menjalankan proses dan mengubah aturan.</p>
    </UCard>

    <UModal v-model:open="showEdit" title="Ubah aturan">
      <template #body>
        <div v-if="editing" class="flex flex-col gap-4">
          <p class="font-semibold">{{ editing.code }} - {{ editing.condition }}</p>
          <UFormField label="Kondisi IF" name="condition">
            <UInput v-model="editing.condition" class="w-full" />
          </UFormField>
          <UFormField label="Kesimpulan THEN" name="result">
            <UInput v-model="editing.result" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField label="Urutan" name="order">
              <UInputNumber v-model="editing.order" :min="0" class="w-full" />
            </UFormField>
            <div class="flex items-center gap-2 mt-6">
              <USwitch v-model="editing.isActive" />
              <label class="text-sm">Aturan aktif</label>
            </div>
          </div>
          <UFormField v-for="field in numericFields" :key="field.key" :label="field.label" :name="field.key">
            <UInputNumber v-model="editing[field.key]" class="w-full" />
          </UFormField>
          <p v-if="editError" class="text-sm text-red-600">{{ editError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="saveEdit">Simpan Aturan</UButton>
          <UButton color="neutral" variant="soft" @click="showEdit = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UCard v-if="ran" class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold text-slate-900">Hasil proses untuk {{ periodMustahik.length }} KK</h2>
      </template>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard v-for="(count, label) in runSummary" :key="label" :label="label" :value="String(count)" hint="KK" />
      </div>
      <p v-if="example" class="text-sm text-slate-500 mt-4">Contoh jejak untuk mustahik pertama pada periode ini ada di bawah. Jejak lengkap per KK dapat dibuka dari halaman Data Mustahik.</p>
      <div v-if="example" class="flex flex-wrap gap-2 mt-4">
        <UButton size="xs" :color="exampleFilter === 'Semua' ? 'primary' : 'neutral'" :variant="exampleFilter === 'Semua' ? 'solid' : 'soft'" @click="exampleFilter = 'Semua'">Semua ({{ example.trace.length }})</UButton>
        <UButton size="xs" color="success" :variant="exampleFilter === 'Terpenuhi' ? 'solid' : 'soft'" @click="exampleFilter = 'Terpenuhi'">Terpenuhi ({{ exampleFiredCount }})</UButton>
        <UButton size="xs" color="error" :variant="exampleFilter === 'Tidak terpenuhi' ? 'solid' : 'soft'" @click="exampleFilter = 'Tidak terpenuhi'">Tidak terpenuhi ({{ exampleUnfiredCount }})</UButton>
      </div>
      <ol v-if="example" class="mt-3 flex flex-col gap-2 text-sm">
        <li v-for="step in filteredExampleTrace" :key="step.code" class="flex gap-2 items-center">
          <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
          <UBadge :color="step.fired ? 'success' : 'error'" variant="soft">{{ step.fired ? 'Terpenuhi' : 'Tidak terpenuhi' }}</UBadge>
          <span>{{ step.note }}</span>
        </li>
      </ol>
      <p v-if="example && !filteredExampleTrace.length" class="text-sm text-slate-500 mt-3">Tidak ada aturan pada filter ini.</p>
      <p v-if="example" class="text-sm mt-3 font-semibold">Kesimpulan {{ example.fullName }} adalah {{ example.result }}.</p>
      <p v-else class="text-sm text-slate-500 mt-4">Belum ada mustahik pada periode ini, jadi belum ada contoh jejak.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, useRules, usePeriod } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const { mustahik, periodMustahik, summary, loadError: dataLoadError, loadAll } = useZakatData()
const { authFetch, canRunRules } = useSession()
const { rules, loadRules } = useRules()
const { selectedPeriodId } = usePeriod()
const sortedRules = computed(() => [...rules.value].sort((a: any, b: any) => (a.order - b.order) || String(a.code).localeCompare(String(b.code), 'id')))
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
  const item = periodMustahik.value[0]
  const niks = mustahik.value.map((row: any) => row.nik)
  if (!item) return null
  return evaluateMustahik(item, niks, rules.value.length ? rules.value : undefined)
})
const exampleFilter = ref('Semua')
const filteredExampleTrace = computed(() => {
  if (!example.value) return []
  if (exampleFilter.value === 'Terpenuhi') return example.value.trace.filter((step: any) => step.fired)
  if (exampleFilter.value === 'Tidak terpenuhi') return example.value.trace.filter((step: any) => !step.fired)
  return example.value.trace
})
const exampleFiredCount = computed(() => example.value ? example.value.trace.filter((step: any) => step.fired).length : 0)
const exampleUnfiredCount = computed(() => example.value ? example.value.trace.filter((step: any) => !step.fired).length : 0)

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
  await loadAll(authFetch)
  if (dataLoadError.value) loadError.value = dataLoadError.value
  else if (!rules.value.length) loadError.value = 'Aturan dari server tidak dapat dimuat.'
})
</script>
