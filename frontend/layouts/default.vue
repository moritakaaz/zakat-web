<template>
  <div class="flex min-h-screen bg-paper">
    <AppSidebar />
    <div class="flex-1 min-w-0">
      <header class="bg-white border-b border-line px-6 py-3 flex items-center justify-between">
        <p class="font-semibold flex items-center gap-2">
          <Icon name="lucide:hand-heart" size="20" />
          Sistem Pengelolaan Zakat
        </p>
        <div class="flex items-center gap-3 text-sm">
          <span v-if="user" class="flex items-center gap-2">
            <Icon name="lucide:user" size="16" />
            {{ user.name }} ({{ user.role }})
          </span>
          <Button label="Keluar" severity="secondary" size="small" @click="logout">
            <template #icon>
              <Icon name="lucide:log-out" size="14" />
            </template>
          </Button>
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
