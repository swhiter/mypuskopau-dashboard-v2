<template>
  <div class="space-y-1">
    <h5 class="card-title">{{ title }}</h5>
    <div class="container">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: ''
})
</script>

<style scoped>
.container {
  @apply flex flex-col max-w-full min-w-full p-4 bg-white rounded-lg border border-buttonGray shadow-lg
}

.card-title {
  @apply font-semibold text-lg
}
</style>