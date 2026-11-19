<template>
  <div>
    <h1 class="text-xl font-bold">Tambah Mustahik</h1>
    <p class="text-sm text-muted mt-1">Isi data calon penerima. Hasil prioritas dihitung otomatis setelah data disimpan.</p>

    <form class="bg-white border border-line rounded-lg p-4 mt-6 flex flex-col gap-4 max-w-2xl" @submit.prevent="submit">
      <div class="flex flex-col gap-1">
        <label for="fullName" class="text-sm font-semibold">Nama kepala keluarga</label>
        <InputText id="fullName" v-model="form.fullName" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="address" class="text-sm font-semibold">Alamat</label>
        <InputText id="address" v-model="form.address" class="w-full" />
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label for="occupation" class="text-sm font-semibold">Pekerjaan</label>
          <InputText id="occupation" v-model="form.occupation" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="monthlyIncome" class="text-sm font-semibold">Pendapatan per bulan (Rp)</label>
          <InputNumber id="monthlyIncome" v-model="form.monthlyIncome" class="w-full" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label for="dependents" class="text-sm font-semibold">Jumlah tanggungan (jiwa)</label>
          <InputNumber id="dependents" v-model="form.dependents" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="schoolChildren" class="text-sm font-semibold">Jumlah anak sekolah</label>
          <InputNumber id="schoolChildren" v-model="form.schoolChildren" class="w-full" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label for="houseCondition" class="text-sm font-semibold">Kondisi rumah</label>
          <Select id="houseCondition" v-model="form.houseCondition" :options="['Milik Sendiri', 'Kontrak', 'Menumpang']" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="documentStatus" class="text-sm font-semibold">Dokumen</label>
          <Select id="documentStatus" v-model="form.documentStatus" :options="['Lengkap', 'KTP saja']" class="w-full" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label for="specialStatus" class="text-sm font-semibold">Status khusus</label>
        <InputText id="specialStatus" v-model="form.specialStatus" placeholder="Contoh: Wali Santri, Janda, Guru Honorer TPQ" class="w-full" />
      </div>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-if="saved" severity="success" :closable="false">Data tersimpan dengan hasil {{ saved }}.</Message>
      <div class="flex gap-2">
        <Button type="submit" label="Simpan Mustahik" />
        <Button label="Kembali" severity="secondary" @click="navigateTo('/mustahik')" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { evaluateMustahik } from '~/utils/ruleEngine'

const { mustahik, addMustahik } = useZakatData()
const form = ref({
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
})
const error = ref('')
const saved = ref('')

function submit() {
  error.value = ''
  saved.value = ''
  if (!form.value.fullName || !form.value.address) {
    error.value = 'Nama kepala keluarga dan alamat wajib diisi.'
    return
  }
  const id = addMustahik({ ...form.value, nik: '3172••••••' + String(mustahik.value.length + 1).padStart(4, '0') })
  const item = mustahik.value.find((row) => row.id === id)
  const niks = mustahik.value.map((row) => row.nik)
  saved.value = evaluateMustahik(item, niks).result
}
</script>
