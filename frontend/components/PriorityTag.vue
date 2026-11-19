<template>
  <Tag :value="value" :severity="prioritySeverity(value)" />
</template>

<script setup lang="ts">
import { prioritySeverity } from '~/utils/format'

defineProps<{ value: string }>()
</script>
