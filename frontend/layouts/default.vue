<template>
  <div class="min-h-screen bg-slate-50">
    <div class="hidden lg:block fixed inset-y-0 left-0 z-40 border-r border-slate-200">
      <AppSidebar />
    </div>
    <div class="lg:pl-60">
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <UButton icon="i-lucide-menu" color="neutral" variant="ghost" class="lg:hidden shrink-0" aria-label="Buka menu" @click="mobileNav = true" />
          <p class="font-semibold flex items-center gap-2 truncate">
            <UIcon name="i-lucide-hand-heart" class="size-5 shrink-0 text-emerald-700" />
            <span class="truncate">Sistem Pengelolaan Zakat</span>
          </p>
        </div>
        <div class="flex items-center gap-3 text-sm shrink-0">
          <span v-if="user" class="hidden sm:flex items-center gap-2 text-slate-700">
            <UIcon name="i-lucide-user" class="size-4" />
            {{ user.name }} ({{ user.role }})
          </span>
          <UButton label="Keluar" color="neutral" variant="soft" size="sm" icon="i-lucide-log-out" @click="logout" />
        </div>
      </header>
      <main class="p-4 sm:p-6">
        <div class="w-full max-w-7xl mx-auto">
          <slot />
        </div>
      </main>
    </div>
    <USlideover v-model:open="mobileNav" title="Zakat Al-Fawwaz" description="Yayasan Pendidikan Al-Quran Al-Fawwaz" side="bottom" :ui="{ content: 'max-h-[85vh] rounded-t-2xl', close: 'start-4 end-auto', header: 'ps-14', body: 'p-0' }">
      <template #body>
        <AppSidebar :show-header="false" full-width @navigate="mobileNav = false" />
      </template>
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

const { user, restore, logout } = useSession()
const mobileNav = ref(false)

onMounted(() => {
  restore()
  if (!user.value) navigateTo('/login')
})
</script>
