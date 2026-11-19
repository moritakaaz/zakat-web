export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        ink: '#1E293B',
        muted: '#64748B',
        line: '#E2E8F0',
        pine: { 700: '#166534', 800: '#14532D', 100: '#DCFCE7' },
        amber: { 700: '#B45309', 100: '#FEF3C7' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
