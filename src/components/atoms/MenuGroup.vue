<template>
  <div>
    <button type="button" class="group-header" :class="{ 'group-active': hasActiveChild }" :aria-expanded="isOpen"
      @click="isOpen = !isOpen">
      <span class="material-symbols-outlined" v-if="group.isMdi">{{ group.icon }}</span>
      <img :src="group.icon" alt="Icons" class="w-6" v-else>
      <span class="flex-1 text-left">{{ group.title }}</span>
      <span class="material-symbols-outlined chevron" :class="{ open: isOpen }">expand_more</span>
    </button>
    <div v-show="isOpen" class="group-children">
      <MenuItems v-for="child in group.children" :key="child.href" :menu="child" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import MenuItems from './MenuItems.vue'
import { groupContainsPath, type MenuGroup } from '@/utils/menu'

interface Props {
  group: MenuGroup
}

const props = defineProps<Props>()
const route = useRoute()

const hasActiveChild = computed(() => groupContainsPath(props.group, route.path))
const isOpen = ref(hasActiveChild.value)

// Grup otomatis terbuka saat berpindah ke salah satu sub menunya
watch(hasActiveChild, (active) => {
  if (active) isOpen.value = true
})
</script>

<style scoped>
.group-header {
  @apply flex w-full items-center px-8 py-2 font-medium hover:text-accentPurple space-x-2
}

.group-active {
  @apply text-accentPurple
}

.chevron {
  @apply transition-transform duration-200
}

.chevron.open {
  @apply rotate-180
}

.group-children {
  @apply flex flex-col space-y-1 pl-6
}
</style>
