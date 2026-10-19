<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.payrollPending') }}</h5>
    <div class="flex flex-wrap items-center gap-3">
      <input v-model="search" type="search" class="filter" :placeholder="t('label.searchDriver')"
        @keyup.enter="refresh" />
      <MainButton :label="t('label.search')" outline white @click="refresh" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ item }">
        <button v-if="canManage" type="button" class="action-link" @click="process(item)">
          {{ t('label.processPayroll') }}
        </button>
        <span v-else>-</span>
      </template>
    </CustomTable>
    <p v-if="!loading && rows.length === 0" class="text-sm text-accentGray">{{ t('label.noPendingPayroll') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref, type Ref } from 'vue'
import MainButton from '../atoms/MainButton.vue'
import CustomTable from '../atoms/CustomTable.vue'
import ModalPayrollProcess from '../molecules/modals/ModalPayrollProcess.vue'
import { useModalStore } from '@/stores/modal'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { canManagePayroll } from '@/utils/roles'
import { formatRupiah, formatWib, formatWorkDate } from '@/utils/payroll-format'
import payrollService from '@/services/payroll/payroll.api'
import type { TableField } from '@/types/Main'
import type { PendingDriver } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()

const emits = defineEmits<{
  changed: []
}>()

const canManage = canManagePayroll(getCurrentUser().role)
const search = ref('')
const loading = ref(false)

const columns: Ref<TableField<any>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  { name: 'workDate', title: t('names.workDate'), field: (val: string) => formatWorkDate(val) },
  { name: 'driverName', title: t('names.driverName') },
  { name: 'vehicleCode', title: t('names.vehicleCode') },
  { name: 'orderCount', title: t('names.orderCount') },
  { name: 'baseAmount', title: t('names.baseSalary'), field: (val: number) => formatRupiah(val) },
  { name: 'orderRange', title: t('names.orderRange') }
])

const rows: Ref<(PendingDriver & { actions: number; orderRange: string })[]> = ref([])

const refresh = async (): Promise<void> => {
  loading.value = true
  try {
    const { data } = await payrollService.getPending(search.value.trim() || undefined)
    rows.value = data.map((item) => ({
      ...item,
      actions: item.driverId,
      orderRange: `${formatWib(item.firstOrderAt)} – ${formatWib(item.lastOrderAt)}`
    }))
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const process = (item: PendingDriver): void => {
  modal.openModal({
    component: ModalPayrollProcess,
    props: { title: t('title.processPayroll'), driverId: item.driverId, workDate: item.workDate }
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
</style>
