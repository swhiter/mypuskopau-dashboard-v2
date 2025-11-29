<template>
  <ModalBaseWithHeader :title="title" :has-save-button="!readonly" form="update-driver" :loading="modalLoading"
    :button-loading="buttonLoading" :submitted="submitted">
    <Form id="update-driver" class="form-container" @submit="onSubmit">
      <div class="flex w-4/5">
        <div class="grid grid-cols-2 gap-x-4 w-full">
          <InputForm name="fullname" v-model="userInfo.name" :label="t('names.fullname')" bordered is-separate-row
            semibold-label :rules="{ 'required': true }" :disabled="readonly" />

          <InputForm name="idCardNumber" v-model="userInfo.nik" :label="t('names.idCardNumber')" bordered
            is-separate-row semibold-label :rules="{ 'required': true, 'numeric': true, 'length': 16 }"
            :disabled="readonly" />

          <!-- 👇 Nomor HP -->
          <InputForm name="phoneNumber" v-model="userInfo.no_hp" :label="t('names.phoneNumber')" bordered
            is-separate-row semibold-label :disabled="readonly" />

          <!-- 3 status -->
          <div class="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="flex flex-col text-xs">
              <span class="mb-1 font-semibold">Status Lokasi</span>
              <select v-model="userInfo.statusLocation" class="border rounded px-2 py-1" :disabled="readonly">
                <option :value="1">Dalam Bandara</option>
                <option :value="0">Luar Bandara</option>
              </select>
            </div>

            <div class="flex flex-col text-xs">
              <span class="mb-1 font-semibold">Status Suspend</span>
              <select v-model="userInfo.isSuspend" class="border rounded px-2 py-1" :disabled="readonly">
                <option :value="0">Tidak Suspend</option>
                <option :value="1">Suspend</option>
              </select>
            </div>

            <div class="flex flex-col text-xs">
              <span class="mb-1 font-semibold">Jenis Driver</span>
              <select v-model="userInfo.isLangganan" class="border rounded px-2 py-1" :disabled="readonly">
                <option :value="0">Driver Normal</option>
                <option :value="1">Driver Langganan</option>
              </select>
            </div>
          </div>
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
import authenticationService from '@/services/authentications/authentications.api';

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
  status: 1,
  totalIncomeDay: 0,
  no_hp: '',
  statusLocation: 1,
  isSuspend: 0,
  isLangganan: 0
})
const images: Ref<File | null> = ref(null)
const password: Ref<string> = ref('')

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
    if (password.value) {
      const payload = { password: password.value }
      await authenticationService.changePassword(payload, userInfo.value.userId)
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