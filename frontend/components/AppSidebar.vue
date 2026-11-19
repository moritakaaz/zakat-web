<template>
  <aside :class="fullWidth ? 'w-full' : 'w-60'" class="flex h-full shrink-0 flex-col bg-white p-4">
    <div v-if="showHeader" class="px-2 pb-4 border-b border-slate-200">
      <p class="font-bold text-emerald-700">Zakat Al-Fawwaz</p>
      <p class="text-xs text-slate-500 mt-1">Yayasan Pendidikan Al-Quran Al-Fawwaz</p>
    </div>
    <nav class="mt-4 flex flex-col gap-1 text-sm">
      <NuxtLink v-for="item in visibleMenu" :key="item.to" :to="item.to" class="px-3 py-2 rounded-md hover:bg-slate-100 flex items-center gap-2 text-slate-700" active-class="bg-emerald-100 text-emerald-800 font-semibold" @click="$emit('navigate')">
        <UIcon :name="item.icon" class="size-4.5 shrink-0" />
        {{ item.label }}
      </NuxtLink>
    </nav>
    <div class="mt-6 px-2">
      <p class="text-xs text-slate-500">Periode</p>
      <USelect :model-value="selectedPeriodId" :items="periods" value-key="id" label-key="periodName" class="w-full mt-2" @update:model-value="changePeriod" />
      <p class="text-xs text-slate-500 mt-2">{{ activePeriod?.periodName }} - {{ activePeriod?.status === 'closed' ? 'Tutup' : 'Aktif' }}</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useSession, usePeriod, useZakatData } from '~/composables/useZakat'

const { user, authFetch, restore } = useSession()
const { selectedPeriodId, periods, restorePeriod, selectPeriod, loadPeriods } = usePeriod()
const { loadDashboard } = useZakatData()
defineEmits(['navigate'])
defineProps({ showHeader: { type: Boolean, default: true }, fullWidth: { type: Boolean, default: false } })

async function changePeriod(id: number) {
  selectPeriod(id)
  await loadDashboard(authFetch)
}

const allMenu = [
  { label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-layout-dashboard', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Data Mustahik', to: '/mustahik', icon: 'i-lucide-users', roles: ['bendahara', 'sekretaris'] },
  { label: 'Tambah Mustahik', to: '/mustahik/new', icon: 'i-lucide-user-plus', roles: ['bendahara', 'sekretaris'] },
  { label: 'Muzakki dan Penerimaan', to: '/muzakki', icon: 'i-lucide-wallet', roles: ['bendahara', 'sekretaris'] },
  { label: 'Proses Rule', to: '/rules', icon: 'i-lucide-scale', roles: ['bendahara'] },
  { label: 'Hasil Prioritas', to: '/results', icon: 'i-lucide-trophy', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Laporan', to: '/reports', icon: 'i-lucide-file-text', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Glosarium', to: '/glosarium', icon: 'i-lucide-book-open', roles: ['bendahara', 'sekretaris', 'kepala'] }
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
