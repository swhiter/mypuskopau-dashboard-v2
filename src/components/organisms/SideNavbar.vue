<template>
  <div class="sidebar-container">
    <aside class="sidebar-background">
      <SidebarProfile :name="name" :username="username" :image="userImage" />
      <div class="sidebar-menus">
        <template v-for="entry in visibleMenus" :key="entry.title">
          <MenuGroup v-if="isMenuGroup(entry)" :group="entry" />
          <MenuItems v-else :menu="entry" />
        </template>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import { filterMenusForRole, isMenuGroup, type MenuEntry } from '@/utils/menu';
import MenuItems from '../atoms/MenuItems.vue';
import MenuGroup from '../atoms/MenuGroup.vue';
import SidebarProfile from '../molecules/misc/SidebarProfile.vue';
import { getCurrentUser } from '@/utils/common';
import defaultImage from '@/assets/images/user.png';

const name: Ref<string> = ref('')
const username: Ref<string> = ref('')
const userImage: Ref<string> = ref('')

const menus: MenuEntry[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    isMdi: true
  },
  {
    title: 'Kas',
    icon: 'account_balance',
    isMdi: true,
    children: [
      { title: 'Dashboard Kas', href: '/cash', icon: 'account_balance_wallet', isMdi: true },
      { title: 'Arus Kas', href: '/cash/movements', icon: 'swap_horiz', isMdi: true }
    ]
  },
  {
    title: 'Transaksi',
    icon: 'receipt',
    isMdi: true,
    children: [
      { title: 'Manajemen Pesanan', href: '/order-management', icon: 'list_alt', isMdi: true },
      { title: 'Buat Struk Manual', href: '/orders/create-manual', icon: 'add_shopping_cart', isMdi: true },
      { title: 'Input Struk Vendor', href: '/vendor-orders', icon: 'receipt_long', isMdi: true },
      { title: 'Trip Bermasalah', href: '/unfinished-trips', icon: 'report_problem', isMdi: true }
    ]
  },
  {
    title: 'Pengemudi',
    icon: 'badge',
    isMdi: true,
    children: [
      { title: 'Manajemen Pengemudi', href: '/driver-management', icon: '/icons/manajemen-pengemudi.svg', isMdi: false },
      { title: 'Pelacakan Pengemudi', href: '/driver-tracking', icon: '/icons/pelacakan-pengemudi.svg', isMdi: false },
      { title: 'Ulasan Argo', href: '/argo-reviews', icon: 'reviews', isMdi: true }
    ]
  },
  {
    title: 'Keuangan',
    icon: 'account_balance_wallet',
    isMdi: true,
    children: [
      { title: 'Penggajian Driver', href: '/payroll', icon: 'payments', isMdi: true },
      { title: 'Laporan Pendapatan', href: '/reports/income', icon: 'bar_chart', isMdi: true }
    ]
  },
  {
    title: 'Tarif & Diskon',
    icon: 'sell',
    isMdi: true,
    children: [
      { title: 'Manajemen Tarif', href: '/tariff-management', icon: '/icons/manajemen-tarif.svg', isMdi: false },
      { title: 'Manajemen Tarif Argo', href: '/argo-tariff-management', icon: '/icons/manajemen-tarif.svg', isMdi: false },
      { title: 'Satuan Tarif Argo', href: '/tariff-unit-setting', icon: 'straighten', isMdi: true },
      { title: 'Manajemen Diskon', href: '/discount-management', icon: 'money', isMdi: true }
    ]
  },
  {
    title: 'Master Data',
    icon: 'database',
    isMdi: true,
    children: [
      { title: 'Manajemen Armada', href: '/car-management', icon: 'local_taxi', isMdi: true },
      { title: 'Manajemen Staf', href: '/staff-management', icon: '/icons/manajemen-staf.svg', isMdi: false },
      { title: 'Manajemen Penumpang', href: '/passenger-management', icon: 'people', isMdi: true }
    ]
  }
]

// Bendahara hanya melihat menu yang diizinkan untuk role-nya
const role: Ref<string | undefined> = ref(undefined)
const visibleMenus = computed(() => filterMenusForRole(menus, role.value))

onMounted(() => {
  const user = getCurrentUser()
  role.value = user.role
  name.value = `${user.userDetail.firstName} ${user.userDetail.lastName}`
  username.value = user.userDetail.userId
  userImage.value = user.userDetail.photo ? user.userDetail.photo : defaultImage
})
</script>

<style scoped>
.sidebar-container {
  @apply flex flex-col w-fit h-full font-body fixed z-10 shadow-lg
}

.sidebar-background {
  @apply flex flex-col w-72 h-[calc(100%-64px)] bg-primaryBlue mt-16
}

.sidebar-menus {
  @apply flex flex-col space-y-1 overflow-y-auto pb-4
}
</style>
