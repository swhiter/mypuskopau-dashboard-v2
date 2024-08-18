<template>
  <div class="modal-container">
    <img :src="logoutImg" alt="Logout" class="w-56">
    <h5 class="text-lg font-medium text-center">{{ message }}</h5>
    <div class="flex w-full items-center justify-center space-x-4 mt-4">
      <MainButton :label="$t('label.no')" @click="handleCancel" uniform-width outline white />
      <MainButton :label="$t('label.yes')" @click="handleOk" uniform-width outline />
    </div>
  </div>
</template>

<script setup lang="ts">
import logoutImg from '@/assets/images/logout.png'
import MainButton from '@/components/atoms/MainButton.vue';
import { useModalStore } from '@/stores/modal';

const modal = useModalStore()

interface Props {
  message: string
}

const props = defineProps<Props>()

const handleOk = () => {
  modal.okClicked()
}

const handleCancel = () => {
  modal.cancelClicked()
}
</script>

<style scoped>
.modal-container {
  @apply bg-white w-5/6 sm:w-1/2 lg:w-2/5 flex flex-col items-center rounded-lg p-4
}
</style>