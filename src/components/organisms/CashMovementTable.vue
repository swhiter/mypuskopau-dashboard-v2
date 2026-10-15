<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <select v-model="filters.account" class="filter" @change="applyFilters">
        <option value="">{{ t('label.allAccounts') }}</option>
        <option v-for="account in CASH_ACCOUNTS" :key="account" :value="account">{{ ACCOUNT_LABELS[account] }}</option>
      </select>
      <select v-model="filters.kind" class="filter" @change="applyFilters">
        <option value="">{{ t('label.allKinds') }}</option>
        <option v-for="(label, kind) in KIND_LABELS" :key="kind" :value="kind">{{ label }}</option>
      </select>
      <input v-model="filters.startDate" type="date" class="filter" @change="applyFilters" />
      <span>-</span>
      <input v-model="filters.endDate" type="date" class="filter" @change="applyFilters" />
      <div class="flex-1" />
      <MainButton :label="t('title.cashTransfer')" outline white @click="openForm('TRANSFER')" />
      <MainButton :label="t('title.cashExpense')" @click="openForm('EXPENSE')" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(at)="{ item }">
        <span :class="{ voided: item.status === 'VOID' }">
          {{ item.source === 'AUTO' ? formatDay(item.day) : formatWib(item.at) }}
        </span>
      </template>
      <template #cell(kind)="{ item }">
        <span :class="{ voided: item.status === 'VOID' }">{{ KIND_LABELS[item.kind as CashKind] }}</span>
        <span v-if="item.source === 'AUTO'" class="badge">{{ t('label.auto') }}</span>
      </template>
      <template #cell(route)="{ item }">
        <span :class="{ voided: item.status === 'VOID' }">
          {{ accountLabel(item.from_account) }} → {{ accountLabel(item.to_account) }}
        </span>
      </template>
      <template #cell(amount)="{ item }">
        <span :class="[amountClass(item), { voided: item.status === 'VOID' }]">{{ signedAmount(item) }}</span>
      </template>
      <template #cell(description)="{ item }">
        <span v-if="item.source === 'AUTO'">{{ t('label.autoCount', { count: item.count }) }}</span>
        <span v-else :class="{ voided: item.status === 'VOID' }">{{ item.description }}</span>
        <span v-if="item.status === 'VOID'" class="block text-xs text-red-600">
          {{ t('label.voidedBecause', { reason: item.void_reason, by: item.voided_by }) }}
        </span>
      </template>
      <template #cell(actions)="{ item }">
        <button v-if="item.source === 'MANUAL' && item.status === 'ACTIVE'" type="button" class="action-link"
          @click="voidRow(item)">{{ t('label.voidEntry') }}</button>
        <span v-else>-</span>
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="changePage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, type Ref } from 'vue'
import MainButton from '../atoms/MainButton.vue'
import CustomTable from '../atoms/CustomTable.vue'
import CustomTablePagination from '../atoms/CustomTablePagination.vue'
import ModalCashMovement from '../molecules/modals/ModalCashMovement.vue'
import ModalCashVoid from '../molecules/modals/ModalCashVoid.vue'
import { useModalStore } from '@/stores/modal'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah, formatWib } from '@/utils/payroll-format'
import { ACCOUNT_LABELS, CASH_ACCOUNTS, KIND_LABELS, accountLabel } from '@/utils/cash-labels'
import cashService from '@/services/cash/cash.api'
import type { PaginationRequest, TableField } from '@/types/Main'
import type { CashAccount, CashKind, CashMovementRow } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const filters = ref({
  account: '' as CashAccount | '',
  kind: '',
  startDate: '',
  endDate: ''
})

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 20,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField<any>[]> = ref([
  { name: 'at', title: t('names.time') },
  { name: 'kind', title: t('names.movementKind') },
  { name: 'route', title: t('names.fromTo') },
  { name: 'amount', title: t('names.amount') },
  { name: 'description', title: t('names.description') },
  { name: 'created_by', title: t('names.recordedBy') },
  { name: 'actions', title: t('label.actions') }
])

const rows: Ref<CashMovementRow[]> = ref([])

const formatDay = (day: string): string => (day ? String(day).slice(0, 10).split('-').reverse().join('/') : '-')

// Arah nominal relatif terhadap akun yang difilter (tanpa filter: masuk bila ada akun tujuan)
const isInflow = (row: CashMovementRow): boolean =>
  filters.value.account ? row.to_account === filters.value.account : !!row.to_account && !row.from_account

const isOutflow = (row: CashMovementRow): boolean =>
  filters.value.account ? row.from_account === filters.value.account : !!row.from_account && !row.to_account

const signedAmount = (row: CashMovementRow): string => {
  const sign = isInflow(row) ? '+' : isOutflow(row) ? '−' : ''
  return `${sign}${formatRupiah(row.amount)}`
}

const amountClass = (row: CashMovementRow): string =>
  isInflow(row) ? 'text-green-700' : isOutflow(row) ? 'text-red-600' : ''

const load = async (): Promise<void> => {
  try {
    const response = await cashService.getMovements({
      ...filters.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    rows.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const applyFilters = (): void => {
  pagination.value.page = 1
  load()
}

const changePage = (page: number): void => {
  pagination.value.page = page
  load()
}

const openForm = (mode: 'TRANSFER' | 'EXPENSE'): void => {
  modal.openModal({ component: ModalCashMovement, props: { mode } })
  modal.onOk(() => {
    load()
  })
}

const voidRow = (row: CashMovementRow): void => {
  modal.openModal({
    component: ModalCashVoid,
    props: {
      id: row.id,
      summaryText: `${KIND_LABELS[row.kind]} ${formatRupiah(row.amount)} — ${row.description ?? ''}`
    }
  })
  modal.onOk(() => {
    load()
  })
}

defineExpose({ load })

onMounted(() => {
  load()
})
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.voided {
  @apply line-through text-accentGray
}

.badge {
  @apply ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-accentGray
}

.action-link {
  @apply text-red-600 font-semibold underline
}
</style>
