<template>
  <div class="bg-white border border-line rounded-lg p-4">
    <p class="text-sm text-muted">{{ label }}</p>
    <p class="tnum mt-1 text-2xl font-bold text-ink">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string, value: string, hint?: string }>()
</script>
