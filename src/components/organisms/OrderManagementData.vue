<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.orderHistoryInformationData') }}</h5>
    <div class="flex justify-between items-end">
      <div class="flex space-x-2 items-end">
        <DateForm name="startDate" :label="t('names.startDate')" v-model="startDate" bordered is-separate-row />
        <DateForm name="endDate" :label="t('names.endDate')" v-model="endDate" bordered is-separate-row />
        <MainButton :label="t('label.search')" outline />
      </div>
      <MainButton :label="t('label.downloadReport')" white outline />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @detail="detail" hide-edit />
      </template>
      <template #cell(price)="{ value }">
        <span class="text-accentDarkGreen">{{ value }}</span>
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationRequest, TableField } from '@/types/Main';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import orderService from '@/services/order/order.api';
import { formatDate, formatNumber, handleErrorResponse } from '@/utils/common';
import type { TableItemTransaction } from '@/types/Data';
import MainButton from '../atoms/MainButton.vue';
import DateForm from '../atoms/DateForm.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import { useModalStore } from '@/stores/modal';
import ModalOrder from '../molecules/modals/ModalOrder.vue';

const { t } = useI18n()
const modal = useModalStore()

const startDate: Ref<string | null> = ref(null)
const endDate: Ref<string | null> = ref(null)
const currency: Ref<string> = ref('Rp')

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
    name: 'orderNumber',
    title: t('label.orderNumber')
  },
  {
    name: 'orderDate',
    title: t('label.orderDate'),
    field: (value) => formatDate(value as string)
  },
  {
    name: 'price',
    title: t('label.orderPrice'),
    field: (value) => `${currency.value}${formatNumber(value as number)}`
  },
  {
    name: 'customerName',
    title: t('label.customerName')
  },
  {
    name: 'destinationAddress',
    title: t('label.destinationAddress')
  },
  {
    name: 'distance',
    title: t('label.distance')
  },
  {
    name: 'driverName',
    title: t('label.driverName')
  },
  {
    name: 'licensePlate',
    title: t('label.licensePlate')
  }
])

const rows: Ref<TableItemTransaction[]> = ref([])

const detail = async (id: number): Promise<void> => {
  modal.openModal({
    component: ModalOrder,
    props: {
      title: `${t('label.view')} ${t('title.orderHistoryInformationData')}`, id: id
    }
  })
}

const getOrders = async (): Promise<void> => {
  rows.value = []
  const payload = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    orderDirection: 'DESC',
    orderBy: 'createdAt',
    startDate: startDate.value,
    endDate: endDate.value
  }
  try {
    const response = await orderService.getOrders(payload)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    for (let item of response.data) {
      const res: TableItemTransaction = {
        actions: item.id,
        orderNumber: item.transactionNumber,
        orderDate: item.createdAt,
        price: parseInt(item.orderDetail.price),
        customerEmail: item.customerEmail,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        destinationAddress: item.orderDetail.destinationAddress,
        distance: parseInt(item.orderDetail.distance),
        driverName: item.driver ? item.driver.name : '',
        licensePlate: item.driver ? item.driver.licensePlate : ''
      }
      rows.value.push(res)
    }
  } catch (error) {
    console.log(error)
    handleErrorResponse(error)
  }
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getOrders()
}

onMounted(() => {
  getOrders()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>