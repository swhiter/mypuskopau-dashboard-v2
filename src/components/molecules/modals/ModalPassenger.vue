<template>
    <ModalBaseWithHeader :title="`${title} ${t('title.passengerManagement')}`" has-save-button :is-add="isAdd" :loading="modalLoading"
      :button-loading="buttonLoading" form="car-form" :submitted="submitted">
      <Form id="car-form" class="flex" @submit="submit">
        <div class="w-3/4 grid grid-rows-3 gap-2">
          <InputForm name="maxPassenger" v-model="maxPass" :label="t('names.maxPassenger')" is-separate-row bordered
            :rules="{ 'required': true }" />
          <InputForm name="charging" v-model="addCharge" :label="t('names.charging')" is-separate-row bordered
            :rules="{ 'required': true , 'numeric': true }" />
        </div>
      </Form>
    </ModalBaseWithHeader>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
  import { useToasterStore } from '@/stores/toaster';
  import type { Passenger } from '@/types/Data';
  import { onMounted, ref, type Ref } from 'vue';
  import { defineRule, Form } from 'vee-validate';
  import InputForm from '@/components/atoms/InputForm.vue';
  import { faPen } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
  import CarPlaceholder from '@/assets/images/car-placeholder.webp';
  import { handleErrorResponse } from '@/utils/common';
  import carsService from '@/services/drivers/cars.api';
import passengersService from '@/services/drivers/passenger.api';
  
  const { t } = useI18n()
  const toast = useToasterStore()
  
  interface Props {
    title: string
    id?: number
    readonly?: boolean
    isAdd?: boolean
    data: Passenger
  }
  
  const props = withDefaults(defineProps<Props>(), {
    readonly: false,
    isAdd: false
  })
  
  const maxPass: Ref<string> = ref('')
  const addCharge: Ref<number> = ref(0)
  
  const modalLoading: Ref<boolean> = ref(false)
  const buttonLoading: Ref<boolean> = ref(false)
  const submitted: Ref<boolean> = ref(false)
  
  const fileInputRef: Ref<HTMLInputElement | null> = ref(null)
  
  const read = (): void => {
    if (props.id) {
      modalLoading.value = true
      maxPass.value = props.data.maxPassenger
      addCharge.value = props.data.price
      modalLoading.value = false
    }
  }
  
  
  const submit = async (): Promise<void> => {
    const payload = {
    maxPassenger: parseFloat(maxPass.value.toString()),
    price: parseFloat(addCharge.value.toString())
  }
  buttonLoading.value = true
  try {
    if (props.id) {
      await passengersService.updatePassenger(payload, props.id)
    } else {
      await passengersService.createPassenger(payload)
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
  </style>