export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light',
    fallback: 'light'
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api'
    }
  },
  app: {
    head: {
      title: 'Sistem Pengelolaan Zakat Al-Fawwaz',
      htmlAttrs: { lang: 'id' },
      script: [
        {
          innerHTML: "try{if(localStorage.getItem('nuxt-color-mode')!=='light'){localStorage.setItem('nuxt-color-mode','light')}}catch(e){}"
        }
      ]
    }
  }
})
