<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.driverInformationData') }}</h5>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" @detail="detail" />
      </template>
      <template #cell(photo)="{ value }">
        <CustomTableImageViewer :image="value" />
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomTable from '../atoms/CustomTable.vue';
import driverService from '@/services/drivers/drivers.api';
import type { PaginationRequest, TableField } from '@/types/Main';
import { handleErrorResponse } from '@/utils/common';
import type { Driver, ExtendedDriver } from '@/types/Data';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import CustomTableImageViewer from '../atoms/CustomTableImageViewer.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import { formState } from '@/injects/keys';

const { t } = useI18n()

const emits = defineEmits<{
  select: [driver: Driver]
}>()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField[]> = ref([
  {
    name: 'actions',
    title: t('label.actions')
  },
  {
    name: 'name',
    title: t('label.driverName')
  },
  {
    name: 'nik',
    title: t('label.idCardNumber')
  },
  {
    name: 'vehicleCode',
    title: t('label.vehicleCode')
  },
  {
    name: 'licensePlate',
    title: t('label.licensePlate')
  },
  {
    name: 'userId',
    title: t('label.driverId')
  },
  {
    name: 'totalEarnings',
    title: t('label.totalEarnings')
  },
  {
    name: 'photo',
    title: t('label.profilePhoto')
  },
])

const rows: Ref<ExtendedDriver[]> = ref([])
const selectedDriver: Ref<Driver | null> = ref(null)

const parentForm = inject(formState)

watch(parentForm!.submitted, (newValue, oldValue) => {
  if (newValue != oldValue) {
    getDrivers()
  }
})

const getDrivers = async (): Promise<void> => {
  rows.value = []
  try {
    const response = await driverService.getDrivers(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    for (let item of response.data) {
      const res: ExtendedDriver = Object.assign(item, { actions: item.id! })
      rows.value.push(res)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

const getDriverById = async (id: number): Promise<void> => {
  try {
    const response = await driverService.getDriverById(id)
    selectedDriver.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const edit = async (id: number): Promise<void> => {
  parentForm?.updateLoadingState()
  await getDriverById(id)
  emits('select', selectedDriver.value!)
  parentForm?.updateLoadingState()
}

const detail = async (id: number): Promise<void> => {
  await getDriverById(id)
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getDrivers()
}

onMounted(() => {
  getDrivers()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>