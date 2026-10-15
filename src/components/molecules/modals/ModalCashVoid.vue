<template>
  <ModalBaseWithHeader :title="t('title.cashVoid')" has-save-button :button-loading="buttonLoading"
    form="cash-void-form" :submitted="submitted" :cancel-label="t('label.close')"
    :submit-label="t('label.confirmVoid')">
    <Form id="cash-void-form" class="flex flex-col space-y-3" @submit="save">
      <p class="text-sm">{{ summaryText }}</p>
      <InputForm name="reason" v-model="reason" :label="t('names.voidReason')" is-separate-row bordered
        :rules="{ required: true }" />
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'vee-validate'
import { ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import cashService from '@/services/cash/cash.api'

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  id: number
  summaryText: string
}

const props = defineProps<Props>()

const reason = ref('')
const buttonLoading = ref(false)
const submitted = ref(false)

const save = async (): Promise<void> => {
  buttonLoading.value = true
  try {
    await cashService.voidMovement(props.id, reason.value)
    toast.success({ text: t('alert.cashVoided') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}
</script>
