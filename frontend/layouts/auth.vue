<template>
  <div class="relative min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-100/70 to-transparent" aria-hidden="true" />
    <div class="relative w-full max-w-4xl">
      <slot />
    </div>
  </div>
</template>
