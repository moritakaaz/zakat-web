<template>
  <UCard :class="modal ? 'shadow-none ring-0' : 'shadow-sm ring-slate-200 mt-6 max-w-2xl'">
    <form class="flex flex-col gap-4" @submit.prevent="$emit('submit', form)">
      <UFormField label="Nama kepala keluarga" name="fullName">
        <UInput id="fullName" v-model="form.fullName" class="w-full" />
      </UFormField>
      <UFormField label="NIK kepala keluarga" name="nik" help="NIK dipakai untuk cek duplikat pada periode yang sama.">
        <UInput id="nik" v-model="form.nik" class="w-full" placeholder="16 digit angka" maxlength="16" inputmode="numeric" />
      </UFormField>
      <UAlert v-if="duplicateWarning" color="warning" variant="soft" :title="duplicateWarning" icon="i-lucide-triangle-alert" />
      <UFormField label="Alamat" name="address">
        <UInput id="address" v-model="form.address" class="w-full" />
      </UFormField>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Pekerjaan" name="occupation">
          <USelect id="occupation" v-model="occupationChoice" :items="occupationOptions" class="w-full" />
        </UFormField>
        <UFormField label="Pendapatan per bulan (Rp)" name="monthlyIncome">
          <UInputNumber id="monthlyIncome" v-model="form.monthlyIncome" :min="0" class="w-full" />
        </UFormField>
      </div>
      <UFormField v-if="occupationChoice === 'Lainnya'" label="Sebutkan pekerjaan" name="occupationOther">
        <UInput id="occupationOther" v-model="occupationOther" placeholder="Contoh: Satpam, Tukang Parkir" class="w-full" />
      </UFormField>
      <UAlert v-if="incomeWarning" color="warning" variant="soft" :title="incomeWarning" icon="i-lucide-triangle-alert" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Jumlah tanggungan (jiwa)" name="dependents">
          <UInputNumber id="dependents" v-model="form.dependents" :min="0" class="w-full" />
        </UFormField>
        <UFormField label="Jumlah anak sekolah" name="schoolChildren">
          <UInputNumber id="schoolChildren" v-model="form.schoolChildren" :min="0" class="w-full" />
        </UFormField>
      </div>
      <UAlert v-if="schoolWarning" color="warning" variant="soft" :title="schoolWarning" icon="i-lucide-triangle-alert" />
      <div class="bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3 text-sm flex items-center gap-2">
        <UIcon name="i-lucide-calculator" class="size-4.5 shrink-0 text-emerald-700" />
        <span>Pendapatan per kapita <strong>{{ formatMoney(perCapitaValue) }}</strong> per jiwa, dihitung dari pendapatan dibagi jumlah tanggungan.</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Kondisi rumah" name="houseCondition">
          <USelect id="houseCondition" v-model="form.houseCondition" :items="['Milik Sendiri', 'Kontrak', 'Menumpang']" class="w-full" />
        </UFormField>
        <UFormField label="Dokumen" name="documentStatus">
          <USelect id="documentStatus" v-model="form.documentStatus" :items="['Lengkap', 'KTP saja', 'KK saja', 'Tidak ada']" class="w-full" />
        </UFormField>
      </div>
      <UAlert v-if="form.documentStatus !== 'Lengkap'" color="warning" variant="soft" title="Dokumen belum lengkap. Hasil prioritas akan menjadi Pending Verifikasi sampai dokumen dilengkapi." icon="i-lucide-triangle-alert" />
      <UFormField label="Status khusus" name="specialStatus" help="Pilih semua yang berlaku. Hanya pilihan ini yang dibaca aturan, ketikan bebas tidak dihitung.">
        <UCheckboxGroup v-model="statusChecked" :items="statusOptions" />
      </UFormField>
      <UFormField label="Asnaf" name="asnaf">
        <USelect id="asnaf" v-model="form.asnaf" :items="['Fakir', 'Miskin', 'Fisabilillah', '-']" class="w-full" />
      </UFormField>
      <UFormField label="Survei lapangan" name="surveyed" help="Centang bila rumah mustahik sudah dikunjungi dan datanya sudah diperiksa langsung. Kepala TPQ tidak dapat menyetujui hasil bila masih ada mustahik Prioritas 1 sampai 3 yang belum disurvei.">
        <UCheckbox v-model="form.surveyed" label="Sudah disurvei lapangan" />
      </UFormField>
      <UAlert v-if="asnafWarning" color="warning" variant="soft" title="Asnaf Fisabilillah dipakai untuk guru honorer TPQ, tetapi pekerjaan saat ini bukan guru honorer TPQ. Periksa lagi pekerjaannya." icon="i-lucide-triangle-alert" />
      <UAlert v-if="error" color="error" variant="soft" :title="error" icon="i-lucide-circle-x" />
      <UAlert v-if="saved" color="success" variant="soft" :title="'Data tersimpan dengan hasil ' + saved + '.'" icon="i-lucide-circle-check" />
      <div class="flex flex-wrap gap-2">
        <UButton type="submit" icon="i-lucide-save">{{ submitLabel }}</UButton>
        <UButton v-if="!modal" color="neutral" variant="soft" @click="navigateTo('/mustahik')">Kembali</UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/format'

const props = defineProps<{ initial: any, duplicateWarning?: string, error?: string, saved?: string, submitLabel: string, modal?: boolean }>()
defineEmits(['submit'])

const occupationOptions = ['Tidak Bekerja', 'Guru Honorer TPQ', 'Tukang Cuci', 'Buruh Harian', 'Penjual Gorengan', 'Asisten Rumah Tangga', 'Kuli Bangunan', 'Pedagang Kecil', 'Ojek Pangkalan', 'Penjual Makanan', 'Penjahit Rumahan', 'Sopir Angkot', 'Warung Kecil', 'Pedagang Keliling', 'Ojek Online', 'Buruh Pabrik Harian', 'Karyawan Toko', 'Lainnya']
const statusOptions = ['Janda', 'Lansia', 'Yatim', 'Wali Santri', 'Guru Honorer TPQ']

const form = ref({ ...props.initial })

function parseOccupation(value: string) {
  if (occupationOptions.includes(value)) return { choice: value, other: '' }
  return { choice: value ? 'Lainnya' : 'Tidak Bekerja', other: value || '' }
}

function parseStatus(value: string) {
  return String(value || '').split(',').map((item) => item.trim()).filter((item) => statusOptions.includes(item))
}

const occupationInit = parseOccupation(props.initial.occupation || '')
const occupationChoice = ref(occupationInit.choice)
const occupationOther = ref(occupationInit.other)
const statusChecked = ref<string[]>(parseStatus(props.initial.specialStatus || ''))

watch(() => props.initial, (value) => {
  form.value = { ...value }
  const parsed = parseOccupation(value.occupation || '')
  occupationChoice.value = parsed.choice
  occupationOther.value = parsed.other
  statusChecked.value = parseStatus(value.specialStatus || '')
}, { deep: true })

watch([occupationChoice, occupationOther], () => {
  form.value.occupation = occupationChoice.value === 'Lainnya' ? occupationOther.value : occupationChoice.value
})
watch(statusChecked, (value) => {
  form.value.specialStatus = value.length ? value.join(', ') : '-'
}, { deep: true })

const effectiveOccupation = computed(() => occupationChoice.value === 'Lainnya' ? occupationOther.value : occupationChoice.value)
const incomeWarning = computed(() => {
  if (!form.value.monthlyIncome && effectiveOccupation.value && effectiveOccupation.value !== 'Tidak Bekerja') {
    return 'Pekerjaan ' + effectiveOccupation.value + ' tercatat tetapi pendapatan Rp 0. Periksa lagi penghasilannya.'
  }
  return ''
})
const schoolWarning = computed(() => {
  if ((form.value.schoolChildren || 0) > (form.value.dependents || 0)) {
    return 'Jumlah anak sekolah lebih dari jumlah tanggungan. Periksa lagi datanya.'
  }
  return ''
})
const asnafWarning = computed(() => form.value.asnaf === 'Fisabilillah' && effectiveOccupation.value !== 'Guru Honorer TPQ')
const perCapitaValue = computed(() => {
  if (!form.value.dependents || form.value.dependents <= 0) return form.value.monthlyIncome || 0
  return Math.floor((form.value.monthlyIncome || 0) / form.value.dependents)
})
</script>
