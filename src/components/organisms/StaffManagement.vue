<template>
  <Form id="staff-form" class="flex flex-col space-y-4" @submit="onSubmit()" autocomplete="off">
    <UserInformationForm :form="userInfoForm" @update="userInfoForm = $event" />
    <UserAccessInformationForm :form="userAccessForm" @update="userAccessForm = $event" :generated="isUsernameGenerated"
      @generated="isUsernameGenerated = $event" />
  </Form>
</template>

<script setup lang="ts">
import type { UserAccessInfo, UserInfo } from '@/types/Forms';
import UserInformationForm from '../molecules/forms/UserInformationForm.vue';
import { inject, reactive, ref, watch, type Ref } from 'vue';
import UserAccessInformationForm from '../molecules/forms/UserAccessInformationForm.vue';
import { Form } from 'vee-validate';
import staffService from '@/services/drivers/staff.api';
import { handleErrorResponse } from '@/utils/common';
import { useI18n } from 'vue-i18n';
import { useToasterStore } from '@/stores/toaster';
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

let userInfoForm: UserInfo = reactive({
  name: '',
  nik: '',
  photo: ''
})

let userAccessForm: UserAccessInfo = reactive({
  id: 0,
  userId: '',
  password: '',
  role: ''
})

const onSubmit = async (): Promise<void> => {
  const form = new FormData()

  Object.entries(userInfoForm).forEach(([key, value]) => {
    form.append(key, value as string | File)
  })

  Object.entries(userAccessForm).forEach(([key, value]) => {
    form.append(key, value)
  })

  try {
    await staffService.createStaff(form)
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
  userInfoForm.name = ''
  userInfoForm.nik = ''
  userInfoForm.photo = ''
  // User Access Info
  userAccessForm.id = 0
  userAccessForm.userId = ''
  userAccessForm.password = ''
}
</script>