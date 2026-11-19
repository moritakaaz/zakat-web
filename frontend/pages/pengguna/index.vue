<template>
  <div>
    <h1 class="text-xl font-bold text-slate-900">Pengguna</h1>
    <p class="text-sm text-slate-500 mt-1">Akun yang dapat masuk ke aplikasi. Hanya Kepala TPQ yang mengelola pengguna.</p>

    <UAlert v-if="!isKepala" color="error" variant="soft" title="Halaman ini hanya untuk Kepala TPQ." icon="i-lucide-shield-alert" class="mt-6" />
    <template v-else>
      <UAlert v-if="usersSaved" color="success" variant="soft" :title="usersSaved" icon="i-lucide-circle-check" class="mt-6" />
      <UCard class="shadow-sm ring-slate-200 mt-4">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold flex items-center gap-2 text-slate-900">
              <UIcon name="i-lucide-shield-check" class="size-4.5 text-emerald-700" />
              Daftar pengguna
            </h2>
            <UButton size="sm" icon="i-lucide-user-plus" @click="openCreate">Tambah Pengguna</UButton>
          </div>
        </template>
        <p v-if="usersError" class="text-sm text-red-600 mt-3">{{ usersError }}</p>
        <div class="overflow-x-auto">
          <UTable :data="users" :columns="userColumns">
            <template #role-cell="{ row }">
              {{ roleLabel(row.original.role) }}
            </template>
            <template #active-cell="{ row }">
              <UBadge :color="row.original.active === false ? 'error' : 'success'" variant="soft">
                {{ row.original.active === false ? 'Nonaktif' : 'Aktif' }}
              </UBadge>
            </template>
            <template #actions-cell="{ row }">
              <div v-if="row.original.id !== user?.id" class="flex gap-1">
                <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-pencil" @click="openEdit(row.original)">Ubah</UButton>
                <UButton color="neutral" variant="soft" size="sm" icon="i-lucide-key-round" @click="openReset(row.original)">Reset Kata Sandi</UButton>
                <UButton :color="row.original.active === false ? 'success' : 'error'" variant="soft" size="sm" :icon="row.original.active === false ? 'i-lucide-user-check' : 'i-lucide-user-x'" @click="askToggle(row.original)">
                  {{ row.original.active === false ? 'Aktifkan' : 'Nonaktifkan' }}
                </UButton>
              </div>
            </template>
          </UTable>
        </div>
        <p class="text-sm text-slate-500 mt-4">Pengguna nonaktif tidak dapat masuk sampai diaktifkan kembali. Kepala TPQ tidak dapat mengubah akunnya sendiri dari halaman ini, gunakan Profil Saya.</p>
      </UCard>
    </template>

    <UModal v-model:open="showForm" :title="editingId ? 'Ubah pengguna' : 'Tambah pengguna'">
      <template #body>
        <div class="flex flex-col gap-4">
          <UFormField label="Nama" name="name">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UFormField label="Email" name="email">
            <UInput v-model="form.email" type="email" class="w-full" />
          </UFormField>
          <UFormField v-if="!editingId" label="Kata sandi" name="password">
            <UInput v-model="form.password" type="password" class="w-full" />
          </UFormField>
          <UFormField label="Peran" name="role">
            <USelect v-model="form.role" :items="roleOptions" value-key="value" label-key="label" class="w-full" />
          </UFormField>
          <p v-if="!editingId" class="text-sm text-slate-500">Kata sandi minimal 8 karakter. Beri tahu kata sandi ini kepada pengguna baru, lalu minta ia segera menggantinya lewat Profil Saya.</p>
          <p v-if="formError" class="text-sm text-red-600">{{ formError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="saveUser">Simpan Pengguna</UButton>
          <UButton color="neutral" variant="soft" @click="showForm = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showReset" title="Reset kata sandi">
      <template #body>
        <div class="flex flex-col gap-4">
          <p class="text-sm text-slate-700">Reset kata sandi untuk <strong>{{ resetTarget?.name }}</strong> ({{ resetTarget?.email }}). Kata sandi lama tidak lagi berlaku.</p>
          <UFormField label="Kata sandi baru" name="newPassword">
            <UInput v-model="resetForm.newPassword" type="password" class="w-full" />
          </UFormField>
          <UFormField label="Konfirmasi kata sandi baru" name="confirmPassword">
            <UInput v-model="resetForm.confirmPassword" type="password" class="w-full" />
          </UFormField>
          <p v-if="resetError" class="text-sm text-red-600">{{ resetError }}</p>
        </div>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton @click="saveReset">Reset Kata Sandi</UButton>
          <UButton color="neutral" variant="soft" @click="showReset = false">Batal</UButton>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="showToggle" :title="toggleTarget?.active === false ? 'Aktifkan pengguna' : 'Nonaktifkan pengguna'">
      <template #body>
        <p class="text-sm text-slate-700">{{ toggleTarget?.active === false ? 'Aktifkan ' : 'Nonaktifkan ' }}<strong>{{ toggleTarget?.name }}</strong> ({{ toggleTarget?.email }})? {{ toggleTarget?.active === false ? 'Ia dapat masuk lagi.' : 'Ia tidak dapat masuk sampai diaktifkan kembali.' }}</p>
        <p v-if="toggleError" class="text-sm text-red-600 mt-3">{{ toggleError }}</p>
      </template>
      <template #footer>
        <div class="flex gap-2">
          <UButton :color="toggleTarget?.active === false ? 'success' : 'error'" @click="confirmToggle">{{ toggleTarget?.active === false ? 'Aktifkan' : 'Nonaktifkan' }}</UButton>
          <UButton color="neutral" variant="soft" @click="showToggle = false">Batal</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { useSession } from '~/composables/useZakat'

const { authFetch, isKepala, user, restore } = useSession()
const users = ref<any[]>([])
const usersError = ref('')
const usersSaved = ref('')
const showForm = ref(false)
const showReset = ref(false)
const showToggle = ref(false)
const editingId = ref('')
const form = ref({ name: '', email: '', password: '', role: 'bendahara' })
const formError = ref('')
const resetTarget = ref<any>(null)
const resetForm = ref({ newPassword: '', confirmPassword: '' })
const resetError = ref('')
const toggleTarget = ref<any>(null)
const toggleError = ref('')

const roleOptions = [
  { value: 'bendahara', label: 'Bendahara' },
  { value: 'sekretaris', label: 'Sekretaris' },
  { value: 'kepala', label: 'Kepala TPQ' }
]
const userColumns = [
  { accessorKey: 'id', header: 'Kode' },
  { accessorKey: 'name', header: 'Nama' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'role', header: 'Peran' },
  { accessorKey: 'active', header: 'Status' },
  { id: 'actions', header: 'Aksi' }
]

function roleLabel(role: string) {
  if (role === 'bendahara') return 'Bendahara'
  if (role === 'sekretaris') return 'Sekretaris'
  if (role === 'kepala') return 'Kepala TPQ'
  return role || ''
}

async function readError(res: any, fallback: string) {
  try {
    const data = await res.json()
    if (data.error) return data.error
  } catch (error) {
    return fallback
  }
  return fallback
}

async function loadUsers() {
  usersError.value = ''
  try {
    const res = await authFetch('/users')
    if (!res.ok) {
      usersError.value = 'Gagal memuat daftar pengguna.'
      return
    }
    const body = await res.json()
    users.value = body.data || []
  } catch (error) {
    usersError.value = 'Gagal memuat daftar pengguna.'
  }
}

function openCreate() {
  editingId.value = ''
  form.value = { name: '', email: '', password: '', role: 'bendahara' }
  formError.value = ''
  showForm.value = true
}

function openEdit(item: any) {
  editingId.value = item.id
  form.value = { name: item.name, email: item.email, password: '', role: item.role }
  formError.value = ''
  showForm.value = true
}

async function saveUser() {
  formError.value = ''
  if (!form.value.name.trim() || !form.value.email.trim()) {
    formError.value = 'Nama dan email wajib diisi.'
    return
  }
  if (!editingId.value && (!form.value.password || form.value.password.length < 8)) {
    formError.value = 'Kata sandi minimal 8 karakter.'
    return
  }
  const body = editingId.value
    ? JSON.stringify({ name: form.value.name.trim(), email: form.value.email.trim(), role: form.value.role })
    : JSON.stringify({ name: form.value.name.trim(), email: form.value.email.trim(), password: form.value.password, role: form.value.role })
  const res = editingId.value
    ? await authFetch('/users/' + editingId.value, { method: 'PUT', body })
    : await authFetch('/users', { method: 'POST', body })
  if (!res.ok) {
    formError.value = await readError(res, 'Gagal menyimpan pengguna.')
    return
  }
  showForm.value = false
  usersSaved.value = editingId.value ? 'Pengguna ' + form.value.name + ' diperbarui.' : 'Pengguna ' + form.value.name + ' ditambahkan.'
  await loadUsers()
}

function openReset(item: any) {
  resetTarget.value = item
  resetForm.value = { newPassword: '', confirmPassword: '' }
  resetError.value = ''
  showReset.value = true
}

async function saveReset() {
  resetError.value = ''
  if (!resetForm.value.newPassword || resetForm.value.newPassword.length < 8) {
    resetError.value = 'Kata sandi baru minimal 8 karakter.'
    return
  }
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    resetError.value = 'Konfirmasi kata sandi baru tidak sama.'
    return
  }
  const res = await authFetch('/users/' + resetTarget.value.id, { method: 'PUT', body: JSON.stringify({ password: resetForm.value.newPassword }) })
  if (!res.ok) {
    resetError.value = await readError(res, 'Gagal mereset kata sandi.')
    return
  }
  showReset.value = false
  usersSaved.value = 'Kata sandi ' + resetTarget.value.name + ' direset.'
  await loadUsers()
}

function askToggle(item: any) {
  toggleTarget.value = item
  toggleError.value = ''
  showToggle.value = true
}

async function confirmToggle() {
  toggleError.value = ''
  const next = toggleTarget.value.active === false
  const res = await authFetch('/users/' + toggleTarget.value.id, { method: 'PUT', body: JSON.stringify({ active: next }) })
  if (!res.ok) {
    toggleError.value = await readError(res, 'Gagal mengubah status pengguna.')
    return
  }
  showToggle.value = false
  usersSaved.value = next ? 'Pengguna ' + toggleTarget.value.name + ' diaktifkan.' : 'Pengguna ' + toggleTarget.value.name + ' dinonaktifkan.'
  await loadUsers()
}

onMounted(async () => {
  restore()
  if (isKepala.value) await loadUsers()
})
</script>
