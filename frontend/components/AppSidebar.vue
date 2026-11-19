<template>
  <aside class="w-60 shrink-0 bg-white border-r border-line min-h-screen p-4">
    <div class="px-2 pb-4 border-b border-line">
      <p class="font-bold text-pine-700">Zakat Al-Fawwaz</p>
      <p class="text-xs text-muted mt-1">Yayasan Pendidikan Al-Quran Al-Fawwaz</p>
    </div>
    <nav class="mt-4 flex flex-col gap-1 text-sm">
      <NuxtLink v-for="item in visibleMenu" :key="item.to" :to="item.to" class="px-3 py-2 rounded-md hover:bg-paper flex items-center gap-2" active-class="bg-pine-100 text-pine-800 font-semibold">
        <Icon :name="item.icon" size="18" />
        {{ item.label }}
      </NuxtLink>
    </nav>
    <div class="mt-6 px-2">
      <p class="text-xs text-muted">Periode</p>
      <Select :model-value="selectedPeriodId" :options="periods" option-label="periodName" option-value="id" class="w-full mt-2" @update:model-value="selectPeriod" />
      <p class="text-xs text-muted mt-2">{{ activePeriod?.periodName }} - {{ activePeriod?.status === 'closed' ? 'Tutup' : 'Aktif' }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSession, usePeriod } from '~/composables/useZakat'

const { user, authFetch, restore } = useSession()
const { selectedPeriodId, periods, restorePeriod, selectPeriod, loadPeriods } = usePeriod()

const allMenu = [
  { label: 'Dashboard', to: '/dashboard', icon: 'lucide:layout-dashboard', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Data Mustahik', to: '/mustahik', icon: 'lucide:users', roles: ['bendahara', 'sekretaris'] },
  { label: 'Tambah Mustahik', to: '/mustahik/new', icon: 'lucide:user-plus', roles: ['bendahara', 'sekretaris'] },
  { label: 'Muzakki dan Penerimaan', to: '/muzakki', icon: 'lucide:wallet', roles: ['bendahara', 'sekretaris'] },
  { label: 'Proses Rule', to: '/rules', icon: 'lucide:scale', roles: ['bendahara'] },
  { label: 'Hasil Prioritas', to: '/results', icon: 'lucide:trophy', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Laporan', to: '/reports', icon: 'lucide:file-text', roles: ['bendahara', 'sekretaris', 'kepala'] }
]

const visibleMenu = computed(() => {
  if (!user.value) return allMenu
  return allMenu.filter((item) => item.roles.includes(user.value.role))
})

const activePeriod = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value))

onMounted(() => {
  restore()
  restorePeriod()
  loadPeriods(authFetch)
})
</script>
