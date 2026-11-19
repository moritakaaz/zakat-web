<template>
  <div>
    <h1 class="text-xl font-bold">Tambah Mustahik</h1>
    <p class="text-sm text-slate-500 mt-1">Isi data calon penerima. Hasil prioritas dihitung otomatis setelah data disimpan.</p>
    <MustahikForm :initial="initial" :duplicate-warning="duplicateWarning" :error="error" :saved="saved" submit-label="Simpan Mustahik" @submit="submit" />
    <UAlert v-if="loadError" color="error" variant="soft" :title="loadError" icon="i-lucide-circle-x" class="mt-4" />
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod, useRules } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const { mustahik, loadError, loadMustahik } = useZakatData()
const { authFetch } = useSession()
const { selectedPeriodId } = usePeriod()
const { rules, loadRules } = useRules()

const initial = {
  fullName: '',
  address: '',
  occupation: '',
  monthlyIncome: 0,
  dependents: 0,
  schoolChildren: 0,
  houseCondition: 'Milik Sendiri',
  specialStatus: '-',
  asnaf: '-',
  documentStatus: 'Lengkap',
  nik: ''
}
const error = ref('')
const saved = ref('')
const duplicateWarning = ref('')

onMounted(async () => {
  await loadRules(authFetch)
  await loadMustahik(authFetch)
})

async function submit(form: any) {
  error.value = ''
  saved.value = ''
  duplicateWarning.value = ''
  if (!form.fullName || !form.address) {
    error.value = 'Nama kepala keluarga dan alamat wajib diisi.'
    return
  }
  if (!form.nik || String(form.nik).replace(/\D/g, '').length !== 16) {
    error.value = 'NIK wajib diisi 16 digit angka.'
    return
  }
  const cleanNik = String(form.nik).replace(/\D/g, '')
  const duplicate = mustahik.value.some((row: any) => row.nik === cleanNik && Number(row.periodId || 1) === selectedPeriodId.value)
  if (duplicate) {
    duplicateWarning.value = 'NIK ini sudah tercatat pada periode yang sama. Data tidak disimpan.'
    error.value = 'NIK sudah tercatat pada periode yang sama.'
    return
  }
  let res: Response
  try {
    res = await authFetch('/mustahik', { method: 'POST', body: JSON.stringify({ ...form, nik: cleanNik, periodId: selectedPeriodId.value }) })
  } catch (error) {
    error.value = 'Gagal menyimpan data. Periksa apakah backend berjalan lalu coba lagi.'
    return
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    error.value = (body && body.error) || 'Gagal menyimpan data. Pastikan Anda masuk sebagai Bendahara atau Sekretaris.'
    return
  }
  const created = await res.json().catch(() => null)
  const item = created && created.data ? created.data : null
  await loadMustahik(authFetch)
  const savedItem = item || mustahik.value.find((row: any) => row.nik === cleanNik)
  const niks = mustahik.value.map((row: any) => row.nik)
  saved.value = savedItem ? evaluateMustahik(savedItem, niks, rules.value.length ? rules.value : undefined).result : ''
}
</script>
