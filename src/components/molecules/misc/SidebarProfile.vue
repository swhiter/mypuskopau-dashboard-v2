<template>
  <div class="sidebar-profile">
    <div class="image-container">
      <img src="@/assets/images/user.png" alt="User Profile">
    </div>
    <div class="userdata-container">
      <span class="text-name">{{ name }}</span>
      <span class="text-username">{{ username }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  username: string
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