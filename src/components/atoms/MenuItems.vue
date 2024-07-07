<template>
  <RouterLink :to="menu.href" class="menu">
    <span class="material-symbols-outlined" v-if="menu.isMdi">
      {{ menu.icon }}
    </span>
    <img :src="menu.icon" alt="Icons" class="w-6" v-else>
    <span>{{ menu.title }}</span>
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
  @apply flex w-full px-8 py-2 font-medium hover:text-accentPurple space-x-2
}

.router-link-active {
  @apply bg-white text-accentPurple border-r-4 border-accentPurple
}
</style>