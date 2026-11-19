<template>
  <div>
    <NuxtLayout name="auth">
      <div class="bg-white border border-line rounded-lg p-6">
        <h1 class="text-xl font-bold text-pine-700">Zakat Al-Fawwaz</h1>
        <p class="text-sm text-muted mt-1">Masuk untuk mengelola zakat Yayasan Pendidikan Al-Quran Al-Fawwaz.</p>
        <form class="mt-6 flex flex-col gap-4" @submit.prevent="submit">
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-semibold">Email</label>
            <InputText id="email" v-model="email" type="email" placeholder="bendahara@alfawwaz.or.id" class="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-semibold">Kata sandi</label>
            <InputText id="password" v-model="password" type="password" placeholder="Masukkan kata sandi" class="w-full" />
          </div>
          <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
          <Button type="submit" label="Masuk Aplikasi" class="w-full" />
        </form>
        <div class="mt-6 border-t border-line pt-4 text-xs text-muted">
          <p class="font-semibold text-ink text-sm">Akun demo</p>
          <p class="mt-1">bendahara@alfawwaz.or.id, kata sandi bendahara123</p>
          <p>sekretaris@alfawwaz.or.id, kata sandi sekretaris123</p>
          <p>kepala@alfawwaz.or.id, kata sandi kepala123</p>
          <p class="mt-2">Ganti kata sandi demo sebelum dipakai di produksi.</p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

definePageMeta({ layout: false })

const { login } = useSession()
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'Email dan kata sandi wajib diisi.'
    return
  }
  const found = await login(email.value.trim(), password.value)
  if (!found) {
    error.value = 'Email atau kata sandi salah.'
    return
  }
  navigateTo('/dashboard')
}
</script>
