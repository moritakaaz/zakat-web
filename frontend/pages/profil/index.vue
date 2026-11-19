<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Profil Saya</h1>
    <p class="text-sm text-slate-500 mt-1">Nama tampilan dan kata sandi akun yang sedang masuk.</p>

    <UCard class="shadow-sm ring-slate-200 mt-6">
      <template #header>
        <h2 class="font-semibold flex items-center gap-2 text-slate-900">
          <UIcon name="i-lucide-user-round" class="size-4.5 text-emerald-700" />
          Data profil
        </h2>
      </template>
      <div class="flex flex-col gap-4">
        <UFormField label="Email" name="email">
          <UInput :model-value="user?.email || ''" disabled class="w-full" />
        </UFormField>
        <UFormField label="Peran" name="role">
          <UInput :model-value="roleLabel" disabled class="w-full" />
        </UFormField>
        <UFormField label="Nama tampilan" name="name">
          <UInput v-model="nameForm.name" class="w-full" />
        </UFormField>
        <p class="text-sm text-slate-500">Nama ini tampil di bar atas dan tercatat di Riwayat perubahan setiap kali Anda mengubah data.</p>
        <p v-if="nameError" class="text-sm text-red-600">{{ nameError }}</p>
        <p v-if="nameSaved" class="text-sm text-emerald-700">{{ nameSaved }}</p>
        <div>
          <UButton @click="saveName">Simpan Nama</UButton>
        </div>
      </div>
    </UCard>

    <UCard class="shadow-sm ring-slate-200 mt-4">
      <template #header>
        <h2 class="font-semibold flex items-center gap-2 text-slate-900">
          <UIcon name="i-lucide-key-round" class="size-4.5 text-emerald-700" />
          Ubah kata sandi
        </h2>
      </template>
      <div class="flex flex-col gap-4">
        <UFormField label="Kata sandi lama" name="oldPassword">
          <UInput v-model="passwordForm.oldPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField label="Kata sandi baru" name="newPassword">
          <UInput v-model="passwordForm.newPassword" type="password" class="w-full" />
        </UFormField>
        <UFormField label="Konfirmasi kata sandi baru" name="confirmPassword">
          <UInput v-model="passwordForm.confirmPassword" type="password" class="w-full" />
        </UFormField>
        <p class="text-sm text-slate-500">Kata sandi baru minimal 8 karakter. Setelah diubah, masuk berikutnya memakai kata sandi baru.</p>
        <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
        <p v-if="passwordSaved" class="text-sm text-emerald-700">{{ passwordSaved }}</p>
        <div>
          <UButton @click="savePassword">Simpan Kata Sandi</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

const { user, restore, updateUser, authFetch } = useSession()
const nameForm = ref({ name: '' })
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const nameError = ref('')
const nameSaved = ref('')
const passwordError = ref('')
const passwordSaved = ref('')

const roleLabel = computed(() => {
  if (user.value?.role === 'bendahara') return 'Bendahara'
  if (user.value?.role === 'sekretaris') return 'Sekretaris'
  if (user.value?.role === 'kepala') return 'Kepala TPQ'
  return user.value?.role || ''
})

async function saveName() {
  nameError.value = ''
  nameSaved.value = ''
  if (!nameForm.value.name.trim()) {
    nameError.value = 'Nama tidak boleh kosong.'
    return
  }
  const res = await authFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ name: nameForm.value.name.trim() }) })
  if (!res.ok) {
    let message = 'Gagal menyimpan nama.'
    try {
      const data = await res.json()
      if (data.error) message = data.error
    } catch (error) {
      message = 'Gagal menyimpan nama.'
    }
    nameError.value = message
    return
  }
  const body = await res.json()
  updateUser({ name: body.data.name })
  nameSaved.value = 'Nama tampilan tersimpan.'
}

async function savePassword() {
  passwordError.value = ''
  passwordSaved.value = ''
  if (!passwordForm.value.oldPassword) {
    passwordError.value = 'Isi kata sandi lama terlebih dahulu.'
    return
  }
  if (!passwordForm.value.newPassword || passwordForm.value.newPassword.length < 8) {
    passwordError.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'Konfirmasi kata sandi baru tidak sama.'
    return
  }
  const res = await authFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ oldPassword: passwordForm.value.oldPassword, newPassword: passwordForm.value.newPassword }) })
  if (!res.ok) {
    let message = 'Gagal mengubah kata sandi.'
    try {
      const data = await res.json()
      if (data.error) message = data.error
    } catch (error) {
      message = 'Gagal mengubah kata sandi.'
    }
    passwordError.value = message
    return
  }
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  passwordSaved.value = 'Kata sandi tersimpan. Masuk berikutnya memakai kata sandi baru.'
}

onMounted(() => {
  restore()
  nameForm.value.name = user.value?.name || ''
})
</script>
