<template>
  <ModalBaseWithHeader :title="title" :has-save-button="!readonly" form="update-driver" :loading="modalLoading"
    :button-loading="buttonLoading" :submitted="submitted">
    <Form id="update-driver" class="form-container" @submit="onSubmit">
      <div class="flex w-4/5 space-x-4">
        <div class="w-1/2">
          <InputForm name="fullname" v-model="userInfo.name" :label="t('names.fullname')" bordered is-separate-row
            semibold-label :rules="{ 'required': true }" :disabled="readonly" />
          <InputForm name="code" v-model="userInfo.vehicleCode" :label="t('names.code')" bordered is-separate-row
            semibold-label :rules="{ 'required': true }" :disabled="readonly" />
          <InputForm name="username" v-model="userInfo.userId" :label="t('label.driverId')" bordered is-separate-row
            semibold-label :rules="{ 'required': true }" disabled />
        </div>
        <div class="w-1/2">
          <InputForm name="idCardNumber" v-model="userInfo.nik" :label="t('names.idCardNumber')" bordered
            is-separate-row semibold-label :rules="{ 'required': true }" :disabled="readonly" />
          <InputForm name="licensePlate" v-model="userInfo.licensePlate" :label="t('names.licensePlate')" bordered
            is-separate-row semibold-label :rules="{ 'required': true }" :disabled="readonly" />
          <InputForm name="totalIncome" v-model="userInfo.totalIncome" :label="t('names.totalIncome')" bordered
            is-separate-row semibold-label :rules="{ 'required': true }" disabled />
        </div>
      </div>
      <div class="flex flex-col w-1/5 space-y-2">
        <span class="text-sm 2xl:text-base flex items-center font-semibold">
          {{ t('label.profilePhoto') }}
        </span>
        <div class="image-group">
          <div class="image-container">
            <img :src="readImage(images)" alt="Photo" class="image" v-if="images">
            <img :src="userInfo.photo" alt="Photo" class="image" v-else>
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
import { Form } from 'vee-validate';
import ModalBaseWithHeader from './ModalBaseWithHeader.vue';
import InputForm from '@/components/atoms/InputForm.vue';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Driver } from '@/types/Data';
import driverService from '@/services/drivers/drivers.api';
import { handleErrorResponse } from '@/utils/common';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { useToasterStore } from '@/stores/toaster';

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id: number
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const userInfo: Ref<Driver> = ref({
  id: 0,
  userId: '',
  name: '',
  nik: '',
  photo: '',
  vehicleCode: '',
  licensePlate: '',
  lastLongitude: 0,
  lastLatitude: 0,
  totalIncome: 0,
  status: 1
})
const images: Ref<File | null> = ref(null)

const fileInputRef: Ref<HTMLInputElement | null> = ref(null)

const modalLoading: Ref<boolean> = ref(false)
const buttonLoading: Ref<boolean> = ref(false)
const submitted: Ref<boolean> = ref(false)

const triggerFileInput = () => {
  fileInputRef.value?.click()
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

const getDriverById = async (): Promise<void> => {
  modalLoading.value = true
  try {
    const response = await driverService.getDriverById(props.id)
    userInfo.value = response.data
    modalLoading.value = false
  } catch (error) {
    handleErrorResponse(error)
    modalLoading.value = false
  }
}

const onSubmit = async (): Promise<void> => {
  const form = new FormData()
  buttonLoading.value = true

  Object.entries(userInfo.value).forEach(([key, value]) => {
    if (key === 'photo' && images.value) {
      form.append(key, images.value)
    } else {
      form.append(key, value)
    }
  })

  try {
    await driverService.updateDriver(form, userInfo.value.id!)
    toast.success({ text: t('alert.successSave') })
    buttonLoading.value = false
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
    buttonLoading.value = false
  }
}

onMounted(() => {
  getDriverById()
})
</script>

<style scoped>
.form-container {
  @apply flex space-x-4
}

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