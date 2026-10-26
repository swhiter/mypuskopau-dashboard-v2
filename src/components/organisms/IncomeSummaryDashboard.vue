<template>
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
      <MainButton :label="$t('label.filter')" @click="load" />
      <MainButton label="Hari Ini" outline white @click="setRange(todayWib(), todayWib())" />
      <MainButton :label="$t('label.thisMonth')" outline white @click="setRange(`${todayWib().slice(0, 8)}01`, todayWib())" />
      <div class="flex-1" />
      <MainButton :label="$t('label.downloadExcel')" :disabled="!summary" @click="downloadExcel" />
    </div>

    <template v-if="summary">
      <p class="text-sm text-accentGray">{{ periodLabel }}</p>

      <section v-for="group in groups" :key="group.title" class="space-y-2">
        <h3 class="section-title">{{ group.title }}</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div v-for="item in group.items" :key="item.label" class="stat" :class="item.tone">
            <span class="stat-label">{{ item.label }}</span>
            <span class="stat-value">{{ item.value }}</span>
            <span v-if="item.note" class="stat-note">{{ item.note }}</span>
          </div>
        </div>
      </section>

      <section class="space-y-2">
        <h3 class="section-title">Pendapatan per Jenis Armada</h3>
        <div class="table-wrapper">
          <table class="report-table">
            <thead>
              <tr>
                <th>Jenis Armada</th>
                <th v-for="column in CATEGORY_COLUMNS" :key="column.key" class="num">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summary.byCategory" :key="row.category">
                <td>{{ row.category }}</td>
                <td v-for="column in CATEGORY_COLUMNS" :key="column.key" class="num">{{ display(column, valueOf(row, column.key)) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="summary.daily.length > 1" class="space-y-2">
        <h3 class="section-title">Rincian per Hari</h3>
        <div class="table-wrapper">
          <table class="report-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th v-for="column in DAILY_COLUMNS" :key="column.key" class="num">{{ column.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in summary.daily" :key="row.date" :class="{ empty: row.orderCount === 0 }">
                <td>{{ formatDate(row.date) }}</td>
                <td v-for="column in DAILY_COLUMNS" :key="column.key" class="num">{{ display(column, valueOf(row, column.key)) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>{{ $t('label.total') }}</td>
                <td v-for="column in DAILY_COLUMNS" :key="column.key" class="num">{{ display(column, valueOf(summary.total, column.key)) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </template>
  </PageCard>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import * as XLSX from 'xlsx'
import PageCard from '@/components/atoms/PageCard.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import incomeReportService, { type IncomeMetrics, type IncomeSummary } from '@/services/reports/income-report.api'

// Ringkasan pendapatan bendahara: total per rentang tanggal tanpa rincian per driver.
// Rumus dihitung di backend (/report/income-summary), sama dengan laporan
// Pendapatan Pengemudi & Dashboard Kas.

type Column = { key: keyof IncomeMetrics | 'managementAfterPetty'; label: string; count?: boolean }

// Kas kecil = 20% pendapatan manajemen + potongan 2% tarif driver. Hanya bagian
// 20% yang mengurangi manajemen; kolom bersih dihitung per baris, total dari backend.
const valueOf = (row: IncomeMetrics, key: Column['key']): number =>
  key === 'managementAfterPetty' ? row.managementIncome - row.pettyFromManagement : row[key]

const CATEGORY_COLUMNS: Column[] = [
  { key: 'orderCount', label: 'Order', count: true },
  { key: 'tarif', label: 'Total Tarif' },
  { key: 'totalPaid', label: 'Total Dibayar Penumpang' },
  { key: 'managementIncome', label: 'Pendapatan Manajemen (60%)' },
  { key: 'pettyCash', label: 'Kas Kecil' },
  { key: 'managementAfterPetty', label: 'Manajemen setelah Kas Kecil' },
  { key: 'driverIncome', label: 'Total Pendapatan Driver' }
]

const DAILY_COLUMNS: Column[] = [
  { key: 'orderCount', label: 'Order', count: true },
  { key: 'tarif', label: 'Total Tarif' },
  { key: 'chargePassenger', label: 'Tambahan Biaya' },
  { key: 'surcharge', label: 'Surcharge' },
  { key: 'totalPaid', label: 'Total Dibayar' },
  { key: 'managementIncome', label: 'Pendapatan Manajemen (60%)' },
  { key: 'pettyCash', label: 'Kas Kecil' },
  { key: 'managementAfterPetty', label: 'Manajemen setelah Kas Kecil' },
  { key: 'driverIncome', label: 'Total Pendapatan Driver' },
  { key: 'midtransFee', label: 'Biaya Midtrans' }
]

// Tanggal WIB hari ini (YYYY-MM-DD)
const todayWib = (): string => new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Jakarta' })

const filter = ref({ startDate: todayWib(), endDate: todayWib() })
const summary = ref<IncomeSummary | null>(null)
const loading = ref(false)

const formatDate = (date: string): string => date.split('-').reverse().join('/')
const formatCount = (value: number): string => Number(value ?? 0).toLocaleString('id-ID')
const display = (column: Column, value: number): string => (column.count ? formatCount(value) : formatRupiah(value))

const periodLabel = computed(() => {
  if (!summary.value) return ''
  const { startDate, endDate } = summary.value
  return startDate === endDate ? `Periode ${formatDate(startDate)}` : `Periode ${formatDate(startDate)} - ${formatDate(endDate)}`
})

type Stat = { label: string; value: string; note?: string; tone?: string }

const groups = computed<{ title: string; items: Stat[] }[]>(() => {
  const total = summary.value?.total
  if (!total) return []
  const account = (name: string) => summary.value?.byAccount.find((item) => item.account === name)
  const midtransOrders = account('MIDTRANS')?.orderCount ?? 0
  const cashOrders = account('CASH')?.orderCount ?? 0
  const vendorOrders = account('VENDOR')?.orderCount ?? 0
  const other = account('LAINNYA')

  return [
    {
      title: 'Ringkasan Transaksi',
      items: [
        { label: 'Jumlah Order', value: formatCount(total.orderCount), note: `${formatCount(total.activeDrivers)} driver aktif` },
        { label: 'Total Tarif', value: formatRupiah(total.tarif), note: `setelah diskon ${formatRupiah(total.discount)}` },
        { label: 'Total Tambahan Biaya', value: formatRupiah(total.chargePassenger) },
        { label: 'Total Surcharge', value: formatRupiah(total.surcharge) },
        { label: 'Total Dibayar Penumpang', value: formatRupiah(total.totalPaid), note: 'tarif + tambahan biaya + surcharge', tone: 'highlight' }
      ]
    },
    {
      title: 'Pembagian Pendapatan',
      items: [
        { label: 'Pendapatan Pengemudi (40%)', value: formatRupiah(total.driverCommission), note: '40% x total tarif' },
        { label: 'Pendapatan Manajemen (60%)', value: formatRupiah(total.managementIncome), note: '60% x total tarif' },
        { label: 'Potongan Midtrans Driver', value: formatRupiah(total.driverDeduction), note: '0,7% total dibayar + 2% tarif' },
        { label: 'Total Pendapatan Driver', value: formatRupiah(total.driverIncome), note: 'pengemudi + tambahan biaya + surcharge - potongan', tone: 'highlight' },
        { label: 'Kas Kecil', value: formatRupiah(total.pettyCash), note: `20% pendapatan manajemen ${formatRupiah(total.pettyFromManagement)} + 2% tarif potongan driver ${formatRupiah(total.pettyFromDriver)}` },
        { label: 'Pendapatan Manajemen setelah Kas Kecil', value: formatRupiah(total.managementAfterPetty), note: 'pendapatan manajemen (60%) - 20% kas kecil', tone: 'highlight' }
      ]
    },
    {
      title: 'Penerimaan Uang',
      items: [
        { label: 'Total Uang Midtrans (QRIS)', value: formatRupiah(total.midtransMoney), note: `${formatCount(midtransOrders)} order` },
        { label: 'Biaya Midtrans', value: formatRupiah(total.midtransFee), note: 'MDR 0,7% transaksi QRIS' },
        { label: 'Uang Midtrans Bersih', value: formatRupiah(total.midtransNet), note: 'uang Midtrans - biaya Midtrans' },
        { label: 'Total Uang Cash', value: formatRupiah(total.cashMoney), note: `${formatCount(cashOrders)} order` },
        { label: 'Total Uang Kas Vendor', value: formatRupiah(total.vendorMoney), note: `${formatCount(vendorOrders)} struk vendor` },
        ...(other
          ? [{ label: 'Metode Bayar Lainnya', value: formatRupiah(other.totalPaid), note: `${formatCount(other.orderCount)} order`, tone: 'warning' }]
          : [])
      ]
    },
    {
      title: 'Pendapatan Armada',
      items: (summary.value?.byCategory ?? []).map((row) => ({
        label: `Pendapatan ${row.category}`,
        value: formatRupiah(row.totalPaid),
        note: `${formatCount(row.orderCount)} order · tarif ${formatRupiah(row.tarif)}`
      }))
    }
  ]
})

const load = async (): Promise<void> => {
  loading.value = true
  try {
    summary.value = (await incomeReportService.getSummary({ ...filter.value })).data
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

const setRange = (startDate: string, endDate: string): void => {
  filter.value = { startDate, endDate }
  load()
}

// Excel memakai data yang sedang tampil: sheet ringkasan + rincian per hari
const downloadExcel = (): void => {
  if (!summary.value) return
  const { startDate, endDate, daily, total } = summary.value

  const summaryRows = [
    [`Ringkasan Pendapatan ${periodLabel.value}`],
    [],
    ...groups.value.flatMap((group) => [[group.title], ...group.items.map((item) => [item.label, item.value, item.note ?? '']), []])
  ]
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows)
  summarySheet['!cols'] = [40, 22, 50].map((wch) => ({ wch }))

  const header = ['Tanggal', ...DAILY_COLUMNS.map((column) => column.label)]
  const body = daily.map((row) => [formatDate(row.date), ...DAILY_COLUMNS.map((column) => valueOf(row, column.key))])
  const totalRow = ['TOTAL', ...DAILY_COLUMNS.map((column) => valueOf(total, column.key))]
  const dailySheet = XLSX.utils.aoa_to_sheet([header, ...body, totalRow])
  dailySheet['!cols'] = [12, ...DAILY_COLUMNS.map(() => 20)].map((wch) => ({ wch }))

  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, summarySheet, 'Ringkasan')
  XLSX.utils.book_append_sheet(book, dailySheet, 'Per Hari')
  XLSX.writeFile(book, `ringkasan_pendapatan_${startDate}_${endDate}.xlsx`)
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

.section-title {
  @apply font-semibold text-base
}

.stat {
  @apply flex flex-col p-4 bg-white rounded-lg border border-buttonGray space-y-1
}

.stat.highlight {
  @apply bg-blue-50 border-blue-200
}

.stat.warning {
  @apply bg-yellow-50 border-yellow-300
}

.stat-label {
  @apply text-sm text-accentGray
}

.stat-value {
  @apply text-xl font-semibold
}

.stat-note {
  @apply text-xs text-accentGray
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
