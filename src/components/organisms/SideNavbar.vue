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
    title: 'Pelacakan Pengemudi',
    href: '/driver-tracking',
    icon: '/icons/pelacakan-pengemudi.svg',
    isMdi: false
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
  @apply flex flex-col w-fit h-full font-body
}

.sidebar-background {
  @apply flex flex-col h-full w-72 bg-primaryBlue
}

.sidebar-menus {
  @apply flex flex-col space-y-1
}
</style>