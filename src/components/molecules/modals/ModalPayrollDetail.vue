<template>
  <ModalBaseWithHeader :title="title" :loading="loading">
    <div v-if="payroll" class="flex flex-col space-y-4 text-sm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div><span class="label">{{ t('names.driverName') }}</span>{{ payroll.driverName }} ({{ payroll.vehicleCode }})</div>
        <div><span class="label">{{ t('names.processedAt') }}</span>{{ formatWib(payroll.processedAt) }} · {{ payroll.processedBy }}</div>
        <div><span class="label">{{ t('names.baseSalary') }}</span>{{ formatRupiah(payroll.baseAmount) }}</div>
        <div>
          <span class="label">{{ t('names.deduction') }}</span>{{ formatRupiah(payroll.deductionAmount) }}
          <span v-if="payroll.deductionNote" class="text-accentGray">— {{ payroll.deductionNote }}</span>
        </div>
        <div>
          <span class="label">{{ t('names.bonus') }}</span>{{ formatRupiah(payroll.bonusAmount) }}
          <span v-if="payroll.bonusNote" class="text-accentGray">— {{ payroll.bonusNote }}</span>
        </div>
        <div :class="{ negative: payroll.netAmount < 0 }">
          <span class="label">{{ t('names.netSalary') }}</span>{{ formatRupiah(payroll.netAmount) }}
        </div>
        <div v-if="payroll.updatedBy">
          <span class="label">{{ t('names.updatedBy') }}</span>{{ payroll.updatedBy }} · {{ formatWib(payroll.updatedAt) }}
        </div>
      </div>
      <div class="order-table">
        <table class="w-full">
          <thead>
            <tr>
              <th>{{ t('names.date') }}</th>
              <th>{{ t('names.transactionNumber') }}</th>
              <th>{{ t('names.paymentMethod') }}</th>
              <th class="text-right">{{ t('names.driverSalary') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in payroll.orders" :key="order.orderId">
              <td>{{ formatWib(order.createdAt) }}</td>
              <td>{{ order.transactionNumber }}</td>
              <td>{{ order.paymentMethod }}</td>
              <td class="text-right">{{ formatRupiah(order.amount) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </ModalBaseWithHeader>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import ModalBaseWithHeader from './ModalBaseWithHeader.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah, formatWib } from '@/utils/payroll-format'
import payrollService from '@/services/payroll/payroll.api'
import type { PayrollDetail } from '@/types/Data'

const { t } = useI18n()

interface Props {
  title: string
  id: number
}

const props = defineProps<Props>()

const payroll = ref<PayrollDetail | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    payroll.value = (await payrollService.getPayroll(props.id)).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.label {
  @apply block text-xs text-accentGray
}

.order-table {
  @apply max-h-64 overflow-y-auto border border-buttonGray rounded-lg
}

.order-table th,
.order-table td {
  @apply px-3 py-1 text-left
}

.order-table thead {
  @apply bg-gray-100 sticky top-0
}

.negative {
  @apply text-red-600
}
</style>
