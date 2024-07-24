<script setup lang="ts">
import { RouterView } from 'vue-router'
import '@/utils/validationRules'
import 'leaflet/dist/leaflet.css'
import router from './router';
import { useAuthStore } from './stores/auth';
import ToasterNotification from './components/atoms/ToasterNotification.vue';
import ModalBase from './components/atoms/ModalBase.vue';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
  }
}

const authStore = useAuthStore()

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.token) {
      next({
        path: '/login',
        query: {
          next: to.fullPath
        }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})
</script>

<template>
  <RouterView />
  <ModalBase />
  <ToasterNotification />
</template>
