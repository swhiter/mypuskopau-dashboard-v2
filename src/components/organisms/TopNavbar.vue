<template>
  <div class="nav-background">
    <div class="nav-logo-container">
      <img src="@/assets/images/logo.png" alt="Logo" class="nav-logo">
    </div>
    <ArrowRightStartOnRectangleIcon class="logout" @click="logout()" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth';
import { useModalStore } from '@/stores/modal';
import { useToasterStore } from '@/stores/toaster';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/solid'
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const auth = useAuthStore()
const modal = useModalStore()
const toast = useToasterStore()

const logout = () => {
  modal.openConfirmationModal(t('message.logout'))
  modal.onOk(() => {
    auth.logout()
    toast.info({ text: t('alert.successLogout') })
  })
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