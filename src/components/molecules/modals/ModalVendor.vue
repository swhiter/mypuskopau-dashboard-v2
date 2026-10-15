<template>
  <ModalBaseWithHeader :title="`${title} ${t('title.vendorData')}`" has-save-button :is-add="isAdd"
    :button-loading="buttonLoading" form="vendor-form" :submitted="submitted">
    <Form id="vendor-form" class="flex flex-col space-y-3" @submit="submit">
      <InputForm name="vendorName" v-model="name" :label="t('names.vendorName')" is-separate-row bordered
        :rules="{ 'required': true }" />
      <label class="flex items-center space-x-2 text-sm" v-if="!isAdd">
        <input type="checkbox" v-model="isActive" />
        <span>{{ t('names.active') }}</span>
      </label>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'vee-validate'
import { onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import vendorService from '@/services/vendor/vendor.api'
import type { Vendor } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id?: number
  isAdd?: boolean
  data?: Vendor | null
}

const props = withDefaults(defineProps<Props>(), {
  isAdd: false,
  data: null
})

const name = ref('')
const isActive = ref(true)
const buttonLoading = ref(false)
const submitted = ref(false)

const submit = async (): Promise<void> => {
  buttonLoading.value = true
  try {
    if (props.id) {
      await vendorService.updateVendor(props.id, { name: name.value, isActive: isActive.value })
    } else {
      await vendorService.createVendor({ name: name.value })
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
  if (props.data) {
    name.value = props.data.name
    isActive.value = props.data.isActive
  }
})
</script>
