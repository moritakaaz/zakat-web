<template>
  <div>
    <NuxtLayout name="auth">
      <UCard class="shadow-sm ring-slate-200">
        <h1 class="text-xl font-bold text-emerald-700">Zakat Al-Fawwaz</h1>
        <p class="text-sm text-slate-500 mt-1">Masuk untuk mengelola zakat Yayasan Pendidikan Al-Quran Al-Fawwaz.</p>
        <UForm :state="state" class="mt-6 flex flex-col gap-4" @submit="submit">
          <UFormField label="Email" name="email">
            <UInput id="email" v-model="state.email" type="email" placeholder="bendahara@alfawwaz.or.id" class="w-full" />
          </UFormField>
          <UFormField label="Kata sandi" name="password">
            <UInput id="password" v-model="state.password" type="password" placeholder="Masukkan kata sandi" class="w-full" />
          </UFormField>
          <UAlert v-if="error" color="error" variant="soft" :title="error" icon="i-lucide-circle-x" />
          <UButton type="submit" block>Masuk Aplikasi</UButton>
        </UForm>
        <div class="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500">
          <p class="font-semibold text-slate-900 text-sm">Akun demo</p>
          <p class="mt-1">bendahara@alfawwaz.or.id, kata sandi bendahara123</p>
          <p>sekretaris@alfawwaz.or.id, kata sandi sekretaris123</p>
          <p>kepala@alfawwaz.or.id, kata sandi kepala123</p>
          <p class="mt-2">Ganti kata sandi demo sebelum dipakai di produksi.</p>
        </div>
      </UCard>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

definePageMeta({ layout: false })

const { login } = useSession()
const state = ref({ email: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  if (!state.value.email || !state.value.password) {
    error.value = 'Email dan kata sandi wajib diisi.'
    return
  }
  const found = await login(state.value.email.trim(), state.value.password)
  if (!found) {
    error.value = 'Email atau kata sandi salah.'
    return
  }
  navigateTo('/dashboard')
}
</script>
