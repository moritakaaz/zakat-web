<template>
  <aside class="w-60 shrink-0 bg-white border-r border-line min-h-screen p-4">
    <div class="px-2 pb-4 border-b border-line">
      <p class="font-bold text-pine-700">Zakat Al-Fawwaz</p>
      <p class="text-xs text-muted mt-1">Yayasan Pendidikan Al-Quran Al-Fawwaz</p>
    </div>
    <nav class="mt-4 flex flex-col gap-1 text-sm">
      <NuxtLink v-for="item in menu" :key="item.to" :to="item.to" class="px-3 py-2 rounded-md hover:bg-paper" active-class="bg-pine-100 text-pine-800 font-semibold">
        {{ item.label }}
      </NuxtLink>
    </nav>
    <div class="mt-6 px-2">
      <p class="text-xs text-muted">Periode aktif</p>
      <p class="text-sm font-semibold mt-1">Ramadan 1447 H</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
const menu = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Data Mustahik', to: '/mustahik' },
  { label: 'Tambah Mustahik', to: '/mustahik/new' },
  { label: 'Muzakki dan Penerimaan', to: '/muzakki' },
  { label: 'Proses Rule', to: '/rules' },
  { label: 'Hasil Prioritas', to: '/results' },
  { label: 'Laporan', to: '/reports' }
]
</script>
