<script setup lang="ts">
import { RouterView } from 'vue-router'
import '@/utils/validationRules'
import 'leaflet/dist/leaflet.css'
import router from './router';
import { useAuthStore } from './stores/auth';
import { getCurrentUser } from './utils/common';
import { homeRouteFor, routeAllowed } from './utils/roles';
import ToasterNotification from './components/atoms/ToasterNotification.vue';
import ModalWindow from './components/atoms/ModalWindow.vue';

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
      return
    }
    // Halaman awal & pembatasan route mengikuti role (mis. bendahara -> /payroll)
    const role = getCurrentUser().role
    if (to.path == '/' || !routeAllowed(role, to.path)) {
      next({ path: homeRouteFor(role) })
      return
    }
    next()
  } else {
    next()
  }
})
</script>

<template>
  <RouterView />
  <ModalWindow />
  <ToasterNotification />
</template>
