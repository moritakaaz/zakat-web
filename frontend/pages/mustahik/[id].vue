<template>
  <div>
    <h1 class="text-xl font-bold">Ubah Mustahik</h1>
    <p class="text-sm text-slate-500 mt-1">Membuka form ubah di halaman Data Mustahik.</p>
    <p class="text-sm mt-4">
      <NuxtLink :to="'/mustahik?edit=' + route.params.id" class="text-emerald-700 font-semibold">Buka form ubah</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

onMounted(() => {
  navigateTo({ path: '/mustahik', query: { edit: String(route.params.id) } })
})
</script>
