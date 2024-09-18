<template>
  <PageInnerCard :title="isDriver ? $t('title.driverAccessInformation') : $t('title.staffAccessInformation')">
    <div class="flex w-full space-x-4">
      <div class="flex w-4/5">
        <InputForm name="password" v-model="form.password" :label="$t('names.password')" is-separate-row bordered
          type="password" has-password-toggler :rules="{ required: true }" :reset="reset" />
      </div>
      <div class="flex flex-col w-1/5 py-2 justify-end">
        <MainButton :label="$t('generate')" tall @click="generateUsername()" :disabled="generated" />
      </div>
    </div>
    <div class="flex w-full space-x-4" v-if="generated">
      <div class="flex w-4/5">
        <InputForm name="username" v-model="form.userId" :label="$t('names.username')" is-separate-row bordered
          :reset="reset" />
      </div>
      <div class="flex w-1/5">
        <!--  -->
      </div>
    </div>
  </PageInnerCard>
</template>

<script setup lang="ts">
import InputForm from '@/components/atoms/InputForm.vue';
import MainButton from '@/components/atoms/MainButton.vue';
import PageInnerCard from '@/components/atoms/PageInnerCard.vue';
import authenticationService from '@/services/authentications/authentications.api';
import type { UserAccessInfo } from '@/types/Forms';
import { onMounted, ref, toRefs, watch, type Ref } from 'vue';

interface Props {
  form: UserAccessInfo
  isDriver?: boolean
  generated: boolean
  reset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDriver: false,
  reset: false
})

const emits = defineEmits<{
  update: [form: UserAccessInfo],
  generated: [username: boolean]
}>()

const { form, generated } = toRefs(props)
const usernameGenerated: Ref<boolean> = ref(false)

watch(form, (newValue) => {
  emits('update', newValue)
})

watch(usernameGenerated, (newValue) => {
  emits('generated', newValue)
})

const generateUsername = async (): Promise<void> => {
  let user: UserAccessInfo
  try {
    if (props.isDriver) {
      const result = await authenticationService.generateDriverUsername({ params: 'test' })
      user = result.data
      form.value.id = user.id
      form.value.userId = user.userId
      form.value.role = user.role
      usernameGenerated.value = true
    } else {
      const result = await authenticationService.generateStaffUsername({ params: 'test' })
      user = result.data
      form.value.id = user.id
      form.value.userId = user.userId
      form.value.role = user.role
      usernameGenerated.value = true
    }
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  usernameGenerated.value = generated.value
})
</script>