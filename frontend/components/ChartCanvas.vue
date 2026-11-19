<template>
  <div class="relative h-55">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import { Chart } from 'chart.js/auto'

const props = defineProps<{ type: string, data: any, options?: any }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

function build() {
  if (!canvasRef.value) return
  if (chart) chart.destroy()
  chart = new Chart(canvasRef.value, {
    type: props.type as any,
    data: props.data,
    options: props.options || {}
  })
}

onMounted(build)
watch(() => props.data, build, { deep: true })
onBeforeUnmount(() => {
  if (chart) chart.destroy()
  chart = null
})
</script>
