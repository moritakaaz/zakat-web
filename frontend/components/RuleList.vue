<template>
  <div class="flex flex-col gap-3">
    <div v-for="rule in rules" :key="rule.code" class="rounded-xl border border-slate-200 p-4">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-800 ring-1 ring-emerald-200">{{ rule.code }}</span>
        <span class="text-xs text-slate-500">Urutan {{ rule.order }}</span>
        <UBadge :color="rule.isActive ? 'success' : 'neutral'" variant="soft">{{ rule.isActive ? 'Aktif' : 'Nonaktif' }}</UBadge>
        <UButton v-if="showEdit" class="ml-auto" color="neutral" variant="soft" size="xs" icon="i-lucide-pencil" @click="$emit('edit', rule)">Ubah</UButton>
      </div>
      <p class="mt-3 text-sm leading-relaxed">
        <span class="font-semibold text-slate-900">Jika</span> {{ rule.condition }},
      </p>
      <p class="mt-1 text-sm leading-relaxed">
        <span class="font-semibold text-emerald-700">maka</span> {{ rule.result }}.
      </p>
      <p v-if="thresholdText(rule) !== '-'" class="mt-2 text-xs text-slate-500">Ambang {{ thresholdText(rule) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ rules: any[], showEdit?: boolean }>()
defineEmits<{ edit: [rule: any] }>()

function thresholdText(rule: any): string {
  const parts: string[] = []
  if (typeof rule.incomeMin === 'number') parts.push('Min Rp ' + rule.incomeMin.toLocaleString('id-ID'))
  if (typeof rule.incomeLimit === 'number') parts.push('Maks Rp ' + rule.incomeLimit.toLocaleString('id-ID'))
  if (typeof rule.perCapitaLimit === 'number') parts.push('Per kapita Rp ' + rule.perCapitaLimit.toLocaleString('id-ID'))
  if (typeof rule.dependentsMin === 'number') parts.push('Tanggungan ' + rule.dependentsMin + ' jiwa')
  if (typeof rule.honorMin === 'number') parts.push('Honor Rp ' + rule.honorMin.toLocaleString('id-ID'))
  if (typeof rule.honorMax === 'number') parts.push('sampai Rp ' + rule.honorMax.toLocaleString('id-ID'))
  if (typeof rule.schoolMin === 'number') parts.push('Anak sekolah ' + rule.schoolMin)
  return parts.join(', ') || '-'
}
</script>
