<template>
  <Form id="driver-form" class="flex flex-col space-y-4" @submit="onSubmit()" autocomplete="off">
    <UserInformationForm :form="userInfoForm" @update="userInfoForm = $event" is-driver />
    <VehicleInformationForm :form="vehicleInfoForm" @update="vehicleInfoForm = $event" />
    <UserAccessInformationForm :form="userAccessForm" @update="userAccessForm = $event" is-driver
      :generated="isUsernameGenerated" @generated="isUsernameGenerated = $event" />
  </Form>
</template>

<script setup lang="ts">
import { inject, reactive, ref, watch, type Ref } from 'vue';
import UserAccessInformationForm from '../molecules/forms/UserAccessInformationForm.vue';
import UserInformationForm from '../molecules/forms/UserInformationForm.vue';
import VehicleInformationForm from '../molecules/forms/VehicleInformationForm.vue';
import { type UserAccessInfo, type UserInfo, type VehicleInfo } from '@/types/Forms';
import { Form } from 'vee-validate';
import driverService from '@/services/drivers/drivers.api';
import { handleErrorResponse } from '@/utils/common';
import { useToasterStore } from '@/stores/toaster';
import { useI18n } from 'vue-i18n';
import { formState } from '@/injects/keys';

const { t } = useI18n()
const toast = useToasterStore()

const emits = defineEmits<{
  saveEnabled: [enabled: boolean]
}>()

const isUsernameGenerated: Ref<boolean> = ref(false)
const parentForm = inject(formState)

watch(isUsernameGenerated, (newValue) => {
  emits('saveEnabled', newValue)
})

let userInfoForm: Ref<UserInfo> = ref({
  name: '',
  nik: '',
  photo: ''
})

let vehicleInfoForm: VehicleInfo = reactive({
  vehicleCode: '',
  licensePlate: ''
})

let userAccessForm: UserAccessInfo = reactive({
  id: 0,
  userId: '',
  password: '',
  role: ''
})

const onSubmit = async (): Promise<void> => {
  const form = new FormData()

  Object.entries(userInfoForm.value).forEach(([key, value]) => {
    form.append(key, value as string | File)
  })

  Object.entries(vehicleInfoForm).forEach(([key, value]) => {
    form.append(key, value as string)
  })

  Object.entries(userAccessForm).forEach(([key, value]) => {
    form.append(key, value)
  })

  form.append('status', '1')
  form.append('lastLatitude', '-6.264814')
  form.append('lastLongitude', '106.883987')

  try {
    await driverService.createDriver(form)
    toast.success({ text: t('alert.successSave') })
    reset()
    parentForm?.updateSubmittedState()
  } catch (error) {
    handleErrorResponse(error)
  }
}

const reset = (): void => {
  isUsernameGenerated.value = false
  // User Info
  userInfoForm.value.name = ''
  userInfoForm.value.nik = ''
  userInfoForm.value.photo = ''
  // Vehicle Info
  vehicleInfoForm.vehicleCode = ''
  vehicleInfoForm.licensePlate = ''
  // User Access Info
  userAccessForm.id = 0
  userAccessForm.userId = ''
  userAccessForm.password = ''
}
</script>