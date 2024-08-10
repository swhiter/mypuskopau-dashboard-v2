<template>
  <PageContainer>
    <Form id="profile-form" @submit="save()">
      <PageCard>
        <div class="flex w-full space-x-8 items-center">
          <div class="image-group">
            <div class="image-container">
              <img :src="readImage(images)" alt="Photo" class="image" v-if="images">
              <img :src="photo" alt="Photo" class="image" v-else-if="photo">
              <img :src="defaultImage" alt="Photo" class="image" v-else>
            </div>
            <button class="btn-image-update" @click.prevent="triggerFileInput">
              <FontAwesomeIcon class="fa-fw" :icon="faPen" />
            </button>
            <input type="file" ref="fileInputRef" @change="onFileAdd" accept="image/*" class="hidden">
          </div>
          <span class="flex w-full text-xl font-semibold">{{ `${firstName} ${lastName}` }}</span>
        </div>
      </PageCard>
      <PageCard has-save-button button-form="profile-form" :button-loading="buttonLoading">
        <div class="grid grid-cols-2 gap-8 mb-8">
          <InputForm name="firstName" :label="t('names.firstName')" v-model="firstName" is-separate-row bordered
            :rules="{ 'required': true }" />
          <InputForm name="lastName" :label="t('names.lastName')" v-model="lastName" is-separate-row bordered
            :rules="{ 'required': true }" />
          <div class="col-span-2">
            <InputForm name="idCardNumber" :label="t('names.idCardNumber')" v-model="idCardNumber" is-separate-row
              bordered :rules="{ 'required': true, 'length': 16 }" />
          </div>
          <InputForm name="id" :label="t('names.id')" v-model="userId" is-separate-row bordered disabled
            :rules="{ 'required': true }" />
          <InputForm name="password" :label="t('names.password')" v-model="password" is-separate-row bordered
            type="password" has-password-toggler />
        </div>
      </PageCard>
    </Form>
  </PageContainer>
</template>

<script setup lang="ts">
import { Form } from 'vee-validate';
import InputForm from '@/components/atoms/InputForm.vue';
import PageCard from '@/components/atoms/PageCard.vue';
import PageContainer from '@/components/atoms/PageContainer.vue';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import defaultImage from '@/assets/images/user.png';
import { getCurrentUser, handleErrorResponse } from '@/utils/common';
import profileService from '@/services/dashboard/profile.api';
import { useToasterStore } from '@/stores/toaster';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n()
const auth = useAuthStore()
const toast = useToasterStore()

const fileInputRef: Ref<HTMLInputElement | null> = ref(null)

const buttonLoading: Ref<boolean> = ref(false)

const id: Ref<number> = ref(0)
const firstName: Ref<string> = ref('')
const lastName: Ref<string> = ref('')
const idCardNumber: Ref<string> = ref('')
const userId: Ref<string> = ref('')
const password: Ref<string> = ref('')
const photo: Ref<string> = ref('')
const images: Ref<File | null> = ref(null)

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

const readProfile = () => {
  const user = getCurrentUser()
  id.value = user.userDetail.id
  firstName.value = user.userDetail.firstName
  lastName.value = user.userDetail.lastName
  idCardNumber.value = user.userDetail.nik
  userId.value = user.userDetail.userId
  photo.value = user.userDetail.photo
}

const save = async (): Promise<void> => {
  buttonLoading.value = true
  const form = new FormData()
  form.append('firstName', firstName.value)
  form.append('lastName', lastName.value)
  form.append('nik', idCardNumber.value)
  form.append('userId', userId.value)
  form.append('photo', images.value ? images.value : photo.value)
  if (password.value) {
    form.append('password', password.value)
  }

  try {
    await profileService.updateProfile(form, id.value)
    toast.success({ text: t('alert.successSave') })
    auth.logout()
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

onMounted(() => {
  readProfile()
})
</script>

<style scoped>
.image-group {
  @apply relative flex w-40 self-center
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