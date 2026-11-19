<template>
  <span class="inline-flex items-center gap-1.5">
    <UIcon :name="iconName" class="size-3.5 shrink-0" />
    <UBadge :color="prioritySeverity(value) as any" variant="soft" size="md">{{ value }}</UBadge>
  </span>
</template>

<script setup lang="ts">
import { prioritySeverity } from '~/utils/format'

const props = defineProps<{ value: string }>()
const iconName = computed(() => {
  if (props.value === 'Prioritas 1') return 'i-lucide-star'
  if (props.value === 'Prioritas 2') return 'i-lucide-arrow-up'
  if (props.value === 'Prioritas 3') return 'i-lucide-arrow-right'
  if (props.value === 'Pending Verifikasi') return 'i-lucide-clock'
  if (props.value === 'Duplikat') return 'i-lucide-copy'
  return 'i-lucide-x-circle'
})
</script>
