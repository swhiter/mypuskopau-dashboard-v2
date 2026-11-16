<template>
  <ModalBaseWithHeader :title="title" has-save-button :is-add="!account" :button-loading="saving" form="coa-form"
    :submitted="submitted">
    <Form id="coa-form" class="flex flex-col space-y-3 text-sm" @submit="save">
      <template v-if="!account">
        <InputForm name="code" v-model="form.code" :label="t('names.accountCode')" is-separate-row bordered
          placeholder="mis. 6-116" :rules="{ required: true }" />
        <div class="select-group">
          <label for="coaParent">{{ t('names.accountParent') }}</label>
          <select id="coaParent" v-model="form.parent" class="select" @change="followParentType">
            <option v-for="header in headers" :key="header.code" :value="header.code">
              {{ header.code }} {{ header.name }}
            </option>
          </select>
        </div>
        <div class="select-group">
          <label for="coaType">{{ t('names.accountType') }}</label>
          <select id="coaType" v-model="form.type" class="select">
            <option v-for="type in COA_TYPES" :key="type" :value="type">{{ COA_TYPE_LABELS[type] }}</option>
          </select>
        </div>
      </template>
      <p v-else class="font-semibold">{{ account.code }} · {{ COA_TYPE_LABELS[account.type] }}</p>
      <InputForm name="name" v-model="form.name" :label="t('names.accountName')" is-separate-row bordered
        :rules="{ required: true }" />
      <label v-if="account" class="flex items-center gap-2">
        <input v-model="form.isActive" type="checkbox" /> {{ t('label.accountActive') }}
      </label>
      <p class="text-xs text-accentGray">{{ t('message.coaInfo') }}</p>
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
import { COA_TYPES, COA_TYPE_LABELS, type CoaAccount, type CoaType } from '@/utils/accounting'
import accountingService from '@/services/accounting/accounting.api'

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  account?: CoaAccount
  headers: CoaAccount[]
}
const props = defineProps<Props>()

const form = ref({
  code: '',
  name: props.account?.name ?? '',
  type: (props.account?.type ?? 'BEBAN') as CoaType,
  parent: props.headers.find((header) => header.code === '6')?.code ?? props.headers[0]?.code ?? '',
  isActive: props.account?.isActive ?? true
})
const saving = ref(false)
const submitted = ref(false)

// Jenis akun baru mengikuti induknya
const followParentType = (): void => {
  const parent = props.headers.find((header) => header.code === form.value.parent)
  if (parent) form.value.type = parent.type
}

const save = async (): Promise<void> => {
  saving.value = true
  try {
    if (props.account) {
      await accountingService.updateAccount(props.account.code, { name: form.value.name, isActive: form.value.isActive })
    } else {
      await accountingService.createAccount({
        code: form.value.code.trim(),
        name: form.value.name,
        type: form.value.type,
        parent: form.value.parent
      })
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.select-group {
  @apply flex flex-col space-y-1
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 w-full bg-white
}
</style>
