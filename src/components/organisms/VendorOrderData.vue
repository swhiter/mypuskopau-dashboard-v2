<template>
  <div class="space-y-4">
    <h5 class="title">{{ t('title.vendorOrderHistory') }}</h5>
    <div class="flex flex-wrap w-full items-end gap-3">
      <input v-model="filters.search" type="search" class="filter" :placeholder="t('label.searchVendorOrder')"
        @keyup.enter="applyFilters" />
      <select v-model="filters.vendorId" class="filter" @change="applyFilters">
        <option value="">{{ t('label.allVendors') }}</option>
        <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">{{ vendor.name }}</option>
      </select>
      <input v-model="filters.startDate" type="date" class="filter" @change="applyFilters" />
      <span class="self-center">-</span>
      <input v-model="filters.endDate" type="date" class="filter" @change="applyFilters" />
      <MainButton :label="t('label.search')" outline white @click="applyFilters" />
      <div class="flex-1" />
      <MainButton :label="t('label.inputVendorOrder')" @click="add" />
    </div>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(actions)="{ value }">
        <CustomTableButton :value="value" @edit="edit" @delete="deleteConfirmation" hide-disburse hide-detail
          show-delete />
      </template>
      <template #cell(hasPhoto)="{ item }">
        <button v-if="item.hasPhoto" type="button" class="photo-link" @click="openPhoto(item.id)">
          {{ t('label.view') }}
        </button>
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
import CustomTableButton from '../atoms/CustomTableButton.vue'
import CustomTablePagination from '../atoms/CustomTablePagination.vue'
import ModalVendorOrder from '../molecules/modals/ModalVendorOrder.vue'
import { useModalStore } from '@/stores/modal'
import { useToasterStore } from '@/stores/toaster'
import { handleErrorResponse } from '@/utils/common'
import vendorService from '@/services/vendor/vendor.api'
import vendorOrderService from '@/services/vendor/vendor-order.api'
import type { PaginationRequest, TableField } from '@/types/Main'
import type { ExtendedVendorOrder, Vendor } from '@/types/Data'

const { t } = useI18n()
const modal = useModalStore()
const toast = useToasterStore()

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const filters = ref({
  search: '',
  vendorId: '' as number | '',
  startDate: '',
  endDate: ''
})

const formatDateTime = (value: string): string =>
  new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

const formatRupiah = (value: number): string => 'Rp ' + Number(value).toLocaleString('id-ID')

const columns: Ref<TableField<any>[]> = ref([
  { name: 'actions', title: t('label.actions') },
  { name: 'tripDate', title: t('names.tripDate'), field: (val: string) => formatDateTime(val) },
  { name: 'vendorName', title: t('names.vendorName') },
  { name: 'vendorReference', title: t('names.vendorReference') },
  { name: 'transactionNumber', title: t('names.transactionNumber') },
  { name: 'driverName', title: t('names.driverName') },
  { name: 'carName', title: t('names.carName') },
  { name: 'customerName', title: t('names.customerName') },
  { name: 'route', title: t('names.route') },
  { name: 'price', title: t('names.price'), field: (val: number) => formatRupiah(val) },
  { name: 'hasPhoto', title: t('names.receiptPhoto') }
])

const rows: Ref<(ExtendedVendorOrder & { route: string })[]> = ref([])
const vendors: Ref<Vendor[]> = ref([])

const getVendorOrders = async (): Promise<void> => {
  try {
    const response = await vendorOrderService.getVendorOrders({
      page: pagination.value.page,
      limit: pagination.value.limit,
      search: filters.value.search,
      vendorId: filters.value.vendorId,
      startDate: filters.value.startDate,
      endDate: filters.value.endDate
    })
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    rows.value = response.data.map((item) => ({
      ...item,
      actions: item.id,
      route: `${item.pickupAddress} → ${item.destinationAddress}`
    }))
  } catch (error) {
    handleErrorResponse(error)
  }
}

const getVendors = async (): Promise<void> => {
  try {
    vendors.value = (await vendorService.getVendors()).data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const applyFilters = (): void => {
  pagination.value.page = 1
  getVendorOrders()
}

const changePage = (page: number): void => {
  pagination.value.page = page
  getVendorOrders()
}

const add = (): void => {
  modal.openModal({
    component: ModalVendorOrder,
    props: { title: t('label.add'), isAdd: true }
  })
  modal.onOk(() => {
    getVendorOrders()
  })
}

const edit = (id: number): void => {
  modal.openModal({
    component: ModalVendorOrder,
    props: { title: t('label.update'), isAdd: false, id }
  })
  modal.onOk(() => {
    getVendorOrders()
  })
}

const deleteConfirmation = (id: number): void => {
  const row = rows.value.find((item) => item.id == id)
  modal.openConfirmationModal(
    t('message.deleteVendorOrder', {
      reference: row?.vendorReference ?? '-',
      transaction: row?.transactionNumber ?? '-'
    })
  )
  modal.onOk(async () => {
    try {
      await vendorOrderService.deleteVendorOrder(id)
      toast.success({ text: t('alert.successDelete') })
      getVendorOrders()
    } catch (error) {
      handleErrorResponse(error)
    }
  })
}

// Foto struk ber-guard token: ambil blob lalu buka di tab baru
const openPhoto = async (id: number): Promise<void> => {
  const tab = window.open('', '_blank')
  try {
    const url = URL.createObjectURL(await vendorOrderService.getVendorOrderPhoto(id))
    if (tab) {
      tab.location.href = url
    } else {
      window.open(url, '_blank')
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    tab?.close()
    handleErrorResponse(error)
  }
}

defineExpose({ getVendors })

onMounted(() => {
  getVendors()
  getVendorOrders()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.photo-link {
  @apply text-primaryDarkBlue underline
}
</style>
