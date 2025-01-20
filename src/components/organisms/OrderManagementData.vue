<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.orderHistoryInformationData') }}</h5>
    <div class="flex justify-between items-end">
      <div class="flex space-x-2 items-end">
        <DateForm name="startDate" :label="t('names.startDate')" v-model="startDate" bordered is-separate-row />
        <DateForm name="endDate" :label="t('names.endDate')" v-model="endDate" bordered is-separate-row />
        <MainButton :label="t('label.search')" outline @click="search" />
      </div>
      
      <div class="flex space-x-2 items-end">
        <InputForm name="searchDriver" :label="`${$t('names.searchDriver')}`" v-model="driverNameFilter"
      is-separate-row bordered type="text" />
        
      <MainButton :label="t('label.downloadReport')" white outline @click="downloadCSV" :loading="downloadLoading" />
    </div>
    </div>
    <CustomTable :columns="columns" :rows="filteredRows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @detail="detail" hide-edit hide-disburse />
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
import type { PaginatedResponse, PaginationRequest, TableField } from '@/types/Main';
import { onMounted, ref, computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import InputForm from '@/components/atoms/InputForm.vue';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTableButton from '../atoms/CustomTableButton.vue';
import orderService from '@/services/order/order.api';
import { formatDate, formatNumber, handleErrorResponse } from '@/utils/common';
import type { TableItemTransaction, Transaction } from '@/types/Data';
import MainButton from '../atoms/MainButton.vue';
import DateForm from '../atoms/DateForm.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import { useModalStore } from '@/stores/modal';
import ModalOrder from '../molecules/modals/ModalOrder.vue';

const { t } = useI18n()
const modal = useModalStore()

const downloadLoading: Ref<boolean> = ref(false)

const startDate: Ref<string | null> = ref(null)
const endDate: Ref<string | null> = ref(null)
const currency: Ref<string> = ref('Rp')
const driverNameFilter: Ref<string> = ref('');

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 100,
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
    name: 'paymentMethod',
    title: t('label.paymentMethod')
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
    title: t('label.distance') + ' (km)'
  },
  {
    name: 'driverName',
    title: t('label.driverName')
  },
  {
    name: 'licensePlate',
    title: t('label.licensePlate')
  },
  {
    name: 'carName',
    title: t('label.carName')
  },
  {
    name: 'driverIncome',
    title: t('label.driverIncome'),
    field: (value) => value ? `${currency.value}${formatNumber(value as number)}` : ''
  },
  {
    name: 'managementIncome',
    title: t('label.managementIncome'),
    field: (value) => value ? `${currency.value}${formatNumber(value as number)}` : ''
  },
  {
    name: 'staffName',
    title: t('label.orderStaffName')
  }
])

const rows: Ref<TableItemTransaction[]> = ref([])

const filteredRows = computed(() => {
  if (!driverNameFilter.value) {
    return rows.value; // Jika tidak ada filter, tampilkan semua data
  }
  return rows.value.filter(row =>
    row.driverName.toLowerCase().includes(driverNameFilter.value.toLowerCase())
  );
});

const detail = async (trxId: string): Promise<void> => {
  modal.openModal({
    component: ModalOrder,
    props: {
      title: `${t('label.view')} ${t('title.orderHistoryInformationData')}`, trxId: trxId
    }
  })
}

const search = async (): Promise<void> => {
  pagination.value.page = 1
  await getOrders()
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
        actions: item.transactionNumber,
        orderNumber: item.transactionNumber,
        orderDate: item.createdAt,
        price: parseInt(item.orderDetail.price),
        paymentMethod: item.orderDetail.paymentMethod,
        customerEmail: item.customerEmail,
        customerName: item.customerName,
        customerPhone: item.customerPhone,
        destinationAddress: item.orderDetail.destinationAddress,
        distance: parseInt(item.orderDetail.distance),
        driverName: item.driver ? item.driver.name : '',
        licensePlate: item.driver ? item.driver.licensePlate : '',
        staffName: item.staff ? item.staff.name : '',
        carName: item.orderDetail.carName ?? '',
        driverIncome: item.orderDetail.driverIncome ? parseInt(item.orderDetail.driverIncome) : '',
        managementIncome: item.orderDetail.managementIncome ? parseInt(item.orderDetail.managementIncome) : ''
      }
      rows.value.push(res)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getOrders()
}

const setInitialDate = (): void => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)

  const year = firstDay.getFullYear()
  const month = String(firstDay.getMonth() + 1).padStart(2, '0')
  const day = String(firstDay.getDate()).padStart(2, '0')

  startDate.value = `${year}-${month}-${day}` // firstDay.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
}

const downloadCSV = async (): Promise<void> => {
  const payload = {
    page: 1,
    limit: 99999,
    orderDirection: 'DESC',
    orderBy: 'createdAt',
    startDate: startDate.value,
    endDate: endDate.value
  }
  downloadLoading.value = true
  try {
    const response: PaginatedResponse<Transaction> = await orderService.getOrders(payload);
    let header = '';
    let headerKey = '';
    let csvRows = '';
    const resRows = [];
    
    // Rows
    for (let item of response.data) {
        const res: TableItemTransaction = {
            actions: item.transactionNumber,
            orderNumber: item.transactionNumber,
            orderDate: formatDate(item.createdAt),
            price: parseInt(item.orderDetail.price),
            paymentMethod: item.orderDetail.paymentMethod,
            customerEmail: item.customerEmail,
            customerName: item.customerName,
            customerPhone: item.customerPhone,
            destinationAddress: item.orderDetail.destinationAddress,
            distance: parseInt(item.orderDetail.distance),
            driverName: item.driver ? item.driver.name : '',
            licensePlate: item.driver ? item.driver.licensePlate : '',
            staffName: item.staff ? item.staff.name : '',
            carName: item.orderDetail.carName ?? '',
            driverIncome: item.orderDetail.driverIncome ? parseInt(item.orderDetail.driverIncome) : '',
            managementIncome: item.orderDetail.managementIncome ? parseInt(item.orderDetail.managementIncome) : ''
        };
        resRows.push(res);
    }

    // Header
    for (const [index, item] of columns.value.entries()) {
        if (item.name != 'actions') {
            if (index + 1 === columns.value.length) {
                header += item.title;
                headerKey += item.name;
            } else {
                header += item.title + ';'; // Gunakan pembatas `;`
                headerKey += item.name + ';'; // Gunakan pembatas `;`
            }
        }
    }

    // Data Rows
    for (const [index, item] of resRows.entries()) {
        const head = headerKey.split(';');
        let row = '';
        for (const [keyIndex, key] of head.entries()) {
            if (key != 'actions') {
                const rawValue = item[key as keyof TableItemTransaction];
                // Escape nilai yang mengandung pembatas `;` atau tanda kutip
                const val = typeof rawValue === 'string' && (rawValue.includes(';') || rawValue.includes('"'))
                    ? `"${rawValue.replace(/"/g, '""')}"`
                    : rawValue;

                if (keyIndex + 1 === head.length) {
                    row += val;
                } else {
                    row += val + ';'; // Gunakan pembatas `;`
                }
            }
        }
        if (index + 1 != resRows.length) {
            row += '\n';
        }
        csvRows += row;
    }

    const csvContent = `${header}\n${csvRows}`;
    
    // Generate CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const start = startDate.value?.split('-').join('');
    const end = endDate.value?.split('-').join('');
    link.setAttribute('download', `order-${start}-${end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} catch (error) {
    handleErrorResponse(error);
} finally {
    downloadLoading.value = false;
}
}

onMounted(() => {
  setInitialDate()
  getOrders()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}
</style>