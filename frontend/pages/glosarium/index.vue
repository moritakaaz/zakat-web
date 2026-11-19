<template>
  <div class="flex flex-col gap-4">
    <UCard class="shadow-sm ring-slate-200">
      <h1 class="text-lg font-bold text-slate-900">Glosarium dan Aturan</h1>
      <p class="text-sm text-slate-500 mt-1">Istilah, arti status hasil, tugas tiap peran, dan seluruh aturan rule. Aturan dibaca langsung dari server, jadi kalau Bendahara mengubah ambang di halaman Proses Rule, halaman ini ikut berubah.</p>
      <UInput v-model="search" placeholder="Cari istilah atau aturan, misalnya R01a atau Fisabilillah" icon="i-lucide-search" class="w-full max-w-md mt-4" />
    </UCard>

    <UCard class="shadow-sm ring-slate-200">
      <template #header>
        <h2 class="font-semibold text-slate-900">Istilah</h2>
      </template>
      <dl class="flex flex-col gap-3 text-sm">
        <div v-for="term in filteredTerms" :key="term.name" class="flex flex-col sm:flex-row gap-1 sm:gap-3">
          <dt class="font-semibold text-slate-900 sm:w-48 shrink-0">{{ term.name }}</dt>
          <dd class="text-slate-600">{{ term.meaning }}</dd>
        </div>
      </dl>
      <p v-if="!filteredTerms.length" class="text-sm text-slate-500">Tidak ada istilah yang cocok.</p>
    </UCard>

    <UCard class="shadow-sm ring-slate-200">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-slate-900">Aturan Rule</h2>
          <UButton v-if="canRunRules" to="/rules" size="sm" variant="soft" icon="i-lucide-scale">Ubah di Proses Rule</UButton>
        </div>
      </template>
      <p class="text-sm text-slate-500">Aturan diperiksa berurutan dari urutan terkecil. R10 dan R11 diperiksa paling dulu, lalu R09, lalu kelompok pendapatan R01a sampai R01c, lalu aturan penegas R02 sampai R08, dan R12 mengatur urutan penyaluran bila dana kurang.</p>
      <div class="flex flex-col gap-2 mt-4 text-sm">
        <div class="hidden sm:flex gap-3 text-xs font-semibold text-slate-500 pb-1 border-b border-slate-200">
          <span class="w-14 shrink-0">Kode</span>
          <span class="flex-1">Kondisi IF</span>
          <span class="flex-1">Kesimpulan THEN</span>
          <span class="w-14 shrink-0 text-right">Urutan</span>
          <span class="w-20 shrink-0 text-right">Aktif</span>
        </div>
        <div v-for="rule in filteredRules" :key="rule.code" class="flex flex-col sm:flex-row gap-1 sm:gap-3 sm:items-center py-2 border-b border-slate-100 last:border-0">
          <span class="font-semibold text-slate-900 w-14 shrink-0">{{ rule.code }}</span>
          <span class="flex-1 text-slate-600">{{ rule.condition }}</span>
          <span class="flex-1 text-slate-900">{{ rule.result }}</span>
          <span class="w-14 shrink-0 sm:text-right text-slate-500">{{ rule.order }}</span>
          <span class="w-20 shrink-0 sm:text-right">
            <UBadge :color="rule.isActive ? 'success' : 'neutral'" variant="soft">{{ rule.isActive ? 'Ya' : 'Tidak' }}</UBadge>
          </span>
        </div>
      </div>
      <p v-if="!filteredRules.length" class="text-sm text-slate-500 mt-3">Tidak ada aturan yang cocok.</p>
      <p v-if="loadError" class="text-sm text-red-600 mt-3">{{ loadError }}</p>
    </UCard>

    <UCard class="shadow-sm ring-slate-200">
      <template #header>
        <h2 class="font-semibold text-slate-900">Status Hasil</h2>
      </template>
      <dl class="flex flex-col gap-3 text-sm">
        <div v-for="status in statuses" :key="status.name" class="flex flex-col sm:flex-row gap-1 sm:gap-3">
          <dt class="font-semibold text-slate-900 sm:w-48 shrink-0">{{ status.name }}</dt>
          <dd class="text-slate-600">{{ status.meaning }}</dd>
        </div>
      </dl>
    </UCard>

    <UCard class="shadow-sm ring-slate-200">
      <template #header>
        <h2 class="font-semibold text-slate-900">Tugas Tiap Peran</h2>
      </template>
      <div class="grid gap-3 sm:grid-cols-3 text-sm">
        <div v-for="role in roles" :key="role.name" class="rounded-lg border border-slate-200 p-3">
          <p class="font-semibold text-slate-900">{{ role.name }}</p>
          <p class="text-slate-600 mt-1">{{ role.duty }}</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useSession, useRules } from '~/composables/useZakat'

const { authFetch, canRunRules } = useSession()
const { rules, loadRules } = useRules()
const search = ref('')
const loadError = ref('')

const terms = [
  { name: 'Mustahik', meaning: 'Penerima zakat. Satu baris data mewakili satu kepala keluarga.' },
  { name: 'Muzakki', meaning: 'Pemberi zakat. Data induk pemberi, bukan bukti penerimaan.' },
  { name: 'Zakat Fitrah', meaning: 'Zakat jiwa yang dibayar menjelang Idulfitri, dicatat dalam bentuk beras atau uang.' },
  { name: 'Zakat Mal', meaning: 'Zakat harta yang dihitung dari harta yang memenuhi nisab dan haul.' },
  { name: 'Infaq', meaning: 'Pemberian sukarela di luar zakat wajib.' },
  { name: 'Asnaf', meaning: 'Golongan yang berhak menerima zakat. Aplikasi ini memakai Fakir, Miskin, dan Fisabilillah.' },
  { name: 'Fakir', meaning: 'Orang yang hampir tidak mempunyai penghasilan untuk kebutuhan pokok.' },
  { name: 'Miskin', meaning: 'Orang yang mempunyai penghasilan tetapi tidak mencukupi kebutuhan pokok.' },
  { name: 'Fisabilillah', meaning: 'Orang yang berjuang di jalan Allah. Di TPQ ini dipakai untuk guru honorer TPQ.' },
  { name: 'Pendapatan per kapita', meaning: 'Pendapatan bulanan kepala keluarga dibagi jumlah tanggungan dalam satu kartu keluarga.' },
  { name: 'Tanggungan', meaning: 'Jumlah jiwa dalam satu kartu keluarga.' },
  { name: 'Periode', meaning: 'Masa pencatatan zakat, misalnya Ramadan 1446 H. Setiap periode punya datanya sendiri.' },
  { name: 'Persetujuan Kepala TPQ', meaning: 'Persetujuan hasil prioritas oleh Kepala TPQ. Penyaluran terkunci sampai periode disetujui.' },
  { name: 'Forward Chaining', meaning: 'Cara mesin rule bekerja. Fakta diperiksa satu per satu dari aturan pertama sampai kesimpulan didapat.' },
  { name: 'Terpenuhi', meaning: 'Kondisi sebuah aturan cocok dengan data mustahik itu.' },
  { name: 'Tidak terpenuhi', meaning: 'Kondisi sebuah aturan tidak cocok dengan data mustahik itu.' }
]

const statuses = [
  { name: 'Prioritas 1', meaning: 'Kelompok pertama yang menerima bila dana kurang.' },
  { name: 'Prioritas 2', meaning: 'Kelompok kedua setelah Prioritas 1.' },
  { name: 'Prioritas 3', meaning: 'Kelompok ketiga setelah Prioritas 1 dan 2.' },
  { name: 'Pending Verifikasi', meaning: 'Mustahik belum bisa diputuskan karena dokumen belum lengkap.' },
  { name: 'Duplikat', meaning: 'NIK atau nomor KK yang sama sudah tercatat pada periode yang sama.' },
  { name: 'Tidak Layak', meaning: 'Mustahik tidak memenuhi syarat penerima pada periode ini.' }
]

const roles = [
  { name: 'Bendahara', duty: 'Mengelola semua data, menjalankan proses rule, mencatat penerimaan dan penyaluran, serta membuat dan menutup periode.' },
  { name: 'Sekretaris', duty: 'Menginput data mustahik, muzakki, dan penerimaan. Tidak menjalankan proses rule, tidak menghapus, dan tidak menyetujui.' },
  { name: 'Kepala TPQ', duty: 'Melihat dashboard, hasil prioritas, dan laporan, lalu menyetujui atau menolak hasil prioritas.' }
]

const sortedRules = computed(() => [...rules.value].sort((a: any, b: any) => (a.order - b.order) || String(a.code).localeCompare(String(b.code), 'id')))

const filteredTerms = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return terms
  return terms.filter((term) => (term.name + ' ' + term.meaning).toLowerCase().includes(query))
})

const filteredRules = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return sortedRules.value
  return sortedRules.value.filter((rule: any) => (rule.code + ' ' + rule.condition + ' ' + rule.result).toLowerCase().includes(query))
})

onMounted(async () => {
  await loadRules(authFetch)
  if (!rules.value.length) loadError.value = 'Aturan dari server tidak dapat dimuat.'
})
</script>
