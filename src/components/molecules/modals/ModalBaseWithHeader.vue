<template>
  <div class="modal-container">
    <div class="modal-header">
      {{ title }}
    </div>
    <div class="modal-body">
      <slot />
      <div v-if="hasSaveButton" class="modal-button">
        <MainButton :label="$t('label.cancel')" @click="handleCancel" uniform-width outline white />
        <MainButton :label="$t('label.update')" uniform-width outline type="submit" :form="form"
          :loading="buttonLoading" :disabled="buttonLoading" />
      </div>
    </div>
    <ComponentLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import ComponentLoading from '@/components/atoms/ComponentLoading.vue';
import MainButton from '@/components/atoms/MainButton.vue';
import { useModalStore } from '@/stores/modal';
import { toRefs, watch } from 'vue';

const modal = useModalStore()

interface Props {
  title: string
  loading?: boolean
  hasSaveButton?: boolean
  form?: string
  buttonLoading?: boolean
  submitted?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  hasSaveButton: false,
  buttonLoading: false,
  submitted: false
})

const { submitted } = toRefs(props)

const handleOk = () => {
  modal.okClicked()
}

const handleCancel = () => {
  modal.cancelClicked()
}

watch(submitted, (newValue) => {
  if (newValue) {
    handleOk()
  }
})
</script>

<style scoped>
.modal-container {
  @apply bg-white w-11/12 md:w-5/6 flex flex-col rounded-lg overflow-hidden relative
}

.modal-header {
  @apply bg-buttonBiGray w-full px-8 py-3 text-white font-semibold text-lg
}

.modal-body {
  @apply w-full px-8 py-4
}

.modal-button {
  @apply flex items-end justify-end space-x-4 mt-4
}
</style>