<template>
  <div class="flex min-h-screen bg-paper">
    <AppSidebar />
    <div class="flex-1 min-w-0">
      <header class="bg-white border-b border-line px-6 py-3 flex items-center justify-between">
        <p class="font-semibold">Sistem Pengelolaan Zakat</p>
        <div class="flex items-center gap-3 text-sm">
          <span v-if="user">{{ user.name }} ({{ user.role }})</span>
          <Button label="Keluar" severity="secondary" size="small" @click="logout" />
        </div>
      </header>
      <main class="p-6 max-w-6xl">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

const { user, restore, logout } = useSession()

onMounted(() => {
  restore()
  if (!user.value) navigateTo('/login')
})
</script>
