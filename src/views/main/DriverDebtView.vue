<template>
  <PageContainer :title="$t('title.driverDebt')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="status" class="filter" :aria-label="t('names.status')" @change="applyFilters">
            <option value="">{{ t('label.allStatus') }}</option>
            <option v-for="item in STATUSES" :key="item" :value="item">{{ t(`label.debtStatus.${item}`) }}</option>
          </select>
          <input v-model="search" type="search" class="filter" :placeholder="t('label.searchDriver')"
            @keyup.enter="applyFilters" />
          <MainButton :label="t('label.search')" outline white @click="applyFilters" />
          <div class="flex-1" />
          <MainButton v-if="canManage" :label="t('label.addDebt')" @click="openForm()" />
        </div>
        <CustomTable :columns="columns" :rows="rows">
          <template #cell(actions)="{ item }">
            <div class="flex gap-3">
              <button type="button" class="action-link" @click="openDetail(item.id)">{{ t('label.detail') }}</button>
              <button v-if="canManage && item.status === 'ACTIVE'" type="button" class="action-link"
                @click="openForm(item)">{{ t('label.update') }}</button>
            </div>
          </template>
          <template #cell(remaining)="{ item }">
            <span class="font-semibold">{{ formatRupiah(item.remaining) }}</span>
          </template>
          <template #cell(status)="{ item }">
            <span :class="`status status-${item.status}`">{{ t(`label.debtStatus.${item.status}`) }}</span>
          </template>
        </CustomTable>
        <div class="flex w-full justify-end items-center">
          <CustomTablePagination :pagination="pagination" @page-changed="changePage" />
        </div>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, type Ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import CustomTable from '@/components/atoms/CustomTable.vue'
import CustomTablePagination from '@/components/atoms/CustomTablePagination.vue'
import ModalDriverDebtForm from '@/components/molecules/modals/ModalDriverDebtForm.vue'
import ModalDriverDebtDetail from '@/components/molecules/modals/ModalDriverDebtDetail.vue'
import { useModalStore } from '@/stores/modal'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { canManagePayroll } from '@/utils/roles'
import { formatRupiah } from '@/utils/payroll-format'
import driverDebtService from '@/services/driver-debt/driver-debt.api'
import type { PaginationRequest, TableField } from '@/types/Main'
import type { DriverDebt } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const STATUSES = ['ACTIVE', 'PAID', 'VOID'] as const
const canManage = canManagePayroll(getCurrentUser().role)
const status = ref<string>('ACTIVE')
const search = ref('')

const pagination: Ref<PaginationRequest> = ref({ page: 1, limit: 10, totalPages: 0, totalRows: 0, search: '' })

const columns: Ref<TableField<any>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  { name: 'driverName', title: t('names.driverName') },
  { name: 'kind', title: t('names.debtKind'), field: (val: string) => t(`label.debtKind.${val}`) },
  { name: 'description', title: t('names.debtDescription') },
  { name: 'totalAmount', title: t('names.debtTotal'), field: (val: number) => formatRupiah(val) },
  { name: 'paid', title: t('names.debtPaid'), field: (val: number) => formatRupiah(val) },
  { name: 'remaining', title: t('names.debtRemaining') },
  { name: 'installmentAmount', title: t('names.installmentPerDay'), field: (val: number) => formatRupiah(val) },
  { name: 'status', title: t('names.status') }
])

const rows: Ref<(DriverDebt & { actions: number })[]> = ref([])

const load = async (): Promise<void> => {
  try {
    const response = await driverDebtService.getDebts({
      status: status.value,
      search: search.value.trim(),
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    rows.value = response.data.map((item) => ({ ...item, actions: item.id }))
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

const openForm = (debt?: DriverDebt): void => {
  modal.openModal({
    component: ModalDriverDebtForm,
    props: { title: debt ? t('title.editDebt') : t('title.addDebt'), debt }
  })
  modal.onOk(load)
}

const openDetail = (id: number): void => {
  modal.openModal({ component: ModalDriverDebtDetail, props: { title: t('title.debtDetail'), id } })
  modal.onOk(load)
}

onMounted(load)
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.action-link {
  @apply text-primaryDarkBlue font-semibold underline
}

.status {
  @apply rounded-full px-2 py-0.5 text-xs font-semibold
}

.status-ACTIVE {
  @apply bg-yellow-100 text-yellow-800
}

.status-PAID {
  @apply bg-green-100 text-green-800
}

.status-VOID {
  @apply bg-gray-100 text-gray-500
}
</style>
