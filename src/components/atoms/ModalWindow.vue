<template>
  <Teleport to="body">
    <Transition name="modal">
      <div class="modal-base" @click.self="modalStore.closeModal" v-if="modalStore.modalState?.component"
        aria-modal="true" role="dialog" tabindex="-1">
        <component :is="{ ...modalStore.modalState?.component }" v-bind="modalStore.modalState?.props" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useModalStore } from '@/stores/modal';
import { onUnmounted } from 'vue';
import { onMounted } from 'vue';

const modalStore = useModalStore()

// Close Modal with Escape Key
function keydownListener(event: KeyboardEvent) {
  if (event.key === 'Escape') modalStore.closeModal()
}

onMounted(() => {
  document.addEventListener('keydown', keydownListener)
})

onUnmounted(() => {
  document.removeEventListener('keydown', keydownListener)
})
</script>

<style scoped>
.modal-base {
  @apply fixed left-0 top-0 z-30 w-full h-screen grid place-items-center bg-black/30
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0
}

.modal-enter-active,
.modal-leave-active {
  @apply transition-all ease-in-out duration-200
}
</style>