<template>
  <div>
    <h1 class="text-xl font-bold">Hasil Prioritas</h1>
    <p class="text-sm text-muted mt-1">Ranking setelah Forward Chaining periode {{ periodName }}. Urutan memakai prioritas, lalu pendapatan per kapita terendah.</p>

    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
      <StatCard v-for="(count, label) in summary" :key="label" :label="label" :value="String(count)" hint="KK" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-semibold flex items-center gap-2">
            <Icon name="lucide:badge-check" size="18" />
            Persetujuan Kepala TPQ
          </h2>
          <p class="text-sm text-muted">Hasil {{ periodName }} berlaku setelah disetujui Kepala TPQ.</p>
        </div>
        <span class="text-sm font-semibold">{{ approvalLabel }}</span>
      </div>
      <p v-if="approval.approverName" class="text-sm text-muted mt-2">Diputuskan oleh {{ approval.approverName }} pada {{ approval.decidedAt || '-' }}</p>
      <p v-if="approval.note" class="text-sm mt-1">Catatan {{ approval.note }}</p>
      <p v-if="approvalError" class="text-sm text-red-600 mt-2">{{ approvalError }}</p>
      <div v-if="isKepala" class="flex flex-col gap-2 mt-4">
        <InputText v-model="approvalNote" placeholder="Catatan persetujuan, boleh dikosongkan" class="w-full" />
        <div class="flex gap-2">
          <Button label="Setujui Hasil" size="small" @click="decide('approve')" />
          <Button label="Tolak Hasil" severity="danger" size="small" @click="decide('reject')" />
        </div>
      </div>
      <p v-else class="text-xs text-muted mt-3">Hanya Kepala TPQ yang dapat menyetujui atau menolak hasil ini.</p>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <h2 class="font-semibold">Ranking penerima</h2>
        <Button label="Unduh Laporan" severity="secondary" size="small" @click="download" />
      </div>
      <DataTable :value="evaluations" paginator :rows="10" size="small" class="mt-3">
        <Column field="rank" header="Urutan">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.index + 1 }}</span>
          </template>
        </Column>
        <Column field="id" header="Kode" />
        <Column field="fullName" header="Nama Kepala Keluarga" />
        <Column field="perCapita" header="Per Kapita">
          <template #body="slotProps">
            <span class="tnum">{{ formatMoney(slotProps.data.perCapita) }}</span>
          </template>
        </Column>
        <Column field="firedRules" header="Aturan Menyala">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.firedRules.join(', ') }}</span>
          </template>
        </Column>
        <Column field="result" header="Hasil">
          <template #body="slotProps">
            <PriorityTag :value="slotProps.data.result" />
          </template>
        </Column>
      </DataTable>
      <p class="text-xs text-muted mt-3">Aturan R12 dipakai di sini. Bila dana tidak cukup, Prioritas 1 disalurkan pertama, lalu Prioritas 2, lalu Prioritas 3.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData, useSession, usePeriod } from '~/composables/useZakat'
import { formatMoney } from '~/utils/format'

const { evaluations, summary } = useZakatData()
const { user, authFetch } = useSession()
const { periods, selectedPeriodId } = usePeriod()
const periodName = computed(() => periods.value.find((row) => row.id === selectedPeriodId.value)?.periodName || '')

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
