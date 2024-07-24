<template>
  <div class="nav-background">
    <div class="nav-logo-container">
      <img src="@/assets/images/logo.png" alt="Logo" class="nav-logo">
    </div>
    <ArrowRightStartOnRectangleIcon class="logout" @click="logout()" />
  </div>
</template>

<script setup lang="ts">
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/solid'

const logout = () => {
  // 
}
</script>

<style scoped>
.nav-background {
  @apply flex w-full items-center justify-between px-8 py-3 bg-primaryDarkBlue shadow-lg relative
}

.nav-logo-container {
  height: 6dvh;
}

.nav-logo {
  @apply h-full
}

.logout {
  @apply w-6 h-6 text-white cursor-pointer
}
</style>