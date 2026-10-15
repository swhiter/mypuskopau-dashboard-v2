<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h5 class="title">{{ t('title.payrollCurrentPeriod') }}</h5>
        <p class="text-sm text-accentGray" v-if="summary">
          {{ t('label.periodOpenedAt', { date: formatWib(summary.period.openedAt) }) }}
        </p>
      </div>
      <MainButton v-if="canManage" :label="t('label.closeBook')" :disabled="!summary || closing" :loading="closing"
        @click="confirmClose" />
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardCard :title="t('names.totalBaseSalary')" :loading="loading">
        <span class="amount">{{ formatRupiah(summary?.totalBase) }}</span>
        <span class="text-xs text-accentGray">{{ t('label.payrollCount', { count: summary?.payrollCount ?? 0 }) }}</span>
      </DashboardCard>
      <DashboardCard :title="t('names.totalDeduction')" :loading="loading">
        <span class="amount">{{ formatRupiah(summary?.totalDeduction) }}</span>
      </DashboardCard>
      <DashboardCard :title="t('names.totalBonus')" :loading="loading">
        <span class="amount">{{ formatRupiah(summary?.totalBonus) }}</span>
      </DashboardCard>
      <DashboardCard :title="t('names.totalNetSalary')" :loading="loading">
        <span class="amount" :class="{ negative: (summary?.totalNet ?? 0) < 0 }">
          {{ formatRupiah(summary?.totalNet) }}
        </span>
      </DashboardCard>
    </div>
    <p class="text-sm" v-if="summary">
      {{ t('label.pendingPayroll', { amount: formatRupiah(summary.pendingTotal), count: summary.pendingDriverCount }) }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import MainButton from '../atoms/MainButton.vue'
import DashboardCard from '../atoms/DashboardCard.vue'
import { useModalStore } from '@/stores/modal'
import { useToasterStore } from '@/stores/toaster'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { canManagePayroll } from '@/utils/roles'
import { formatRupiah, formatWib } from '@/utils/payroll-format'
import payrollService from '@/services/payroll/payroll.api'
import type { PayrollSummary } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()
const toast = useToasterStore()

const emits = defineEmits<{
  changed: []
}>()

const canManage = canManagePayroll(getCurrentUser().role)
const summary = ref<PayrollSummary | null>(null)
const loading = ref(false)
const closing = ref(false)

const refresh = async (): Promise<void> => {
  loading.value = true
  try {
    summary.value = (await payrollService.getSummary()).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const confirmClose = (): void => {
  if (!summary.value) return
  modal.openConfirmationModal(
    t('message.closeBook', {
      count: summary.value.payrollCount,
      net: formatRupiah(summary.value.totalNet),
      deduction: formatRupiah(summary.value.totalDeduction),
      bonus: formatRupiah(summary.value.totalBonus)
    })
  )
  modal.onOk(async () => {
    closing.value = true
    try {
      await payrollService.closePeriod()
      toast.success({ text: t('alert.bookClosed') })
      emits('changed')
    } catch (error) {
      handleErrorResponse(error)
    } finally {
      closing.value = false
    }
  })
}

defineExpose({ refresh })

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.amount {
  @apply text-2xl font-semibold
}

.negative {
  @apply text-red-600
}
</style>
