<template>
  <component :is="iconComponent" v-if="iconComponent" :size="Number(size) || 18" class="shrink-0" />
</template>

<script setup lang="ts">
import {
  Archive,
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Calculator,
  ChartColumn,
  ChartPie,
  Clock,
  Copy,
  FileText,
  HandCoins,
  HandHeart,
  LayoutDashboard,
  LogOut,
  Pencil,
  Receipt,
  Save,
  Scale,
  Star,
  Trash2,
  Trophy,
  User,
  UserPlus,
  Users,
  Wallet,
  Wheat,
  XCircle
} from 'lucide-vue-next'

const props = defineProps<{ name: string, size?: number | string }>()

const icons: Record<string, any> = {
  'lucide:archive': Archive,
  'lucide:arrow-right': ArrowRight,
  'lucide:arrow-up': ArrowUp,
  'lucide:badge-check': BadgeCheck,
  'lucide:calculator': Calculator,
  'lucide:chart-column': ChartColumn,
  'lucide:chart-pie': ChartPie,
  'lucide:clock': Clock,
  'lucide:copy': Copy,
  'lucide:file-text': FileText,
  'lucide:hand-coins': HandCoins,
  'lucide:hand-heart': HandHeart,
  'lucide:layout-dashboard': LayoutDashboard,
  'lucide:log-out': LogOut,
  'lucide:pencil': Pencil,
  'lucide:receipt': Receipt,
  'lucide:save': Save,
  'lucide:scale': Scale,
  'lucide:star': Star,
  'lucide:trash-2': Trash2,
  'lucide:trophy': Trophy,
  'lucide:user': User,
  'lucide:user-plus': UserPlus,
  'lucide:users': Users,
  'lucide:wallet': Wallet,
  'lucide:wheat': Wheat,
  'lucide:x-circle': XCircle
}

const iconComponent = computed(() => icons[props.name] || null)
</script>
