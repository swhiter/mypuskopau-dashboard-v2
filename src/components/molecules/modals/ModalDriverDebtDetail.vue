<template>
  <ModalBaseWithHeader :title="title" has-save-button :loading="loading" form="driver-debt-detail-form"
    :submitted="submitted" :submit-label="t('label.done')" :cancel-label="t('label.close')">
    <!-- tombol Selesai memuat ulang daftar hutang -->
    <form id="driver-debt-detail-form" @submit.prevent="submitted = true" />
    <div v-if="debt" class="flex flex-col space-y-4 text-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><span class="label">{{ t('names.driverName') }}</span>{{ debt.driverName }} ({{ debt.vehicleCode }})</div>
        <div><span class="label">{{ t('names.debtKind') }}</span>{{ t(`label.debtKind.${debt.kind}`) }}</div>
        <div class="md:col-span-2"><span class="label">{{ t('names.debtDescription') }}</span>{{ debt.description }}</div>
        <div><span class="label">{{ t('names.debtTotal') }}</span>{{ formatRupiah(debt.totalAmount) }}</div>
        <div><span class="label">{{ t('names.debtPaid') }}</span>{{ formatRupiah(debt.paid) }}</div>
        <div class="font-semibold"><span class="label">{{ t('names.debtRemaining') }}</span>{{ formatRupiah(debt.remaining) }}</div>
        <div><span class="label">{{ t('names.installmentPerDay') }}</span>{{ formatRupiah(debt.installmentAmount) }}</div>
        <div><span class="label">{{ t('names.status') }}</span>{{ t(`label.debtStatus.${debt.status}`) }}
          <span v-if="debt.voidReason" class="text-accentGray">— {{ debt.voidReason }}</span>
        </div>
        <div><span class="label">{{ t('names.createdBy') }}</span>{{ debt.createdBy }} · {{ formatWib(debt.createdAt) }}</div>
      </div>

      <!-- Pelunasan tunai: otomatis jadi Pemasukan di akun kas yang dipilih -->
      <div v-if="canPay && debt.status === 'ACTIVE'" class="pay-box">
        <p class="font-semibold">{{ t('title.debtCashPayment') }}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input v-model="payment.amount" type="number" min="1" :max="debt.remaining" class="select"
            :placeholder="t('names.amount')" :aria-label="t('names.amount')" />
          <select v-model="payment.account" class="select" :aria-label="t('names.account')">
            <option v-for="account in CASH_ACCOUNTS" :key="account" :value="account">{{ ACCOUNT_LABELS[account] }}</option>
          </select>
          <input v-model="payment.movementDate" type="date" class="select" :max="today"
            :aria-label="t('names.transactionDate')" />
        </div>
        <p class="text-xs text-accentGray">{{ t('message.debtCashPaymentInfo') }}</p>
        <div>
          <MainButton :label="t('label.recordPayment')" :loading="paying" :disabled="paying" @click="payCash" />
        </div>
      </div>

      <div class="payment-table">
        <table class="w-full">
          <thead>
            <tr>
              <th>{{ t('names.date') }}</th>
              <th>{{ t('names.source') }}</th>
              <th>{{ t('names.note') }}</th>
              <th class="text-right">{{ t('names.amount') }}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in debt.payments" :key="item.id" :class="{ voided: item.status === 'VOID' }">
              <td>{{ formatWib(item.paidAt) }}</td>
              <td>{{ item.source === 'PAYROLL' ? t('label.debtSourcePayroll', { id: item.payrollId }) : t('label.debtSourceCash') }}</td>
              <td>
                {{ item.note }}
                <span v-if="item.status === 'VOID'" class="text-accentGray">({{ t('label.voided') }}: {{ item.voidReason }})</span>
              </td>
              <td class="text-right">{{ formatRupiah(item.amount) }}</td>
              <td>
                <button v-if="canPay && item.source === 'CASH' && item.status === 'ACTIVE'" type="button"
                  class="action-link" @click="voidPayment(item.id)">{{ t('label.voidEntry') }}</button>
              </td>
            </tr>
            <tr v-if="!debt.payments.length">
              <td colspan="5" class="text-center text-accentGray">{{ t('message.debtNoPayments') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="canManage && debt.status === 'ACTIVE' && debt.paid === 0">
        <button type="button" class="action-link danger" @click="voidDebt">{{ t('label.voidDebt') }}</button>
      </div>
    </div>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import { useToasterStore } from '@/stores/toaster'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { canManagePayroll, canRecordDebtPayment } from '@/utils/roles'
import { formatRupiah, formatWib } from '@/utils/payroll-format'
import { ACCOUNT_LABELS, CASH_ACCOUNTS, todayWib } from '@/utils/cash-labels'
import driverDebtService from '@/services/driver-debt/driver-debt.api'
import type { DriverDebtDetail } from '@/types/Data'

const { t } = useI18n()
const toast = useToasterStore()

interface Props {
  title: string
  id: number
}
const props = defineProps<Props>()

const role = getCurrentUser().role
const canManage = canManagePayroll(role)
const canPay = canRecordDebtPayment(role)
const today = todayWib()

const debt = ref<DriverDebtDetail | null>(null)
const loading = ref(false)
const paying = ref(false)
const submitted = ref(false)
const payment = ref({ amount: '' as number | string, account: 'CASH', movementDate: today })

const load = async (): Promise<void> => {
  loading.value = true
  try {
    debt.value = (await driverDebtService.getDebt(props.id)).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

// Store modal hanya menampung satu modal: konfirmasi & alasan memakai dialog bawaan browser.
const payCash = async (): Promise<void> => {
  if (!debt.value) return
  const amount = Number(payment.value.amount)
  if (!Number.isSafeInteger(amount) || amount <= 0 || amount > debt.value.remaining) {
    toast.error({ text: t('message.debtPaymentInvalid', { amount: formatRupiah(debt.value.remaining) }) })
    return
  }
  const message = t('message.confirmDebtPayment', {
    amount: formatRupiah(amount),
    account: ACCOUNT_LABELS[payment.value.account as keyof typeof ACCOUNT_LABELS]
  })
  if (!window.confirm(message)) return
  paying.value = true
  try {
    await driverDebtService.payCash(props.id, {
      amount,
      account: payment.value.account,
      movementDate: payment.value.movementDate || undefined
    })
    toast.success({ text: t('alert.successSave') })
    payment.value.amount = ''
    await load()
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    paying.value = false
  }
}

const askReason = (): string | null => {
  const reason = window.prompt(t('names.voidReason'))?.trim()
  return reason ? reason : null
}

const voidPayment = async (paymentId: number): Promise<void> => {
  const reason = askReason()
  if (!reason) return
  try {
    await driverDebtService.voidPayment(paymentId, reason)
    toast.success({ text: t('alert.successSave') })
    await load()
  } catch (error) {
    handleErrorResponse(error)
  }
}

const voidDebt = async (): Promise<void> => {
  const reason = askReason()
  if (!reason) return
  try {
    await driverDebtService.voidDebt(props.id, reason)
    toast.success({ text: t('alert.successSave') })
    await load()
  } catch (error) {
    handleErrorResponse(error)
  }
}

onMounted(load)
</script>

<style scoped>
.label {
  @apply font-semibold mr-2
}

.select {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.pay-box {
  @apply flex flex-col space-y-2 rounded-lg border border-buttonGray p-3
}

.payment-table {
  @apply max-h-64 overflow-y-auto border border-buttonGray rounded-lg
}

.payment-table th,
.payment-table td {
  @apply px-3 py-1 text-left
}

.payment-table thead {
  @apply bg-gray-100 sticky top-0
}

.voided {
  @apply text-accentGray line-through
}

.action-link {
  @apply text-primaryDarkBlue font-semibold underline
}

.danger {
  @apply text-red-600
}
</style>
