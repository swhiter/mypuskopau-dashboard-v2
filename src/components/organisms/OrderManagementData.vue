<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.orderHistoryInformationData') }}</h5>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @detail="detail" hide-edit />
      </template>
    </CustomTable>
  </div>
</template>

<script setup lang="ts">
import type { PaginationRequest, TableField } from '@/types/Main';
import { onMounted, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import orderService from '@/services/order/order.api';
import { handleErrorResponse } from '@/utils/common';

const { t } = useI18n()

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
    title: t('label.orderDate')
  },
  {
    name: 'orderPrice',
    title: t('label.orderPrice')
  }
])

const rows = ref([])

const startDate: Ref<string | null> = ref(null)
const endDate: Ref<string | null> = ref(null)

const detail = async (): Promise<void> => {
  // 
}

const getOrders = async (): Promise<void> => {
  rows.value = []
  const payload = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    orderDirection: 'DESC',
    orderBy: 'createdAt'
  }
  try {
    const response = await orderService.getOrders(payload)
    console.log(response)
  } catch (error) {
    handleErrorResponse(error)
  }
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