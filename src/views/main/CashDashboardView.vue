<template>
  <PageContainer :title="$t('title.cashDashboard')">
    <PageCard :loading="loading">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm text-accentGray">{{ t('names.totalCash') }}</p>
          <p class="total" :class="{ negative: (summary?.totalBalance ?? 0) < 0 }">
            {{ formatRupiah(summary?.totalBalance) }}
          </p>
          <p class="text-xs text-accentGray" v-if="summary">
            {{ t('label.cashSince', { date: summary.startDate }) }}
          </p>
        </div>
        <div class="flex gap-3">
          <MainButton :label="t('title.cashTransfer')" outline white @click="openForm('TRANSFER')" />
          <MainButton :label="t('title.cashExpense')" @click="openForm('EXPENSE')" />
        </div>
      </div>

      <div v-if="missingOpening.length" class="notice">
        <span>{{ t('message.cashOpeningMissing') }}</span>
        <button v-for="item in missingOpening" :key="item.account" type="button" class="action-link"
          @click="openOpening(item.account)">
          {{ t('label.fillOpening', { account: ACCOUNT_LABELS[item.account] }) }}
        </button>
      </div>
      <div v-if="summary && summary.unknownMethod.orderCount > 0" class="notice warning">
        {{ t('message.cashUnknownMethod', { count: summary.unknownMethod.orderCount, total: formatRupiah(summary.unknownMethod.total) }) }}
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DashboardCard v-for="item in summary?.accounts ?? []" :key="item.account" :title="ACCOUNT_LABELS[item.account]">
          <span class="amount" :class="{ negative: item.balance < 0 }">{{ formatRupiah(item.balance) }}</span>
          <span class="text-xs text-green-700">{{ t('label.todayIn', { amount: formatRupiah(item.todayIn) }) }}</span>
          <span class="text-xs text-red-600">{{ t('label.todayOut', { amount: formatRupiah(item.todayOut) }) }}</span>
          <span v-if="item.account === 'MIDTRANS' && summary" class="text-xs text-accentGray">
            {{ t('label.midtransBeforeAllocation', { amount: formatRupiah(summary.midtransBeforeAllocation) }) }}
          </span>
        </DashboardCard>
      </div>
      <div class="flex justify-end">
        <RouterLink to="/cash/movements" class="action-link">{{ t('label.viewCashMovements') }}</RouterLink>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import DashboardCard from '@/components/atoms/DashboardCard.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import ModalCashMovement from '@/components/molecules/modals/ModalCashMovement.vue'
import { useModalStore } from '@/stores/modal'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import { ACCOUNT_LABELS } from '@/utils/cash-labels'
import cashService from '@/services/cash/cash.api'
import type { CashAccount, CashSummary } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const summary = ref<CashSummary | null>(null)
const loading = ref(false)

const missingOpening = computed(() => summary.value?.accounts.filter((item) => !item.hasOpening) ?? [])

const refresh = async (): Promise<void> => {
  loading.value = true
  try {
    summary.value = (await cashService.getSummary()).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const openForm = (mode: 'TRANSFER' | 'EXPENSE'): void => {
  modal.openModal({ component: ModalCashMovement, props: { mode } })
  modal.onOk(() => {
    refresh()
  })
}

const openOpening = (account: CashAccount): void => {
  modal.openModal({ component: ModalCashMovement, props: { mode: 'OPENING', account } })
  modal.onOk(() => {
    refresh()
  })
}

onMounted(() => {
  refresh()
})
</script>

<style scoped>
.total {
  @apply text-3xl font-bold
}

.amount {
  @apply text-2xl font-semibold
}

.negative {
  @apply text-red-600
}

.notice {
  @apply flex flex-wrap items-center gap-3 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm
}

.notice.warning {
  @apply bg-red-50 border-red-200 text-red-700
}

.action-link {
  @apply text-primaryDarkBlue font-semibold underline text-sm
}
</style>
