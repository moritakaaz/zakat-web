<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Proses Rule</h1>
        <p class="text-sm text-slate-500 mt-1">Mesin Rule-Based dengan Forward Chaining. Aturan diperiksa dari urutan terkecil, dari R10 dan R11 sampai R12.</p>
      </div>
      <UButton v-if="canRunRules" icon="i-lucide-play" :loading="running" :disabled="running" @click="run">Jalankan Forward Chaining</UButton>
    </div>

    <UCard v-if="running" class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="font-semibold text-slate-900">Menjalankan Forward Chaining</h2>
          <p class="text-sm text-slate-500">Aturan {{ Math.min(runStep + 1, sortedRules.length) }} dari {{ sortedRules.length }}</p>
        </div>
      </template>
      <UProgress :value="runStep" :max="sortedRules.length" class="mt-1" />
      <p class="text-sm text-slate-500 mt-3">Visualisasi urutan pemeriksaan aturan oleh mesin.</p>
      <ol class="mt-3 flex flex-col gap-2">
        <li v-for="(rule, index) in sortedRules" :key="rule.code" class="flex items-center gap-2 text-sm">
          <UIcon v-if="index < runStep" name="i-lucide-check" class="size-4 text-emerald-600 shrink-0" />
          <UIcon v-else-if="index === runStep" name="i-lucide-loader-circle" class="size-4 text-emerald-600 animate-spin shrink-0" />
          <UIcon v-else name="i-lucide-circle" class="size-4 text-slate-300 shrink-0" />
          <span class="tnum font-semibold w-12 shrink-0">{{ rule.code }}</span>
          <span :class="index === runStep ? 'text-slate-900 font-medium' : 'text-slate-500'">{{ rule.condition }}</span>
        </li>
      </ol>
    </UCard>

    <UCard v-if="ran" class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold text-slate-900">Hasil proses untuk {{ periodMustahik.length }} KK</h2>
      </template>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard v-for="(count, label) in runSummary" :key="label" :label="label" :value="String(count)" hint="KK" :icon="summaryCardMeta(label).icon" :icon-class="summaryCardMeta(label).iconClass" />
      </div>
      <p v-if="example" class="text-sm font-semibold text-slate-900 mt-4">Jejak Forward Chaining untuk satu KK</p>
      <p v-if="example" class="text-sm text-slate-500 mt-1">Proses di atas menilai semua {{ periodMustahik.length }} KK pada periode ini. Pilih satu KK di bawah untuk melihat aturan mana yang terpenuhi untuk KK tersebut. Jejak lengkap tiap KK juga bisa dibuka dari halaman Data Mustahik.</p>
      <USelect v-if="example" v-model="exampleId" :items="exampleOptions" value-key="value" label-key="label" class="w-full sm:w-80 mt-3" />
      <p v-if="example" class="text-sm text-slate-500 mt-4">Terpenuhi berarti kondisi aturan cocok dengan data mustahik ini dan ikut menentukan hasil. Tidak terpenuhi berarti kondisi aturan tidak cocok, jadi aturan itu tidak dipakai.</p>
      <div v-if="example" class="flex flex-wrap gap-2 mt-4">
        <UButton size="xs" :color="exampleFilter === 'Semua' ? 'primary' : 'neutral'" :variant="exampleFilter === 'Semua' ? 'solid' : 'soft'" @click="exampleFilter = 'Semua'">Semua ({{ example.trace.length }})</UButton>
        <UButton size="xs" color="success" :variant="exampleFilter === 'Terpenuhi' ? 'solid' : 'soft'" @click="exampleFilter = 'Terpenuhi'">Terpenuhi ({{ exampleFiredCount }})</UButton>
        <UButton size="xs" color="neutral" :variant="exampleFilter === 'Tidak terpenuhi' ? 'solid' : 'soft'" @click="exampleFilter = 'Tidak terpenuhi'">Tidak terpenuhi ({{ exampleUnfiredCount }})</UButton>
      </div>
      <ol v-if="example" class="mt-3 flex flex-col gap-2 text-sm">
        <li v-for="step in filteredExampleTrace" :key="step.code" class="flex flex-col gap-0.5">
          <div class="flex gap-2 items-center">
            <span class="tnum font-semibold w-12 shrink-0">{{ step.code }}</span>
            <UBadge :color="step.fired === true ? 'success' : 'neutral'" variant="soft">{{ step.fired === true ? 'Terpenuhi' : step.fired === false ? 'Tidak terpenuhi' : 'Info' }}</UBadge>
            <span>{{ ruleText(step.code) || step.note }}</span>
          </div>
          <p v-if="ruleText(step.code)" class="text-slate-500 pl-14">{{ step.note }}</p>
        </li>
      </ol>
      <p v-if="example && !filteredExampleTrace.length" class="text-sm text-slate-500 mt-3">Tidak ada aturan pada filter ini.</p>
      <p v-if="example" class="text-sm mt-3 font-semibold">Kesimpulan untuk {{ example.fullName }} adalah {{ example.result }}.</p>
      <p v-else class="text-sm text-slate-500 mt-4">Belum ada mustahik pada periode ini, jadi belum ada contoh jejak.</p>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div>
          <h2 class="font-semibold flex items-center gap-2 text-slate-900">
            <UIcon name="i-lucide-scale" class="size-4.5 text-emerald-700" />
            Basis pengetahuan
          </h2>
          <p class="text-sm text-slate-500">14 aturan dari PRD bagian 5 dan file data acuan. Ambang dan status aktif dapat diubah oleh Bendahara tanpa mengubah kode.</p>
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
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, useRules, usePeriod } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'
import { summaryCardMeta } from '~/utils/format'

const { mustahik, periodMustahik, summary, loadError: dataLoadError, loadAll } = useZakatData()
const { authFetch, canRunRules } = useSession()
const { rules, loadRules } = useRules()
const { selectedPeriodId } = usePeriod()
const sortedRules = computed(() => [...rules.value].sort((a: any, b: any) => (a.order - b.order) || String(a.code).localeCompare(String(b.code), 'id')))
const ran = ref(false)
const running = ref(false)
const runStep = ref(0)
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

const exampleId = ref('')
const exampleOptions = computed(() => periodMustahik.value.map((row: any) => ({ label: row.id + ' - ' + row.fullName, value: row.id })))
watch(periodMustahik, (list: any[]) => {
  if (!list.length) {
    exampleId.value = ''
    return
  }
  if (!list.some((row: any) => row.id === exampleId.value)) exampleId.value = list[0].id
}, { immediate: true })
const example = computed(() => {
  const item = periodMustahik.value.find((row: any) => row.id === exampleId.value) || periodMustahik.value[0]
  const niks = mustahik.value.map((row: any) => row.nik)
  if (!item) return null
  return evaluateMustahik(item, niks, rules.value.length ? rules.value : undefined)
})
const exampleFilter = ref('Semua')
const filteredExampleTrace = computed(() => {
  if (!example.value) return []
  if (exampleFilter.value === 'Terpenuhi') return example.value.trace.filter((step: any) => step.fired === true)
  if (exampleFilter.value === 'Tidak terpenuhi') return example.value.trace.filter((step: any) => step.fired === false)
  return example.value.trace
})
const exampleFiredCount = computed(() => example.value ? example.value.trace.filter((step: any) => step.fired === true).length : 0)
const exampleUnfiredCount = computed(() => example.value ? example.value.trace.filter((step: any) => step.fired === false).length : 0)

function ruleText(code: string) {
  const rule = rules.value.find((row: any) => row.code === code)
  if (!rule) return ''
  return 'Jika ' + rule.condition + ', maka ' + rule.result + '.'
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
  if (running.value) return
  running.value = true
  ran.value = false
  runStep.value = 0
  const res = await authFetch('/rules/evaluate', { method: 'POST', body: JSON.stringify({ periodId: selectedPeriodId.value }) })
  let nextSummary = summary.value
  if (res.ok) {
    const body = await res.json()
    nextSummary = body.summary
  }
  for (let index = 0; index < sortedRules.value.length; index++) {
    runStep.value = index
    await new Promise((resolve) => setTimeout(resolve, 220))
  }
  runStep.value = sortedRules.value.length
  runSummary.value = nextSummary
  ran.value = true
  running.value = false
}

onMounted(async () => {
  await loadAll(authFetch)
  if (dataLoadError.value) loadError.value = dataLoadError.value
  else if (!rules.value.length) loadError.value = 'Aturan dari server tidak dapat dimuat.'
})
</script>
