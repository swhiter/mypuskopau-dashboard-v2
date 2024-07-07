<template>
  <div class="sidebar-container">
    <aside class="sidebar-background">
      <SidebarProfile :name="name" :username="username" />
      <div class="sidebar-menus">
        <MenuItems v-for="(item, index) in menus" :key="index" :menu="item" />
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import MenuItems from '../atoms/MenuItems.vue';
import type { MenuItem } from '@/types/MainComponents';
import SidebarProfile from '../molecules/misc/SidebarProfile.vue';

const name: Ref<string> = ref('Admin Putri')
const username: Ref<string> = ref('144002')

const menus: Ref<MenuItem[]> = ref([
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
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
    href: '/rates-management',
    icon: '/icons/manajemen-tarif.svg',
    isMdi: false
  },
  {
    title: 'Pelacakan Pengemudi',
    href: '/driver-tracking',
    icon: '/icons/pelacakan-pengemudi.svg',
    isMdi: false
  }
])
</script>

<style scoped>
.sidebar-container {
  @apply flex flex-col w-fit h-screen font-body
}

.sidebar-background {
  @apply flex flex-col h-full w-72 bg-primaryBlue
}

.sidebar-menus {
  @apply flex flex-col space-y-1
}
</style>