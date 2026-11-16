<template>
  <ModalBaseWithHeader :title="t('title.cashClassify')" has-save-button :loading="loading" :button-loading="saving"
    form="cash-classify-form" :submitted="submitted" :submit-label="t('label.save')">
    <Form id="cash-classify-form" class="flex flex-col space-y-3 text-sm" @submit="save">
      <p>{{ summaryText }}</p>
      <div class="select-group">
        <label for="classifyCoa">{{ type === 'INCOME' ? t('names.sourceAccount') : t('names.targetAccount') }}</label>
        <select id="classifyCoa" v-model="coaCode" class="select">
          <option value="" disabled>{{ t('label.choose') }}</option>
          <option v-for="account in options" :key="account.code" :value="account.code">
            {{ account.code }} {{ account.name }}
          </option>
        </select>
      </div>
      <div class="select-group">
        <label for="classifyUnit">{{ t('names.businessUnit') }}</label>
        <select id="classifyUnit" v-model="businessUnit" class="select">
          <option v-for="unit in UNITS" :key="unit" :value="unit">{{ UNIT_LABELS[unit] }}</option>
        </select>
      </div>
      <p class="text-xs text-accentGray">{{ t('message.classifyInfo') }}</p>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import cashService from '@/services/cash/cash.api'
import accountingService from '@/services/accounting/accounting.api'
import { UNITS, UNIT_LABELS, accountOptions, defaultUnitFor, type BusinessUnit, type CoaAccount } from '@/utils/accounting'

const { t } = useI18n()
const toast = useToasterStore()

// Klasifikasi akun & unit satu catatan pemasukan/pengeluaran (nominal tidak berubah).
interface Props {
  id: number
  type: 'EXPENSE' | 'INCOME'
  cashAccount: string | null
  summaryText: string
  coaCode?: string | null
  businessUnit?: string | null
}
const props = defineProps<Props>()

const accounts = ref<CoaAccount[]>([])
const coaCode = ref(props.coaCode ?? '')
const businessUnit = ref<BusinessUnit>((props.businessUnit as BusinessUnit) ?? defaultUnitFor(props.cashAccount))
const options = computed(() => accountOptions(accounts.value, props.type))
const loading = ref(false)
const saving = ref(false)
const submitted = ref(false)

const save = async (): Promise<void> => {
  if (!coaCode.value) {
    toast.error({ text: t('message.accountRequired') })
    return
  }
  saving.value = true
  try {
    await cashService.classifyMovement(props.id, { coaCode: coaCode.value, businessUnit: businessUnit.value })
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    accounts.value = (await accountingService.getAccounts()).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.select-group {
  @apply flex flex-col space-y-1
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 w-full bg-white
}
</style>
