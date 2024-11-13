<template>
  <ModalBaseWithHeader :title="`${title} ${t('title.carData')}`" has-save-button :is-add="isAdd" :loading="modalLoading"
    :button-loading="buttonLoading" form="car-form" :submitted="submitted">
    <Form id="car-form" class="flex" @submit="submit">
      <div class="w-3/4 grid grid-rows-3 gap-2">
        <InputForm name="carName" v-model="name" :label="t('names.carName')" is-separate-row bordered
          :rules="{ 'required': true }" />
        <div class="flex w-full space-x-2">
          <InputForm name="driverPercentage" v-model="driverPercentage" :label="t('names.driverPercentage')"
            is-separate-row bordered suffix="%" :rules="{ 'required': true, 'numeric': true }" type="number" />
          <InputForm name="managementPercentage" v-model="managementPercentage" :label="t('names.managementPercentage')"
            is-separate-row bordered suffix="%" :rules="{ 'required': true, 'numeric': true }" type="number" />
        </div>
        <InputForm name="description" v-model="description" :label="t('names.description')" is-separate-row bordered
          :rules="{ 'required': true }" />
      </div>
      <div class="w-1/4 flex flex-col space-y-2">
        <span class="text-sm 2xl:text-base flex items-center font-semibold">
          {{ t('label.profilePhoto') }}
        </span>
        <div class="image-group">
          <div class="image-container">
            <img :src="readImage(images)" alt="Photo" class="image" v-if="images">
            <img :src="photo" alt="Photo" class="image" v-else-if="photo">
            <img :src="CarPlaceholder" alt="Photo" class="image" v-else>
          </div>
          <button class="btn-image-update" @click.prevent="triggerFileInput" v-if="!readonly">
            <FontAwesomeIcon class="fa-fw" :icon="faPen" />
          </button>
          <input type="file" ref="fileInputRef" @change="onFileAdd" accept="image/*" class="hidden">
        </div>
      </div>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
import { useToasterStore } from '@/stores/toaster';
import type { Car } from '@/types/Data';
import { onMounted, ref, type Ref } from 'vue';
import { defineRule, Form } from 'vee-validate';
import InputForm from '@/components/atoms/InputForm.vue';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import CarPlaceholder from '@/assets/images/car-placeholder.webp';
import { handleErrorResponse } from '@/utils/common';
import carsService from '@/services/drivers/cars.api';

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id?: number
  readonly?: boolean
  isAdd?: boolean
  data: Car
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  isAdd: false
})

const name: Ref<string> = ref('')
const driverPercentage: Ref<number> = ref(0)
const managementPercentage: Ref<number> = ref(0)
const photo: Ref<string> = ref('')
const images: Ref<File | null> = ref(null)
const description: Ref<string> = ref('')

const modalLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
const submitted: Ref<boolean> = ref(false)

const fileInputRef: Ref<HTMLInputElement | null> = ref(null)

const read = (): void => {
  if (props.id) {
    modalLoading.value = true
    name.value = props.data.carName
    driverPercentage.value = props.data.driverPercentage
    managementPercentage.value = props.data.managementPercentage
    photo.value = props.data.photo
    description.value = props.data.description
    modalLoading.value = false
  }
}

const onFileAdd = (e: Event): void => {
  const file = (e.target as HTMLInputElement).files
  if (file) {
    images.value = file.item(0)
  }
}

const readImage = (image: File): string => {
  return URL.createObjectURL(image)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const submit = async (): Promise<void> => {
  const form = new FormData()
  buttonLoading.value = true

  form.append('carName', name.value)
  form.append('driverPercentage', driverPercentage.value.toString())
  form.append('managementPercentage', managementPercentage.value.toString())
  form.append('description', description.value)
  if (images.value) {
    form.append('photo', images.value)
  }

  try {
    if (props.id) {
      await carsService.updateCar(form, props.id)
    } else {
      await carsService.createCar(form)
    }
    toast.success({ text: t('alert.successSave') })
    buttonLoading.value = false
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
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