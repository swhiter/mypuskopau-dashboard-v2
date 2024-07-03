<template>
  <div class="app-container">
    <div class="background-container">
      <img src="@/assets/images/background.jpeg" alt="Background" class="background">
    </div>
    <img src="@/assets/images/logo.png" alt="Logo" class="logo">
    <div class="form-container">
      <h1 class="auth-title">{{ $t('accountLogin') }}</h1>
      <Form class="my-12 flex flex-col space-y-4" id="login-form" @submit="login()">
        <InputForm name="username" :label="$t('names.username')" v-model="username"
          :placeholder="$t('placeholder.inputUsername')" is-separate-row :rules="{ required: true }" />
        <InputForm name="password" :label="$t('names.password')" v-model="password"
          :placeholder="$t('placeholder.inputPassword')" is-separate-row type="password" has-password-toggler
          :rules="{ required: true }" />
      </Form>
      <div class="flex w-full items-center justify-center">
        <MainButton type="submit" :label="$t('login')" wide form="login-form" :loading="isLoading"
          :disabled="isLoading" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import MainButton from '@/components/atoms/MainButton.vue';
import authenticationService from '@/services/authentications/authentications.api';
import type UserCredential from '@/types/Credential';
import { Form } from 'vee-validate';
import { ref, type Ref } from 'vue';

const isLoading: Ref<boolean> = ref(false)

const username: Ref<string> = ref('')
const password: Ref<string> = ref('')

const login = async () => {
  console.log('loginned')
  isLoading.value = true
  // try {
  //   const payload = {
  //     usename: username.value,
  //     password: password.value
  //   }
  //   const credentials: UserCredential = await authenticationService.login(payload)
  // } catch (error) {
  //   console.error(error)
  // } finally {
  //   isLoading.value = false
  // }
}
</script>

<style scoped>
.app-container {
  @apply w-full h-dvh bg-primaryDarkBlue relative font-body
}

.background-container {
  @apply w-full md:w-2/3 h-dvh bg-primaryDarkBlue flex justify-start
}

.background {
  @apply min-h-full min-w-full opacity-70 object-center object-cover
}

.form-container {
  @apply bg-white shadow px-8 py-12 z-10 rounded-2xl w-11/12 md:w-1/2 lg:w-2/6 absolute top-1/2 left-1/2 md:left-2/3 transform -translate-x-1/2 -translate-y-1/2
}

.auth-title {
  @apply flex w-full justify-center font-semibold text-2xl
}
</style>