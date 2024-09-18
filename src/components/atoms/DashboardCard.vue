<template>
  <div class="card-container">
    <span class="title">
      {{ title }}
    </span>
    <slot />
    <ComponentLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import ComponentLoading from './ComponentLoading.vue';

interface Props {
  title: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
</script>

<style scoped>
.card-container {
  @apply flex flex-col w-full p-6 bg-white rounded-lg shadow-lg space-y-2 border border-buttonGray
}

.title {
  @apply flex w-full font-semibold
}
</style>