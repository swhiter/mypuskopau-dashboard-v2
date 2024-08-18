<template>
  <div class="flex items-center justify-center space-x-2">
    <button class="group" type="button" @click="edit()" v-if="!hideEdit">
      <span class="material-symbols-outlined">edit</span>
      <div class="button-popup">
        {{ t('label.update') }}
      </div>
    </button>
    <button class="group" type="button" @click="emits('detail', value)" v-if="!hideDetail">
      <span class="material-symbols-outlined">order_approve</span>
      <div class="button-popup">
        {{ t('label.detail') }}
      </div>
    </button>
    <button class="group" type="button" @click="emits('disburse', value)" v-if="!hideDisburse">
      <span class="material-symbols-outlined">payments</span>
      <div class="button-popup">
        {{ t('label.disburse') }}
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  value: number | string | boolean | object | unknown
  hideEdit?: boolean
  hideDetail?: boolean
  hideDisburse?: boolean
}

const emits = defineEmits<{
  edit: [edit: any]
  detail: [detail: any]
  disburse: [disburse: any]
}>()

const props = withDefaults(defineProps<Props>(), {
  hideEdit: false,
  hideDetail: false,
  hideDisburse: false
})

const edit = () => {
  emits('edit', props.value)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
button {
  @apply flex p-1.5 bg-buttonBiGray text-white rounded-lg relative
}

.button-popup {
  @apply absolute -top-9 left-1/2 transform -translate-x-1/2 bg-buttonBiGray border border-white rounded-lg shadow px-3 py-1 hidden group-hover:block z-10
}
</style>