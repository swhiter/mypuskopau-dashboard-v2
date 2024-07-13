<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="toasterStore.toasts.length" class="toast-wrapper">
        <TransitionGroup name="toast" tag="ul">
          <li v-for="toast in toasterStore.toasts" class="toast-list" :class="toastColorMap[toast.status]"
            :key="toast.id">
            <span class="toast-icon">
              <FontAwesomeIcon class="fa-fw" :icon="toastIconMap[toast.status]" />
            </span>
            <span class="toast-text">
              {{ toast.text }}
            </span>
          </li>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useToasterStore, type TToastStatus } from '@/stores/toaster';
import { FontAwesomeIcon, type FontAwesomeIconProps } from '@fortawesome/vue-fontawesome';
import { faCircleCheck, faCircleExclamation, faCircleInfo, faCircleXmark } from '@fortawesome/free-solid-svg-icons';

const toasterStore = useToasterStore()

const toastColorMap: Record<TToastStatus, string> = {
  success: 'success',
  info: 'info',
  warning: 'warning',
  error: 'error'
}

const toastIconMap: Record<TToastStatus, FontAwesomeIconProps> = {
  success: faCircleCheck,
  info: faCircleInfo,
  warning: faCircleExclamation,
  error: faCircleXmark
}
</script>

<style>
.toast-enter-from,
.toast-leave-to {
  @apply transform translate-x-full opacity-0
}

.toast-enter-active,
.toast-leave-active {
  @apply transition-all ease-in-out duration-150
}

.toast-wrapper {
  @apply fixed right-4 top-4 z-50
}

.toast-list {
  @apply flex items-center space-x-2 border border-transparent rounded-lg px-5 py-2
}

.toast-icon {
  @apply text-xl
}

.toast-text {
  @apply font-medium
}

.success {
  @apply bg-green-600 text-white
}

.info {
  @apply bg-cyan-600 text-white
}

.warning {
  @apply bg-yellow-500 text-black
}

.error {
  @apply bg-red-500 text-white
}
</style>