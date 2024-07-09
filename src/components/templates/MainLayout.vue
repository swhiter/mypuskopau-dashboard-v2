<template>
  <div class="flex flex-col w-full h-dvh max-h-dvh">
    <TopNavbar />
    <div class="flex h-full">
      <SideNavbar />
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import SideNavbar from '../organisms/SideNavbar.vue';
import TopNavbar from '../organisms/TopNavbar.vue';

</script>

<style scoped></style>