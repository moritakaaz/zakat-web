<template>
  <button type="button" class="inline-flex items-center gap-1 text-left font-semibold text-slate-900 hover:text-emerald-700" @click="$emit('toggle', column)">
    {{ label }}
    <UIcon :name="iconName" class="size-3.5 shrink-0 text-slate-400" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  column: string
  sortKey: string
  sortDirection: 'asc' | 'desc'
}>()

defineEmits<{
  toggle: [column: string]
}>()

const iconName = computed(() => {
  if (props.sortKey !== props.column) return 'i-lucide-arrow-up-down'
  return props.sortDirection === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
})
</script>
