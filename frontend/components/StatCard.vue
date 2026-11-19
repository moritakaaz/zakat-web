<template>
  <UCard class="shadow-sm ring-slate-200">
    <div class="flex items-center gap-2">
      <UIcon v-if="icon" :name="icon" class="size-5 shrink-0 text-emerald-700" />
      <p class="text-sm text-slate-500">{{ label }}</p>
    </div>
    <p class="tnum mt-1 text-2xl font-bold text-slate-900">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-slate-500">{{ hint }}</p>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{ label: string, value: string, hint?: string, icon?: string }>()
</script>