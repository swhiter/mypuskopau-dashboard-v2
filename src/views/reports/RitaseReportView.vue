<template>
  <PageContainer :title="$t('title.ritaseReport')">
    <PageCard :loading="loading">
      <div class="flex flex-wrap items-end gap-3">
        <div class="field">
          <label>{{ $t('names.startDate') }}</label>
          <input type="date" v-model="filter.startDate" class="input" />
        </div>
        <div class="field">
          <label>{{ $t('names.endDate') }}</label>
          <input type="date" v-model="filter.endDate" class="input" />
        </div>
        <div class="field">
          <label>{{ $t('names.carCategory') }}</label>
          <select v-model="filter.carCategory" class="input">
            <option value="">{{ $t('label.allCarCategories') }}</option>
            <option v-for="carType in CAR_TYPES" :key="carType" :value="carType">{{ carType }}</option>
          </select>
        </div>
        <MainButton :label="$t('label.filter')" @click="load" />
        <MainButton :label="$t('label.thisMonth')" outline white @click="resetToThisMonth" />
        <div class="flex-1" />
        <MainButton :label="$t('label.downloadExcel')" :disabled="!report" @click="downloadExcel" />
      </div>

      <div class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th v-for="column in COLUMNS" :key="column.key" :class="{ num: column.numeric }">{{ column.label }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in report?.rows ?? []" :key="row.date" :class="{ empty: row.ritase === 0 }">
              <td>{{ formatDate(row.date) }}</td>
              <td class="num">{{ row.unitOps }}</td>
              <td class="num">{{ row.ritase }}</td>
              <td class="num">{{ formatRupiah(row.potongan) }}</td>
              <td class="num">{{ formatRupiah(row.pendapatanBersih) }}</td>
              <td class="num">{{ formatRupiah(row.pendapatanKotor) }}</td>
              <td class="num">{{ formatRupiah(row.rataRata) }}</td>
              <td>{{ row.keterangan }}</td>
            </tr>
          </tbody>
          <tfoot v-if="report">
            <tr>
              <td>{{ $t('label.total') }}</td>
              <td class="num">{{ report.total.unitOps }}</td>
              <td class="num">{{ report.total.ritase }}</td>
              <td class="num">{{ formatRupiah(report.total.potongan) }}</td>
              <td class="num">{{ formatRupiah(report.total.pendapatanBersih) }}</td>
              <td class="num">{{ formatRupiah(report.total.pendapatanKotor) }}</td>
              <td class="num">{{ formatRupiah(report.total.rataRata) }}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import ritaseReportService, { type RitaseReport } from '@/services/reports/ritase-report.api'

// Jenis armada sesuai Manajemen Armada
const CAR_TYPES = ['Mobil Puskopau', 'Mobil Investor']

const COLUMNS = [
  { key: 'date', label: 'Tanggal', numeric: false },
  { key: 'unitOps', label: 'Unit OPS', numeric: true },
  { key: 'ritase', label: 'Ritase Puskopau', numeric: true },
  { key: 'potongan', label: 'Potongan per Hari 20%', numeric: true },
  { key: 'pendapatanBersih', label: 'Total Pendapatan Bersih', numeric: true },
  { key: 'pendapatanKotor', label: 'Total Pendapatan Kotor', numeric: true },
  { key: 'rataRata', label: 'Rata-rata Pendapatan Unit/Hari', numeric: true },
  { key: 'keterangan', label: 'Keterangan', numeric: false }
]

// Tanggal WIB hari ini (YYYY-MM-DD)
const todayWib = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })

const filter = ref({
  startDate: `${todayWib().slice(0, 8)}01`,
  endDate: todayWib(),
  carCategory: ''
})

const report = ref<RitaseReport | null>(null)
const loading = ref(false)

const formatDate = (date: string): string => date.split('-').reverse().join('/')

const load = async (): Promise<void> => {
  loading.value = true
  try {
    const { data } = await ritaseReportService.getRitase({
      startDate: filter.value.startDate,
      endDate: filter.value.endDate,
      ...(filter.value.carCategory ? { carCategory: filter.value.carCategory } : {})
    })
    report.value = data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const resetToThisMonth = (): void => {
  filter.value.startDate = `${todayWib().slice(0, 8)}01`
  filter.value.endDate = todayWib()
  load()
}

// Excel memakai data laporan yang sedang tampil (sudah sesuai filter), termasuk baris total
const downloadExcel = (): void => {
  if (!report.value) return
  const { rows, total, startDate, endDate, carCategory } = report.value
  const header = COLUMNS.map((column) => column.label)
  const body = rows.map((row) => [
    formatDate(row.date),
    row.unitOps,
    row.ritase,
    row.potongan,
    row.pendapatanBersih,
    row.pendapatanKotor,
    row.rataRata,
    row.keterangan
  ])
  const totalRow = ['TOTAL', total.unitOps, total.ritase, total.potongan, total.pendapatanBersih, total.pendapatanKotor, total.rataRata, '']
  const title = [`Laporan Ritase ${formatDate(startDate)} - ${formatDate(endDate)} (${carCategory ?? 'Semua jenis armada'})`]

  const sheet = XLSX.utils.aoa_to_sheet([title, [], header, ...body, totalRow])
  sheet['!cols'] = [12, 10, 16, 22, 24, 24, 30, 30].map((wch) => ({ wch }))
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'Laporan Ritase')
  const category = carCategory ? `_${carCategory.replace(/\s+/g, '_').toLowerCase()}` : ''
  XLSX.writeFile(book, `laporan_ritase_${startDate}_${endDate}${category}.xlsx`)
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.field {
  @apply flex flex-col space-y-1 text-sm
}

.input {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.table-wrapper {
  @apply w-full overflow-x-auto border border-buttonGray rounded-lg
}

.report-table {
  @apply w-full text-sm
}

.report-table th,
.report-table td {
  @apply px-3 py-2 border-b border-buttonGray whitespace-nowrap text-left
}

.report-table thead {
  @apply bg-gray-100
}

.report-table .num {
  @apply text-right
}

.report-table tr.empty td {
  @apply text-accentGray
}

.report-table tfoot td {
  @apply font-semibold bg-gray-50
}
</style>
