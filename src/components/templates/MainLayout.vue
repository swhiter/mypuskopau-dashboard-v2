<template>
  <div class="flex flex-col w-dvw h-dvh max-h-dvh overflow-x-hidden">
    <TopNavbar />
    <SideNavbar />
    <div class="w-[calc(100%-288px)] ml-72 mt-16">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideNavbar from '@/components/organisms/SideNavbar.vue';
import TopNavbar from '@/components/organisms/TopNavbar.vue';
</script>

<style scoped></style>