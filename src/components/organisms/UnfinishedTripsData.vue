<template>
  <div class="space-y-4">
    <h5 class="title">Daftar Trip Bermasalah</h5>
    <p class="subtitle">
      Trip argo yang tercatat di server namun belum pernah menjadi pesanan selesai — indikasi driver
      menghentikan aplikasi sebelum menyelesaikan pesanan.
    </p>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(driverName)="{ item }">
        <div class="flex flex-col">
          <span class="font-semibold">{{ item.driverName }}</span>
          <span class="text-xs text-gray-500">{{ item.vehicleCode }} &middot; {{ item.licensePlate }}</span>
        </div>
      </template>
      <template #cell(price)="{ value }">
        Rp {{ formatNumber(value as number) }}
      </template>
      <template #cell(distance)="{ value }">
        {{ formatNumber(value as number) }} Km
      </template>
      <template #cell(duration)="{ value }">
        {{ formatDuration(value as number) }}
      </template>
      <template #cell(startedAt)="{ value }">
        {{ formatDate(value as string) }}
      </template>
      <template #cell(status)="{ item }">
        <span class="status-pill" :class="statusClass(item.lastRecordedAt)">
          {{ statusLabel(item.lastRecordedAt) }}
        </span>
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { DateTime } from 'luxon';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import locationRecordDriverService from '@/services/location-record-driver/location-record-driver.api';
import type { PaginationRequest, TableField } from '@/types/Main';
import { formatDate, formatNumber, handleErrorResponse } from '@/utils/common';
import type { UnfinishedTrip } from '@/types/Data';

const pagination: Ref<PaginationRequest> = ref({
  page: 1,
  limit: 10,
  totalPages: 0,
  totalRows: 0,
  search: ''
})

const columns: Ref<TableField[]> = ref([
  { name: 'driverName', title: 'Driver' },
  { name: 'transactionNumber', title: 'No. Transaksi' },
  { name: 'startedAt', title: 'Mulai Trip' },
  { name: 'duration', title: 'Durasi' },
  { name: 'distance', title: 'Jarak' },
  { name: 'price', title: 'Tarif Berjalan' },
  { name: 'status', title: 'Status' }
])

const rows: Ref<UnfinishedTrip[]> = ref([])

const formatDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

const minutesSince = (isoDate: string): number => {
  const then = DateTime.fromISO(isoDate, { setZone: true })
  return DateTime.now().diff(then, 'minutes').minutes
}

const statusLabel = (lastRecordedAt: string): string => {
  const minutes = minutesSince(lastRecordedAt)
  if (minutes < 30) return 'Masih Berjalan'
  if (minutes < 120) return 'Perlu Dipantau'
  return 'Kemungkinan Ditinggalkan'
}

const statusClass = (lastRecordedAt: string): string => {
  const minutes = minutesSince(lastRecordedAt)
  if (minutes < 30) return 'is-info'
  if (minutes < 120) return 'is-warning'
  return 'is-danger'
}

const getUnfinishedTrips = async (): Promise<void> => {
  rows.value = []
  try {
    const response = await locationRecordDriverService.getUnfinishedTrips(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    rows.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getUnfinishedTrips()
}

onMounted(() => {
  getUnfinishedTrips()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.subtitle {
  @apply text-sm text-gray-500
}

.status-pill {
  @apply text-xs font-bold text-white rounded-full px-3 py-1 whitespace-nowrap
}

.status-pill.is-info {
  @apply bg-blue-500
}

.status-pill.is-warning {
  @apply bg-amber-500
}

.status-pill.is-danger {
  @apply bg-red-600
}
</style>
