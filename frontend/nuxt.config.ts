import Aura from '@primevue/themes/aura'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  modules: ['@nuxtjs/tailwindcss', '@primevue/nuxt-module'],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark-mode' }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },
  app: {
    head: {
      title: 'Sistem Pengelolaan Zakat Al-Fawwaz',
      htmlAttrs: { lang: 'id' }
    }
  },
  tailwindcss: {
    configPath: 'tailwind.config.js'
  }
})
