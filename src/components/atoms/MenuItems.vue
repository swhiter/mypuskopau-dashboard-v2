<template>
  <RouterLink :to="menu.href" class="menu">
    {{ menu.title }}
  </RouterLink>
</template>

<script setup lang="ts">
import type { MenuItem } from '@/types/MainComponents';

interface Props {
  menu: MenuItem
}

const props = withDefaults(defineProps<Props>(), {
  // 
})
</script>

<style scoped>
.menu {
  @apply flex w-full px-8 py-2 font-medium hover:text-accentPurple
}

.router-link-active {
  @apply bg-white text-accentPurple border-r-4 border-accentPurple
}
</style>