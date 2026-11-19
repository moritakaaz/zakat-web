// Force light mode even when the system is dark.
export default defineNuxtPlugin(() => {
  const root = document.documentElement
  const forceLight = () => {
    try {
      localStorage.setItem('nuxt-color-mode', 'light')
    } catch (error) {
      // Storage is unavailable, the class cleanup below still applies.
    }
    root.classList.remove('dark')
  }
  forceLight()
  const colorMode = useColorMode()
  colorMode.preference = 'light'
  colorMode.value = 'light'
  new MutationObserver(forceLight).observe(root, { attributes: true, attributeFilter: ['class'] })
})
