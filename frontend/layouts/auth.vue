<template>
  <div class="relative min-h-screen overflow-hidden bg-emerald-950 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-[url('/images/islamic-pattern.svg')] bg-[length:120px_120px] opacity-40" aria-hidden="true" />
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-950/70 via-emerald-900/30 to-emerald-700/40" aria-hidden="true" />
    <div class="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden="true" />
    <div class="relative w-full max-w-4xl">
      <slot />
    </div>
  </div>
</template>
