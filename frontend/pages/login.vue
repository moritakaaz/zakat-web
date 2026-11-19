<template>
  <div>
    <NuxtLayout name="auth">
      <div class="grid overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2">
        <div class="bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-600 p-6 text-white sm:p-10">
          <div class="flex items-center gap-3">
            <span class="flex size-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <UIcon name="i-lucide-hand-heart" class="size-6" />
            </span>
            <span>
              <span class="block font-bold leading-tight">Zakat Al-Fawwaz</span>
              <span class="block text-xs text-emerald-100/80">Yayasan Pendidikan Al-Quran Al-Fawwaz</span>
            </span>
          </div>
          <h1 class="mt-8 text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-4xl">Selamat datang kembali.</h1>
          <p class="mt-3 text-sm leading-relaxed text-emerald-100/90">Lanjutkan pengelolaan zakat dari tempat terakhir Anda berhenti.</p>
          <ul class="mt-10 hidden flex-col gap-5 lg:flex">
            <li v-for="feature in features" :key="feature.title" class="flex gap-3">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/20">
                <UIcon :name="feature.icon" class="size-5" />
              </span>
              <span>
                <span class="block text-sm font-semibold">{{ feature.title }}</span>
                <span class="block text-xs leading-relaxed text-emerald-100/80">{{ feature.text }}</span>
              </span>
            </li>
          </ul>
        </div>
        <div class="p-6 sm:p-10">
          <h2 class="text-xl font-bold text-slate-900">Masuk ke Zakat Al-Fawwaz</h2>
          <p class="mt-1 text-sm text-slate-500">Masukkan email dan kata sandi akun Anda.</p>
          <UForm :state="state" class="mt-8 flex flex-col gap-4" @submit="submit">
            <UFormField label="Email" name="email">
              <UInput id="email" v-model="state.email" type="email" placeholder="email@contoh.id" size="lg" class="w-full" />
            </UFormField>
            <UFormField label="Kata sandi" name="password">
              <UInput id="password" v-model="state.password" type="password" placeholder="Masukkan kata sandi" size="lg" class="w-full" />
            </UFormField>
            <UAlert v-if="error" color="error" variant="soft" :title="error" icon="i-lucide-circle-x" />
            <UButton type="submit" block size="lg" class="rounded-full" :loading="loading">Masuk</UButton>
          </UForm>
          <p class="mt-6 text-center text-xs text-slate-400">Yayasan Pendidikan Al-Quran Al-Fawwaz, Tanjung Priok, Jakarta Utara</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

definePageMeta({ layout: false })

const { login } = useSession()
const state = ref({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

const features = [
  { icon: 'i-lucide-users', title: 'Kelola mustahik', text: 'Data penerima, NIK, dan verifikasi dalam satu tempat.' },
  { icon: 'i-lucide-scale', title: 'Proses rule otomatis', text: 'Forward Chaining menentukan prioritas secara konsisten.' },
  { icon: 'i-lucide-file-text', title: 'Laporan dan arsip rapi', text: 'Rekap periode dan persetujuan Kepala TPQ tercatat.' }
]

async function submit() {
  error.value = ''
  if (!state.value.email || !state.value.password) {
    error.value = 'Email dan kata sandi wajib diisi.'
    return
  }
  loading.value = true
  const found = await login(state.value.email.trim(), state.value.password)
  loading.value = false
  if (!found) {
    error.value = 'Email atau kata sandi salah.'
    return
  }
  navigateTo('/dashboard')
}
</script>
