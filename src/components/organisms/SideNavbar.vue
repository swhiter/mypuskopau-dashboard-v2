<template>
  <div class="sidebar-container">
    <aside class="sidebar-background">
      <MenuItems v-for="(item, index) in menus" :key="index" :menu="item" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import MenuItems from '../atoms/MenuItems.vue';
import type { MenuItem } from '@/types/MainComponents';

const menus: Ref<MenuItem[]> = ref([
  {
    title: 'Dashboard',
    href: '/'
  },
  {
    title: 'Manajemen Pengemudi',
    href: '/driver-management'
  }
])
</script>

<style scoped>
.sidebar-container {
  @apply flex w-fit h-screen
}

.sidebar-background {
  @apply h-full w-72 bg-primaryBlue
}
</style>