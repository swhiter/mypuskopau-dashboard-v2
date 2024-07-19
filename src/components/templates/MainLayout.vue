<template>
  <div class="flex flex-col w-screen h-dvh max-h-dvh">
    <TopNavbar />
    <div class="flex flex-1 max-w-full">
      <SideNavbar />
      <div class="w-full max-w-full">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SideNavbar from '@/components/organisms/SideNavbar.vue';
import TopNavbar from '@/components/organisms/TopNavbar.vue';
</script>

<style scoped></style>