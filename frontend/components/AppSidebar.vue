<template>
  <aside :class="fullWidth ? 'w-full' : (mini ? 'w-16' : 'w-60')" class="flex h-full shrink-0 flex-col bg-white p-4 transition-all duration-200">
    <div v-if="showHeader" class="px-2 pb-4 border-b border-slate-200">
      <div v-if="mini" class="flex justify-center">
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-chevrons-right" title="Perluas menu" aria-label="Perluas menu" class="px-0" @click="toggleSidebar" />
      </div>
      <template v-else>
        <div class="flex items-center justify-between gap-2">
          <p class="font-bold text-emerald-700">Zakat Al-Fawwaz</p>
          <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-chevrons-left" title="Minimize menu" aria-label="Minimize menu" @click="toggleSidebar" />
        </div>
        <p class="text-xs text-slate-500 mt-1">Yayasan Pendidikan Al-Quran Al-Fawwaz</p>
      </template>
    </div>
    <nav class="mt-4 flex flex-col gap-1 text-sm">
      <NuxtLink v-for="item in visibleMenu" :key="item.to" :to="item.to" class="group relative px-3 py-2 rounded-md hover:bg-slate-100 flex items-center gap-2 text-slate-700" :class="mini ? 'justify-center px-2' : ''" active-class="bg-emerald-100 text-emerald-800 font-semibold" @click="$emit('navigate')">
        <UIcon :name="item.icon" class="size-4.5 shrink-0" />
        <span v-if="!mini">{{ item.label }}</span>
        <span v-if="mini" class="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-lg ring-1 ring-slate-200 opacity-0 transition-opacity duration-150 group-hover:opacity-100">{{ item.label }}</span>
      </NuxtLink>
    </nav>
    <div v-if="!mini" class="mt-6 px-2">
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
const collapsed = useState<boolean>('sidebar-collapsed', () => false)
defineEmits(['navigate'])
const props = defineProps({ showHeader: { type: Boolean, default: true }, fullWidth: { type: Boolean, default: false } })
const mini = computed(() => collapsed.value && !props.fullWidth)

function toggleSidebar() {
  collapsed.value = !collapsed.value
  if (import.meta.client) localStorage.setItem('zakat-sidebar-collapsed', collapsed.value ? '1' : '0')
}

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
  { label: 'Glosarium', to: '/glosarium', icon: 'i-lucide-book-open', roles: ['bendahara', 'sekretaris', 'kepala'] },
  { label: 'Pengguna', to: '/pengguna', icon: 'i-lucide-shield-check', roles: ['kepala'] },
  { label: 'Profil Saya', to: '/profil', icon: 'i-lucide-user-round', roles: ['bendahara', 'sekretaris', 'kepala'] }
]

const visibleMenu = computed(() => {
  if (!user.value) return allMenu
  return allMenu.filter((item) => item.roles.includes(user.value.role))
})

const activePeriod = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value))

onMounted(() => {
  restore()
  restorePeriod()
  if (import.meta.client) collapsed.value = localStorage.getItem('zakat-sidebar-collapsed') === '1'
  loadPeriods(authFetch)
})
</script>
