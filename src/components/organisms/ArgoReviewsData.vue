<template>
  <div class="space-y-4">
    <h5 class="title">Daftar Ulasan Argo</h5>
    <p class="subtitle">Ulasan yang dikirim penumpang lewat scan QR selama perjalanan argo.</p>
    <CustomTable :columns="columns" :rows="rows">
      <template #cell(driverName)="{ item }">
        <div class="flex flex-col">
          <span class="font-semibold">{{ item.driverName }}</span>
          <span class="text-xs text-gray-500">{{ item.vehicleCode }} &middot; {{ item.licensePlate }}</span>
        </div>
      </template>
      <template #cell(rating)="{ value }">
        <div class="flex items-center">
          <span v-for="star in 5" :key="star" class="material-symbols-outlined star-icon"
            :class="{ 'star-filled': star <= (value as number) }">
            star
          </span>
        </div>
      </template>
      <template #cell(review)="{ value }">
        <span class="review-text">{{ value || '-' }}</span>
      </template>
      <template #cell(createdAt)="{ value }">
        {{ formatDate(value as string) }}
      </template>
    </CustomTable>
    <div class="flex w-full justify-end items-center">
      <CustomTablePagination :pagination="pagination" @page-changed="paginationRequest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import CustomTable from '../atoms/CustomTable.vue';
import CustomTablePagination from '../atoms/CustomTablePagination.vue';
import argoRatingService from '@/services/argo-rating/argo-rating.api';
import type { PaginationRequest, TableField } from '@/types/Main';
import { formatDate, handleErrorResponse } from '@/utils/common';
import type { ArgoReview } from '@/types/Data';

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
  { name: 'rating', title: 'Rating' },
  { name: 'review', title: 'Ulasan' },
  { name: 'createdAt', title: 'Tanggal' }
])

const rows: Ref<ArgoReview[]> = ref([])

const getAllReviews = async (): Promise<void> => {
  rows.value = []
  try {
    const response = await argoRatingService.getAllReviews(pagination.value)
    pagination.value.totalPages = response.pageCount
    pagination.value.totalRows = response.total
    rows.value = response.data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const paginationRequest = async (page: number): Promise<void> => {
  pagination.value.page = page
  await getAllReviews()
}

onMounted(() => {
  getAllReviews()
})
</script>

<style scoped>
.title {
  @apply font-semibold text-lg
}

.subtitle {
  @apply text-sm text-gray-500
}

.star-icon {
  @apply text-lg text-gray-300
}

.star-filled {
  @apply text-amber-400
}

.review-text {
  @apply block max-w-xs whitespace-normal
}
</style>
