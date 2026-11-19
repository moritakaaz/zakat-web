<template>
  <span class="inline-flex items-center gap-1">
    <Icon :name="iconName" size="14" />
    <Tag :value="value" :severity="prioritySeverity(value)" />
  </span>
</template>

<script setup lang="ts">
import { prioritySeverity } from '~/utils/format'

const props = defineProps<{ value: string }>()
const iconName = computed(() => {
  if (props.value === 'Prioritas 1') return 'lucide:star'
  if (props.value === 'Prioritas 2') return 'lucide:arrow-up'
  if (props.value === 'Prioritas 3') return 'lucide:arrow-right'
  if (props.value === 'Pending Verifikasi') return 'lucide:clock'
  if (props.value === 'Duplikat') return 'lucide:copy'
  return 'lucide:x-circle'
})
</script>
