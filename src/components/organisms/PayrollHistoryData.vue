<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.payrollHistory') }}</h5>
    <div class="flex flex-wrap items-center gap-3">
      <select v-model="periodId" class="filter" @change="applyFilters">
        <option v-for="period in periods" :key="period.id" :value="period.id">{{ periodLabel(period) }}</option>
      </select>
      <input v-model="search" type="search" class="filter" :placeholder="t('label.searchDriver')"
        @keyup.enter="applyFilters" />
      <MainButton :label="t('label.search')" outline white @click="applyFilters" />
      <div class="flex-1" />
      <MainButton :label="t('label.downloadExcel')" :loading="downloading" :disabled="downloading"
        @click="downloadExcel" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ item }">
        <div class="flex gap-3">
          <button type="button" class="action-link" @click="detail(item.id)">{{ t('label.detail') }}</button>
          <button v-if="canManage && item.periodStatus === 'OPEN'" type="button" class="action-link"
            @click="edit(item.id)">{{ t('label.update') }}</button>
        </div>
      </template>
      <template #cell(netAmount)="{ item }">
        <span :class="{ negative: item.netAmount < 0 }">{{ formatRupiah(item.netAmount) }}</span>
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
import * as XLSX from 'xlsx'
import MainButton from '../atoms/MainButton.vue'
import CustomTable from '../atoms/CustomTable.vue'
import CustomTablePagination from '../atoms/CustomTablePagination.vue'
import ModalPayrollProcess from '../molecules/modals/ModalPayrollProcess.vue'
import ModalPayrollDetail from '../molecules/modals/ModalPayrollDetail.vue'
import { useModalStore } from '@/stores/modal'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { canManagePayroll } from '@/utils/roles'
import { formatRupiah, formatWib, formatWorkDate } from '@/utils/payroll-format'
import { buildPayrollSheetRows, PAYROLL_EXPORT_WIDTHS } from '@/utils/payroll-export'
import payrollService from '@/services/payroll/payroll.api'
import type { PaginationRequest, TableField } from '@/types/Main'
import type { PayrollPeriod, PayrollRow } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const emits = defineEmits<{
  changed: []
}>()

const canManage = canManagePayroll(getCurrentUser().role)
const periods: Ref<PayrollPeriod[]> = ref([])
const periodId: Ref<number | ''> = ref('')
const search = ref('')

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField<any>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  { name: 'processedAt', title: t('names.processedAt'), field: (val: string) => formatWib(val) },
  { name: 'workDate', title: t('names.workDate'), field: (val: string | null) => formatWorkDate(val) },
  { name: 'driverName', title: t('names.driverName') },
  { name: 'orderCount', title: t('names.orderCount') },
  { name: 'baseAmount', title: t('names.baseSalary'), field: (val: number) => formatRupiah(val) },
  { name: 'deductionAmount', title: t('names.deduction'), field: (val: number) => formatRupiah(val) },
  { name: 'bonusAmount', title: t('names.bonus'), field: (val: number) => formatRupiah(val) },
  { name: 'netAmount', title: t('names.netSalary') },
  { name: 'processedBy', title: t('names.processedBy') }
])

const rows: Ref<(PayrollRow & { actions: number })[]> = ref([])

const periodLabel = (period: PayrollPeriod): string =>
  period.status === 'OPEN'
    ? t('label.periodRunning', { date: formatWib(period.openedAt) })
    : `${formatWib(period.openedAt)} – ${formatWib(period.closedAt)}`

const loadPeriods = async (): Promise<void> => {
  periods.value = (await payrollService.getPeriods()).data
  const open = periods.value.find((period) => period.status === 'OPEN')
  // pilih periode berjalan bila belum ada pilihan atau pilihan lama sudah hilang
  if (!periods.value.some((period) => period.id === periodId.value)) {
    periodId.value = open?.id ?? ''
  }
}

const loadPayrolls = async (): Promise<void> => {
  const response = await payrollService.getPayrolls({
    periodId: periodId.value,
    search: search.value.trim(),
    page: pagination.value.page,
    limit: pagination.value.limit
  })
  pagination.value.totalPages = response.pageCount
  pagination.value.totalRows = response.total
  rows.value = response.data.map((item) => ({ ...item, actions: item.id }))
}

const refresh = async (): Promise<void> => {
  try {
    await loadPeriods()
    await loadPayrolls()
  } catch (error) {
    handleErrorResponse(error)
  }
}

const applyFilters = (): void => {
  pagination.value.page = 1
  loadPayrolls().catch(handleErrorResponse)
}

const changePage = (page: number): void => {
  pagination.value.page = page
  loadPayrolls().catch(handleErrorResponse)
}

// Excel berisi semua baris sesuai filter periode & pencarian (bukan hanya halaman yang tampil).
// Backend membatasi 100 baris per halaman, jadi diambil per halaman.
const EXPORT_PAGE_SIZE = 100
const downloading = ref(false)

const downloadExcel = async (): Promise<void> => {
  downloading.value = true
  try {
    const params = { periodId: periodId.value, search: search.value.trim(), limit: EXPORT_PAGE_SIZE }
    const all: PayrollRow[] = []
    let pageCount = 1
    for (let page = 1; page <= pageCount; page++) {
      const response = await payrollService.getPayrolls({ ...params, page })
      all.push(...response.data)
      pageCount = response.pageCount
    }

    const period = periods.value.find((item) => item.id === periodId.value)
    const periodText = period ? periodLabel(period) : 'Semua periode'
    const searchText = params.search ? ` - pencarian "${params.search}"` : ''
    const sheet = XLSX.utils.aoa_to_sheet(buildPayrollSheetRows(all, `Riwayat Penggajian ${periodText}${searchText}`))
    sheet['!cols'] = PAYROLL_EXPORT_WIDTHS.map((wch) => ({ wch }))
    const book = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(book, sheet, 'Riwayat Penggajian')
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })
    XLSX.writeFile(book, `riwayat_penggajian${period ? `_periode_${period.id}` : ''}_${today}.xlsx`)
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    downloading.value = false
  }
}

const detail = (id: number): void => {
  modal.openModal({
    component: ModalPayrollDetail,
    props: { title: t('title.payrollDetail'), id }
  })
}

const edit = (id: number): void => {
  modal.openModal({
    component: ModalPayrollProcess,
    props: { title: t('title.editPayroll'), payrollId: id }
  })
  modal.onOk(() => {
    emits('changed')
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

.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.action-link {
  @apply text-primaryDarkBlue font-semibold underline
}

.negative {
  @apply text-red-600
}
</style>
