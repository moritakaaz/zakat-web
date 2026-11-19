<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Hasil Prioritas</h1>
    <p class="text-sm text-slate-500 mt-1">Ranking setelah Forward Chaining periode {{ periodName }}. Urutan memakai prioritas, lalu pendapatan per kapita terendah.</p>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
      <StatCard v-for="(count, label) in summary" :key="label" :label="label" :value="String(count)" hint="KK" />
    </div>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="font-semibold flex items-center gap-2 text-slate-900">
              <UIcon name="i-lucide-badge-check" class="size-4.5 text-emerald-700" />
              Persetujuan Kepala TPQ
            </h2>
            <p class="text-sm text-slate-500">Hasil {{ periodName }} berlaku setelah disetujui Kepala TPQ.</p>
          </div>
          <UBadge :color="approval.status === 'approved' ? 'success' : approval.status === 'rejected' ? 'error' : 'warning'" variant="soft" size="lg">{{ approvalLabel }}</UBadge>
        </div>
      </template>
      <p v-if="approval.approverName" class="text-sm text-slate-500 mt-2">Diputuskan oleh {{ approval.approverName }} pada {{ approval.decidedAt || '-' }}</p>
      <p v-if="approval.note" class="text-sm mt-1">Catatan {{ approval.note }}</p>
      <p v-if="approvalError" class="text-sm text-red-600 mt-2">{{ approvalError }}</p>
      <div v-if="isKepala" class="flex flex-col gap-2 mt-4">
        <UInput v-model="approvalNote" placeholder="Catatan persetujuan, boleh dikosongkan" class="w-full" />
        <div class="flex flex-wrap gap-2">
          <UButton size="sm" icon="i-lucide-check" @click="decide('approve')">Setujui Hasil</UButton>
          <UButton color="error" size="sm" icon="i-lucide-x" @click="decide('reject')">Tolak Hasil</UButton>
        </div>
      </div>
      <p v-else class="text-xs text-slate-500 mt-3">Hanya Kepala TPQ yang dapat menyetujui atau menolak hasil ini.</p>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-slate-900">Ranking penerima</h2>
          <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-download" @click="download">Unduh Laporan</UButton>
        </div>
      </template>
      <div class="overflow-x-auto">
        <UTable :data="rankPage" :columns="rankColumns">
          <template #rank-cell="{ row }">
            <span class="tnum">{{ (page - 1) * 10 + row.index + 1 }}</span>
          </template>
          <template #perCapita-cell="{ row }">
            <span class="tnum">{{ formatMoney(row.original.perCapita) }}</span>
          </template>
          <template #firedRules-cell="{ row }">
            <span class="tnum">{{ row.original.firedRules.join(', ') }}</span>
          </template>
          <template #result-cell="{ row }">
            <PriorityTag :value="row.original.result" />
          </template>
        </UTable>
      </div>
      <div class="flex justify-center mt-4">
        <UPagination v-model:page="page" :total="evaluations.length" :items-per-page="10" />
      </div>
      <p class="text-xs text-slate-500 mt-3">Aturan R12 dipakai di sini. Bila dana tidak cukup, Prioritas 1 disalurkan pertama, lalu Prioritas 2, lalu Prioritas 3.</p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney } from '~/utils/format'

const { evaluations, summary } = useZakatData()
const { user, authFetch } = useSession()
const { periods, selectedPeriodId } = usePeriod()
const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')
const page = ref(1)
const rankPage = computed(() => evaluations.value.slice((page.value - 1) * 10, page.value * 10))
const rankColumns = [
  { id: 'rank', header: 'Urutan' },
  { accessorKey: 'id', header: 'Kode' },
  { accessorKey: 'fullName', header: 'Nama Kepala Keluarga' },
  { accessorKey: 'perCapita', header: 'Per Kapita' },
  { accessorKey: 'firedRules', header: 'Aturan Menyala' },
  { accessorKey: 'result', header: 'Hasil' }
]

const approval = ref({ periodId: 1, status: 'pending', approverId: null, approverName: null, note: '', decidedAt: null })
const approvalNote = ref('')
const approvalError = ref('')
const approvalLabel = computed(() => {
  if (approval.value.status === 'approved') return 'Disetujui'
  if (approval.value.status === 'rejected') return 'Ditolak'
  return 'Menunggu Persetujuan'
})
const isKepala = computed(() => user.value?.role === 'kepala')

async function loadApproval() {
  try {
    const res = await authFetch('/approvals/' + selectedPeriodId.value)
    if (!res.ok) return
    const body = await res.json()
    approval.value = body.data
  } catch (error) {
    approvalError.value = 'Status persetujuan dari server tidak dapat dimuat.'
  }
}

async function decide(action: string) {
  approvalError.value = ''
  const res = await authFetch('/approvals/' + selectedPeriodId.value + '/' + action, {
    method: 'POST',
    body: JSON.stringify({ note: approvalNote.value })
  })
  if (!res.ok) {
    approvalError.value = 'Gagal menyimpan keputusan. Pastikan Anda masuk sebagai Kepala TPQ.'
    return
  }
  const body = await res.json()
  approval.value = body.data
}

onMounted(loadApproval)

function download() {
  const lines = ['Hasil Prioritas Mustahik ' + periodName.value, '']
  evaluations.value.forEach((item, index) => {
    lines.push((index + 1) + '. ' + item.fullName + ' - ' + item.result + ' - ' + item.firedRules.join(', '))
  })
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'hasil-prioritas-1446H.txt'
  link.click()
  URL.revokeObjectURL(url)
}
</script>
