<template>
  <ModalBaseWithHeader :title="modeTitle" has-save-button :is-add="true" :loading="loading"
    :button-loading="buttonLoading" form="cash-movement-form" :submitted="submitted">
    <Form id="cash-movement-form" class="flex flex-col space-y-3" @submit="onSubmit">
      <div class="select-group" v-if="mode !== 'OPENING'">
        <label for="fromAccount">{{ t('names.fromAccount') }}</label>
        <select id="fromAccount" v-model="fromAccount" class="select">
          <option v-for="account in CASH_ACCOUNTS" :key="account" :value="account">
            {{ ACCOUNT_LABELS[account] }} — {{ formatRupiah(balanceOf(account)) }}
          </option>
        </select>
      </div>
      <div class="select-group" v-if="mode === 'TRANSFER' || mode === 'OPENING'">
        <label for="toAccount">{{ mode === 'OPENING' ? t('names.account') : t('names.toAccount') }}</label>
        <select id="toAccount" v-model="toAccount" class="select" :disabled="mode === 'OPENING' && !!account">
          <option v-for="item in toOptions" :key="item" :value="item">{{ ACCOUNT_LABELS[item] }}</option>
        </select>
      </div>
      <InputForm name="amount" v-model="amount" :label="t('names.amount')" type="number" prefix="Rp" is-separate-row
        bordered :rules="{ required: true, integer: true, min_value: mode === 'OPENING' ? 0 : 1 }" />
      <InputForm name="description" v-model="description" :label="t('names.description')" is-separate-row bordered
        :rules="{ required: true }" />
      <p v-if="exceedsBalance" class="warning">
        {{ t('message.cashExceedsBalance', { account: ACCOUNT_LABELS[fromAccount], balance: formatRupiah(balanceOf(fromAccount)) }) }}
      </p>
      <p v-if="mode === 'OPENING' && summary" class="text-sm text-accentGray">
        {{ t('message.cashOpeningInfo', { date: summary.startDate }) }}
      </p>
    </Form>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Form } from 'vee-validate'
import { computed, onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import InputForm from '@/components/atoms/InputForm.vue'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import { ACCOUNT_LABELS, CASH_ACCOUNTS } from '@/utils/cash-labels'
import cashService from '@/services/cash/cash.api'
import type { CashAccount, CashSummary } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

// mode OPENING: saldo awal satu akun (account); TRANSFER/EXPENSE: catatan manual
interface Props {
  mode: 'TRANSFER' | 'EXPENSE' | 'OPENING'
  account?: CashAccount
}

const props = defineProps<Props>()

const summary = ref<CashSummary | null>(null)
const fromAccount = ref<CashAccount>('MIDTRANS')
const toAccount = ref<CashAccount>(props.account ?? 'KAS_BESAR')
const amount = ref<number | string>('')
const description = ref('')

const loading = ref(false)
const buttonLoading = ref(false)
const submitted = ref(false)

const modeTitle = computed(() =>
  props.mode === 'TRANSFER'
    ? t('title.cashTransfer')
    : props.mode === 'EXPENSE'
      ? t('title.cashExpense')
      : t('title.cashOpening')
)

const toOptions = computed(() =>
  props.mode === 'TRANSFER' ? CASH_ACCOUNTS.filter((item) => item !== fromAccount.value) : CASH_ACCOUNTS
)

const balanceOf = (account: CashAccount): number =>
  summary.value?.accounts.find((item) => item.account === account)?.balance ?? 0

// Pencatatan boleh membuat saldo minus, tetapi diberi peringatan
const exceedsBalance = computed(
  () => props.mode !== 'OPENING' && Number(amount.value) > 0 && Number(amount.value) > balanceOf(fromAccount.value)
)

// Store modal hanya menampung satu modal: konfirmasi memakai dialog bawaan browser.
const onSubmit = (): void => {
  if (props.mode === 'TRANSFER' && fromAccount.value === toAccount.value) {
    toast.error({ text: t('message.cashSameAccount') })
    return
  }
  const warning = exceedsBalance.value ? `${t('message.cashNegativeConfirm')}\n` : ''
  if (window.confirm(`${warning}${t('message.save')}`)) {
    save()
  }
}

const save = async (): Promise<void> => {
  buttonLoading.value = true
  try {
    if (props.mode === 'OPENING') {
      await cashService.createOpening({
        account: toAccount.value,
        amount: Number(amount.value),
        description: description.value
      })
    } else {
      await cashService.createMovement({
        type: props.mode,
        fromAccount: fromAccount.value,
        toAccount: props.mode === 'TRANSFER' ? toAccount.value : null,
        amount: Number(amount.value),
        description: description.value
      })
    }
    toast.success({ text: t('alert.successSave') })
    submitted.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    buttonLoading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    summary.value = (await cashService.getSummary()).data
    if (props.mode === 'EXPENSE') fromAccount.value = 'KAS_KECIL'
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.select-group {
  @apply flex flex-col space-y-1 text-sm 2xl:text-base
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 w-full bg-white
}

.warning {
  @apply text-sm text-red-600
}
</style>
