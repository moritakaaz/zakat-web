<template>
  <div>
    <h1 class="text-xl font-bold">Ubah Mustahik</h1>
    <p class="text-sm text-muted mt-1">Ubah data calon penerima. Hasil prioritas dihitung ulang setelah data disimpan.</p>
    <p v-if="notFound" class="text-sm text-red-600 mt-4">Data mustahik tidak ditemukan.</p>
    <MustahikForm v-else-if="initial" :initial="initial" :duplicate-warning="duplicateWarning" :error="error" :saved="saved" submit-label="Simpan Perubahan" @submit="submit" />
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod, useRules } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const route = useRoute()
const { mustahik, updateMustahik } = useZakatData()
const { authFetch } = useSession()
const { selectedPeriodId } = usePeriod()
const { rules, loadRules } = useRules()

const item = computed(() => mustahik.value.find((row: any) => row.id === route.params.id))
const notFound = computed(() => !item.value)
const initial = computed(() => item.value ? { ...item.value } : null)
const error = ref('')
const saved = ref('')
const duplicateWarning = ref('')

onMounted(() => loadRules(authFetch))

function submit(form: any) {
  error.value = ''
  saved.value = ''
  duplicateWarning.value = ''
  if (!form.fullName || !form.address) {
    error.value = 'Nama kepala keluarga dan alamat wajib diisi.'
    return
  }
  if (!form.nik || (String(form.nik).replace(/\D/g, '').length !== 16 && !String(form.nik).includes('•'))) {
    error.value = 'NIK wajib diisi 16 digit angka.'
    return
  }
  const digits = String(form.nik).replace(/\D/g, '')
  const cleanNik = digits.length === 16 ? digits : form.nik
  const duplicate = mustahik.value.some((row: any) => row.nik === cleanNik && row.id !== route.params.id && Number(row.periodId || 1) === selectedPeriodId.value)
  if (duplicate) {
    duplicateWarning.value = 'NIK ini sudah tercatat pada periode yang sama. Data tidak disimpan.'
    error.value = 'NIK sudah tercatat pada periode yang sama.'
    return
  }
  updateMustahik(String(route.params.id), { ...form, nik: cleanNik })
  authFetch('/mustahik/' + route.params.id, { method: 'PUT', body: JSON.stringify({ ...form, nik: cleanNik }) }).catch(() => {})
  const updated = mustahik.value.find((row: any) => row.id === route.params.id)
  const niks = mustahik.value.map((row: any) => row.nik)
  saved.value = evaluateMustahik(updated, niks, rules.value.length ? rules.value : undefined).result
}
</script>
