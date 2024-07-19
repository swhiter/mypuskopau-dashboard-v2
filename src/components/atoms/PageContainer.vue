<template>
  <main class="container">
    <h3 class="title">{{ title }}</h3>
    <slot />
  </main>
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
  @apply font-body p-6 space-y-6 min-w-full max-w-full
}

.title {
  @apply text-xl text-accentGray font-medium
}
</style>