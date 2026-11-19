<template>
  <UCard :class="modal ? 'shadow-none ring-0' : 'shadow-sm ring-slate-200 mt-6 max-w-2xl'">
    <form class="flex flex-col gap-4" @submit.prevent="$emit('submit', form)">
      <UFormField label="Nama kepala keluarga" name="fullName">
        <UInput id="fullName" v-model="form.fullName" class="w-full" />
      </UFormField>
      <UFormField label="NIK kepala keluarga" name="nik" help="NIK dipakai untuk cek duplikat pada periode yang sama.">
        <UInput id="nik" v-model="form.nik" class="w-full" placeholder="16 digit angka" maxlength="16" />
      </UFormField>
      <UAlert v-if="duplicateWarning" color="warning" variant="soft" :title="duplicateWarning" icon="i-lucide-triangle-alert" />
      <UFormField label="Alamat" name="address">
        <UInput id="address" v-model="form.address" class="w-full" />
      </UFormField>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Pekerjaan" name="occupation">
          <UInput id="occupation" v-model="form.occupation" class="w-full" />
        </UFormField>
        <UFormField label="Pendapatan per bulan (Rp)" name="monthlyIncome">
          <UInputNumber id="monthlyIncome" v-model="form.monthlyIncome" :min="0" class="w-full" />
        </UFormField>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UFormField label="Jumlah tanggungan (jiwa)" name="dependents">
          <UInputNumber id="dependents" v-model="form.dependents" :min="0" class="w-full" />
        </UFormField>
        <UFormField label="Jumlah anak sekolah" name="schoolChildren">
          <UInputNumber id="schoolChildren" v-model="form.schoolChildren" :min="0" class="w-full" />
        </UFormField>
      </div>
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
      <UFormField label="Status khusus" name="specialStatus">
        <UInput id="specialStatus" v-model="form.specialStatus" placeholder="Contoh: Wali Santri, Janda, Guru Honorer TPQ" class="w-full" />
      </UFormField>
      <UFormField label="Asnaf" name="asnaf">
        <USelect id="asnaf" v-model="form.asnaf" :items="['Fakir', 'Miskin', 'Fisabilillah', '-']" class="w-full" />
      </UFormField>
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

const form = ref({ ...props.initial })

watch(() => props.initial, (value) => {
  form.value = { ...value }
}, { deep: true })
const perCapitaValue = computed(() => {
  if (!form.value.dependents || form.value.dependents <= 0) return form.value.monthlyIncome || 0
  return Math.floor((form.value.monthlyIncome || 0) / form.value.dependents)
})
</script>
