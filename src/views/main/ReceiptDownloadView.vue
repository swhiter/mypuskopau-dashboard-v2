<template>
  <PageContainer :title="$t('title.receiptDownload')">
    <PageCard>
      <div class="space-y-4">
        <form class="flex flex-wrap items-end gap-3" @submit.prevent="search">
          <label class="text-sm">
            <span class="block text-accentGray">Nomor transaksi</span>
            <input v-model="filters.transactionNumber" inputmode="numeric" class="filter" placeholder="mis. 202611171234" />
          </label>
          <span class="pb-2 text-sm text-accentGray">atau</span>
          <label class="text-sm">
            <span class="block text-accentGray">Dari</span>
            <input v-model="filters.from" type="date" class="filter" :max="today" :disabled="byNumber" />
          </label>
          <label class="text-sm">
            <span class="block text-accentGray">Sampai</span>
            <input v-model="filters.to" type="date" class="filter" :max="today" :disabled="byNumber" />
          </label>
          <label class="text-sm">
            <span class="block text-accentGray">Nama driver</span>
            <input v-model="filters.driver" class="filter" :disabled="byNumber" />
          </label>
          <button type="submit" class="btn-primary" :disabled="loading">{{ loading ? 'Mencari…' : 'Cari' }}</button>
        </form>

        <div class="overflow-x-auto">
          <table class="w-full text-sm report">
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Tanggal</th>
                <th>Pelanggan</th>
                <th>Driver</th>
                <th>Mobil</th>
                <th>Pembayaran</th>
                <th class="num">Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.transactionNumber">
                <td class="font-mono">{{ row.transactionNumber }}</td>
                <td>{{ formatWib(row.createdAt) }}</td>
                <td>{{ row.customerName || '-' }}</td>
                <td>{{ row.driverName || '-' }}</td>
                <td>{{ row.carName || '-' }}</td>
                <td>{{ (row.paymentMethod || '-').toUpperCase() }}{{ row.orderType === 'SEWA' ? ' · SEWA' : '' }}</td>
                <td class="num">{{ formatRupiah(row.total) }}</td>
                <td :class="row.downloadable ? 'text-green-700' : 'text-orange-700'">{{ receiptStatusLabel(row) }}</td>
                <td>
                  <button
                    class="btn-primary whitespace-nowrap"
                    :disabled="!row.downloadable || downloading === row.transactionNumber"
                    :title="row.downloadable ? '' : 'Struk hanya untuk order yang sudah lunas'"
                    @click="download(row.transactionNumber)"
                  >
                    {{ downloading === row.transactionNumber ? 'Menyiapkan…' : 'Unduh PDF' }}
                  </button>
                </td>
              </tr>
              <tr v-if="searched && !rows.length">
                <td colspan="9" class="text-center text-accentGray">Transaksi tidak ditemukan.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-accentGray">
          Menampilkan maksimal 50 transaksi terbaru (rentang tanggal maks. 31 hari). Struk dibuat ulang dari data transaksi saat
          ini, termasuk bila order pernah dikoreksi.
        </p>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import httpClient from '@/services/httpClient'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah, formatWib } from '@/utils/payroll-format'
import { todayWib } from '@/utils/cash-labels'
import {
  receiptFileName,
  receiptSearchParams,
  receiptStatusLabel,
  type ReceiptFilters,
  type ReceiptRow
} from '@/utils/receipt-download'
import type { GeneralResponse } from '@/types/Main'

const today = todayWib()
const filters = ref<ReceiptFilters>({ transactionNumber: '', from: today, to: today, driver: '' })
const rows = ref<ReceiptRow[]>([])
const loading = ref(false)
const searched = ref(false)
const downloading = ref<string | null>(null)
const byNumber = computed(() => filters.value.transactionNumber.trim() !== '')

const search = async (): Promise<void> => {
  loading.value = true
  try {
    const response = await httpClient.get<GeneralResponse<ReceiptRow[]>>('/order-invoice', {
      params: receiptSearchParams(filters.value)
    })
    rows.value = response.data
    searched.value = true
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const download = async (transactionNumber: string): Promise<void> => {
  downloading.value = transactionNumber
  try {
    const blob = await httpClient.get<Blob>(`/order-invoice/${transactionNumber}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = receiptFileName(transactionNumber)
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    downloading.value = null
  }
}
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100
}

.btn-primary {
  @apply rounded-lg bg-primaryDarkBlue px-4 py-2 text-sm font-semibold text-white disabled:opacity-40
}

.report td,
.report th {
  @apply px-3 py-1.5 text-left border-b border-gray-100
}

.report thead {
  @apply bg-gray-100
}

.num {
  @apply text-right whitespace-nowrap
}
</style>
