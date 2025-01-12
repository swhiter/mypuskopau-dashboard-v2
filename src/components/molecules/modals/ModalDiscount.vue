<template>
    <ModalBaseWithHeader :title="`${title} ${t('title.discountManagement')}`" has-save-button :is-add="isAdd" :loading="modalLoading"
      :button-loading="buttonLoading" form="car-form" :submitted="submitted">
      <Form id="car-form" class="flex" @submit="submit">
      <div class="w-3/4 grid grid-rows-3 gap-2">
        <InputForm
          name="discount"
          v-model="discount"
          :label="t('names.discount')"
          is-separate-row
          bordered
          suffix="%"
          :rules="{ 'required': true, 'numeric': true }"
        />
        <div class="form-group">
          <label for="statusDiscount">{{ t('names.statusDiscount') }}</label>
          <select
            id="statusDiscount"
            v-model="statusDiscount"
            class="form-select border rounded w-full"
            :rules="{ 'required': true }"
          >
            <option :value="0">{{ t('label.inactive') }}</option>
            <option :value="1">{{ t('label.active') }}</option>
          </select>
        </div>
      </div>
    </Form>
    </ModalBaseWithHeader>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
  import { useToasterStore } from '@/stores/toaster';
  import type { Discount } from '@/types/Data';
  import { onMounted, ref, type Ref } from 'vue';
  import { defineRule, Form } from 'vee-validate';
  import InputForm from '@/components/atoms/InputForm.vue';
  import { faPen } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import CarPlaceholder from '@/assets/images/car-placeholder.webp';
  import { handleErrorResponse } from '@/utils/common';
  import carsService from '@/services/drivers/cars.api';
import discountsService from '@/services/drivers/discount.api';
  
  const { t } = useI18n()
  const toast = useToasterStore()
  
  interface Props {
    title: string
    id?: number
    readonly?: boolean
    isAdd?: boolean
    data: Discount
  }
  
  const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    isAdd: false
  })
  
  const discount: Ref<number | string> = ref('');
  const statusDiscount: Ref<number> = ref(0)
  
  const modalLoading: Ref<boolean> = ref(false)
  const buttonLoading: Ref<boolean> = ref(false)
  const submitted: Ref<boolean> = ref(false)
  
  const fileInputRef: Ref<HTMLInputElement | null> = ref(null)
  
  const read = (): void => {
    if (props.id) {
      modalLoading.value = true
      discount.value = props.data.discount
      statusDiscount.value = props.data.status
      modalLoading.value = false
    }
  }
  
  
  const submit = async (): Promise<void> => {
    const payload = {
        discount: parseFloat(discount.value.toString()),
        status: parseFloat(statusDiscount.value.toString())
  }
  buttonLoading.value = true
  try {
    if (props.id) {
      await discountsService.updateDiscount(payload, props.id)
    } else {
      await discountsService.createDiscount(payload)
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
  }
  
  onMounted(() => {
    read()
  })
  </script>
  
  <style scoped>
  .image-group {
    @apply relative flex w-full md:w-4/5 self-center
  }
  
  .image-container {
    @apply w-full aspect-square rounded-full border-2 overflow-hidden border-black bg-primarySkyBlue
  }
  
  .image {
    @apply min-w-full min-h-full object-cover
  }
  
  .btn-image-update {
    @apply absolute bottom-0 right-0 rounded-full bg-primaryDarkBlue hover:bg-hoverDarkBlue text-white px-2 aspect-square
  }
  
  .form-group {
  @apply mb-4;
}
.form-select {
  @apply border rounded px-2 py-1 w-full;
}
  </style>