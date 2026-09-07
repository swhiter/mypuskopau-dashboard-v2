<template>
  <div class="sidebar-container">
    <aside class="sidebar-background">
      <SidebarProfile :name="name" :username="username" :image="userImage" />
      <div class="sidebar-menus">
        <MenuItems v-for="(item, index) in menus" :key="index" :menu="item" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import MenuItems from '../atoms/MenuItems.vue';
import type { MenuItem } from '@/types/MainComponents';
import SidebarProfile from '../molecules/misc/SidebarProfile.vue';
import { getCurrentUser } from '@/utils/common';
import defaultImage from '@/assets/images/user.png';

const name: Ref<string> = ref('')
const username: Ref<string> = ref('')
const userImage: Ref<string> = ref('')

const menus: Ref<MenuItem[]> = ref([
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    isMdi: true
  },
  {
    title: 'Buat Struk Manual',
    href: '/orders/create-manual',
    icon: 'add_shopping_cart',
    isMdi: true
  },
  {
    title: 'Laporan Pendapatan',
    href: '/reports/income',
    icon: 'bar_chart',
    isMdi: true
  },
  {
    title: 'Manajemen Pengemudi',
    href: '/driver-management',
    icon: '/icons/manajemen-pengemudi.svg',
    isMdi: false
  },
  {
    title: 'Manajemen Staf',
    href: '/staff-management',
    icon: '/icons/manajemen-staf.svg',
    isMdi: false
  },
  {
    title: 'Manajemen Pesanan',
    href: '/order-management',
    icon: 'list_alt',
    isMdi: true
  },
  {
    title: 'Manajemen Tarif',
    href: '/tariff-management',
    icon: '/icons/manajemen-tarif.svg',
    isMdi: false
  },
  {
    title: 'Manajemen Tarif Argo',
    href: '/Argo-tariff-management',
    icon: '/icons/manajemen-tarif.svg',
    isMdi: false
  },
  {
    title: 'Manajemen Armada',
    href: '/car-management',
    icon: 'local_taxi',
    isMdi: true
  },
  {
    title: 'Manajemen Penumpang',
    href: '/passenger-management',
    icon: 'people',
    isMdi: true
  },
  {
    title: 'Manajemen Diskon',
    href: '/discount-management',
    icon: 'money',
    isMdi: true
  },
  {
    title: 'Pelacakan Pengemudi',
    href: '/driver-tracking',
    icon: '/icons/pelacakan-pengemudi.svg',
    isMdi: false
  },
  {
    title: 'Trip Bermasalah',
    href: '/unfinished-trips',
    icon: 'report_problem',
    isMdi: true
  },
  {
    title: 'Ulasan Argo',
    href: '/argo-reviews',
    icon: 'reviews',
    isMdi: true
  }
])

onMounted(() => {
  const user = getCurrentUser()
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
  @apply flex flex-col space-y-1
}
</style>