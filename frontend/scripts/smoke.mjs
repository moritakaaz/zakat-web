import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pages = [
  'pages/login.vue',
  'pages/dashboard.vue',
  'pages/mustahik/index.vue',
  'pages/mustahik/new.vue',
  'pages/muzakki/index.vue',
  'pages/rules/index.vue',
  'pages/results/index.vue',
  'pages/reports/index.vue'
]

const routes = ['/login', '/dashboard', '/mustahik', '/mustahik/new', '/muzakki', '/rules', '/results', '/reports']

let failed = 0
for (const page of pages) {
  if (!existsSync(join(root, page))) {
    console.log('Missing page file ' + page)
    failed += 1
  }
}
if (failed) process.exit(1)
console.log('Smoke check passed, all 8 page files exist')

const base = process.env.FRONTEND_URL || ''
if (!base) {
  console.log('Live check skipped, set FRONTEND_URL to check a running preview server')
  process.exit(0)
}
for (const route of routes) {
  const res = await fetch(base + route)
  if (res.status !== 200) {
    console.log('Route ' + route + ' returned ' + res.status)
    failed += 1
  } else {
    console.log('Route ' + route + ' returned 200')
  }
}
if (failed) process.exit(1)
console.log('Live smoke check passed, all 8 routes returned 200')
