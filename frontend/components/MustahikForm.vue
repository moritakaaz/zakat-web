<template>
  <form class="bg-white border border-line rounded-lg p-4 mt-6 flex flex-col gap-4 max-w-2xl" @submit.prevent="$emit('submit', form)">
    <div class="flex flex-col gap-1">
      <label for="fullName" class="text-sm font-semibold">Nama kepala keluarga</label>
      <InputText id="fullName" v-model="form.fullName" class="w-full" />
    </div>
    <div class="flex flex-col gap-1">
      <label for="nik" class="text-sm font-semibold">NIK kepala keluarga</label>
      <InputText id="nik" v-model="form.nik" class="w-full" placeholder="16 digit angka" maxlength="16" />
      <p class="text-xs text-muted">NIK dipakai untuk cek duplikat pada periode yang sama.</p>
    </div>
    <Message v-if="duplicateWarning" severity="warn" :closable="false">{{ duplicateWarning }}</Message>
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
    <div class="bg-paper border border-line rounded-lg p-3 text-sm flex items-center gap-2">
      <Icon name="lucide:calculator" size="18" />
      <span>Pendapatan per kapita <strong>{{ formatMoney(perCapitaValue) }}</strong> per jiwa, dihitung dari pendapatan dibagi jumlah tanggungan.</span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="flex flex-col gap-1">
        <label for="houseCondition" class="text-sm font-semibold">Kondisi rumah</label>
        <Select id="houseCondition" v-model="form.houseCondition" :options="['Milik Sendiri', 'Kontrak', 'Menumpang']" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label for="documentStatus" class="text-sm font-semibold">Dokumen</label>
        <Select id="documentStatus" v-model="form.documentStatus" :options="['Lengkap', 'KTP saja', 'KK saja', 'Tidak ada']" class="w-full" />
      </div>
    </div>
    <Message v-if="form.documentStatus !== 'Lengkap'" severity="warn" :closable="false">Dokumen belum lengkap. Hasil prioritas akan menjadi Pending Verifikasi sampai dokumen dilengkapi.</Message>
    <div class="flex flex-col gap-1">
      <label for="specialStatus" class="text-sm font-semibold">Status khusus</label>
      <InputText id="specialStatus" v-model="form.specialStatus" placeholder="Contoh: Wali Santri, Janda, Guru Honorer TPQ" class="w-full" />
    </div>
    <div class="flex flex-col gap-1">
      <label for="asnaf" class="text-sm font-semibold">Asnaf</label>
      <Select id="asnaf" v-model="form.asnaf" :options="['Fakir', 'Miskin', 'Fisabilillah', '-']" class="w-full" />
    </div>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <Message v-if="saved" severity="success" :closable="false">Data tersimpan dengan hasil {{ saved }}.</Message>
    <div class="flex gap-2">
      <Button type="submit" :label="submitLabel">
        <template #icon>
          <Icon name="lucide:save" size="16" />
        </template>
      </Button>
      <Button label="Kembali" severity="secondary" @click="navigateTo('/mustahik')" />
    </div>
  </form>
</template>

<script setup lang="ts">
import { formatMoney } from '~/utils/format'

const props = defineProps<{ initial: any, duplicateWarning?: string, error?: string, saved?: string, submitLabel: string }>()
defineEmits(['submit'])

const form = ref({ ...props.initial })
const perCapitaValue = computed(() => {
  if (!form.value.dependents || form.value.dependents <= 0) return form.value.monthlyIncome || 0
  return Math.floor((form.value.monthlyIncome || 0) / form.value.dependents)
})
</script>
