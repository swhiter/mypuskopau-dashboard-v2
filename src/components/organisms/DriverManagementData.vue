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
import type { ExtendedDriver } from '@/types/Data';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import CustomTableImageViewer from '../atoms/CustomTableImageViewer.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import { formState } from '@/injects/keys';
import { useModalStore } from '@/stores/modal';
import ModalDriver from '../molecules/modals/ModalDriver.vue';

const { t } = useI18n()
const modal = useModalStore()

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
    name: 'totalIncome',
    title: t('label.totalEarnings')
  },
  {
    name: 'photo',
    title: t('label.profilePhoto')
  },
])

const rows: Ref<ExtendedDriver[]> = ref([])

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

const edit = async (id: number): Promise<void> => {
  modal.openModal({
    component: ModalDriver,
    props: {
      title: `${t('label.update')} ${t('title.driverInformationData')}`, id: id
    }
  })
  modal.onOk(async () => {
    await getDrivers()
  })
}

const detail = async (id: number): Promise<void> => {
  modal.openModal({
    component: ModalDriver,
    props: {
      title: `${t('label.view')} ${t('title.driverInformationData')}`, id: id, readonly: true
    }
  })
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