<template>
  <div>
    <h1 class="text-xl font-bold">Muzakki dan Penerimaan</h1>
    <p class="text-sm text-muted mt-1">Pencatatan penerimaan zakat Ramadan 1446 H mengikuti buku bendahara.</p>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatCard label="Beras masuk" :value="formatKg(riceIn)" hint="130 kg pada data acuan" />
      <StatCard label="Uang masuk" :value="formatMoney(moneyIn)" hint="Fitrah, mal, dan infaq" />
      <StatCard label="Baris penerimaan" :value="String(receipts.length)" hint="10 baris pada data acuan" />
      <StatCard label="Sisa saldo uang" :value="formatMoney(balance)" hint="Setelah penyaluran" />
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Penerimaan dari muzakki</h2>
      <DataTable :value="receipts" paginator :rows="10" size="small" class="mt-3">
        <Column field="date" header="Tanggal" />
        <Column field="zakatType" header="Jenis Zakat" />
        <Column field="name" header="Muzakki" />
        <Column field="form" header="Bentuk" />
        <Column field="quantityKg" header="Beras (kg)">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.quantityKg || '-' }}</span>
          </template>
        </Column>
        <Column field="amountMoney" header="Nilai Uang">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.amountMoney ? formatMoney(slotProps.data.amountMoney) : '-' }}</span>
          </template>
        </Column>
        <Column field="note" header="Keterangan" />
      </DataTable>
    </div>

    <div class="bg-white border border-line rounded-lg p-4 mt-4">
      <h2 class="font-semibold">Penyaluran kepada mustahik</h2>
      <DataTable :value="distributions" size="small" class="mt-3">
        <Column field="date" header="Tanggal" />
        <Column field="zakatType" header="Jenis Zakat" />
        <Column field="name" header="Kelompok Penerima" />
        <Column field="quantityKg" header="Beras (kg)">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.quantityKg || '-' }}</span>
          </template>
        </Column>
        <Column field="amountMoney" header="Nilai Uang">
          <template #body="slotProps">
            <span class="tnum">{{ slotProps.data.amountMoney ? formatMoney(slotProps.data.amountMoney) : '-' }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useZakatData } from '~/composables/useZakat'
import { formatMoney, formatKg } from '~/utils/format'

const { receipts, distributions } = useZakatData()
const moneyIn = computed(() => receipts.reduce((sum, row) => sum + row.amountMoney, 0))
const moneyOut = computed(() => distributions.reduce((sum, row) => sum + row.amountMoney, 0))
const balance = computed(() => moneyIn.value - moneyOut.value)
const riceIn = computed(() => receipts.reduce((sum, row) => sum + row.quantityKg, 0))
</script>
