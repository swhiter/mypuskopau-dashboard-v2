<template>
  <div class="sidebar-profile">
    <RouterLink to="/profile" class="image-container">
      <img :src="image" alt="User Profile">
    </RouterLink>
    <RouterLink to="/profile" class="userdata-container">
      <span class="text-name">{{ name }}</span>
      <span class="text-username">{{ username }}</span>
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  username: string
  image: string
}

const props = defineProps<Props>()
</script>

<style scoped>
.sidebar-profile {
  @apply py-6 flex flex-col w-full items-center justify-center space-y-2
}

.image-container {
  @apply w-1/3 rounded-full overflow-hidden border-2 border-black aspect-square
}

.image-container img {
  @apply min-w-full min-h-full
}

.userdata-container {
  @apply flex flex-col items-center justify-center
}

.text-name {
  @apply font-semibold text-textBlack2
}

.text-username {
  @apply font-medium text-textBlack2
}
</style>