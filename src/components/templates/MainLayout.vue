<template>
  <TopNavbar />
  <div class="flex">
    <SideNavbar />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import SideNavbar from '../organisms/SideNavbar.vue';
import TopNavbar from '../organisms/TopNavbar.vue';

</script>

<style scoped></style>