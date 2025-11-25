<!-- src/views/reports/IncomeReportView.vue -->
<template>
    <PageContainer :title="$t('title.incomeReport')">
        <!-- Tabs -->
        <div class="mb-4 border-b flex space-x-4">
            <button v-for="tab in tabs" :key="tab.key" class="px-4 py-2 text-sm font-medium border-b-2" :class="activeTab === tab.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
                " @click="activeTab = tab.key">
                {{ tab.label }}
            </button>
        </div>

        <!-- Pendapatan Rekapan -->
        <div v-if="activeTab === 'rekapan'" class="space-y-4">
            <PageCard>
                <!-- Filter Rekapan -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.startDate') }}</label>
                        <input type="date" v-model="rekapanFilter.startDate"
                            class="border rounded w-full px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.endDate') }}</label>
                        <input type="date" v-model="rekapanFilter.endDate"
                            class="border rounded w-full px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.driverName') }}</label>
                        <input type="text" v-model="rekapanFilter.driverName"
                            class="border rounded w-full px-3 py-2 text-sm"
                            :placeholder="$t('placeholder.driverName')" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.carName') }}</label>
                        <input type="text" v-model="rekapanFilter.carName"
                            class="border rounded w-full px-3 py-2 text-sm" :placeholder="$t('placeholder.carName')" />
                    </div>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <div class="space-x-2">
                        <MainButton :label="$t('label.filter')" @click="fetchRekapan" />
                        <MainButton :label="$t('label.reset')" type="secondary" @click="resetRekapanFilter" />
                    </div>
                    <div>
                        <MainButton :label="$t('label.downloadExcel')" type="secondary" @click="downloadRekapanExcel" />
                    </div>
                </div>

                <!-- Tabel Rekapan -->
                <CustomTable :columns="rekapanColumns" :rows="rekapanRows" :pagination="rekapanPagination"
                    @change-page="onChangeRekapanPage" />
            </PageCard>

            <!-- Grafik Performa Driver -->
            <DriverPerformanceChart :data="driverPerformanceData" />
        </div>

        <!-- Pendapatan Driver -->
        <div v-else class="space-y-4">
            <PageCard>
                <!-- Filter Pendapatan Driver -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.startDate') }}</label>
                        <input type="date" v-model="driverFilter.startDate"
                            class="border rounded w-full px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.endDate') }}</label>
                        <input type="date" v-model="driverFilter.endDate"
                            class="border rounded w-full px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.driverName') }}</label>
                        <input type="text" v-model="driverFilter.driverName"
                            class="border rounded w-full px-3 py-2 text-sm"
                            :placeholder="$t('placeholder.driverName')" />
                    </div>
                    <div>
                        <label class="text-sm font-medium text-gray-700">{{ $t('names.carName') }}</label>
                        <input type="text" v-model="driverFilter.carName"
                            class="border rounded w-full px-3 py-2 text-sm" :placeholder="$t('placeholder.carName')" />
                    </div>
                </div>

                <div class="flex justify-between items-center mb-4">
                    <div class="space-y-2">
                        <div class="space-x-2">
                            <MainButton :label="$t('label.filter')" @click="fetchPendapatanDriver" />
                            <MainButton :label="$t('label.reset')" type="secondary" @click="resetDriverFilter" />
                        </div>
                        <label class="inline-flex items-center text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" v-model="showDriverGroupedSummary" class="mr-2" />
                            {{ $t('label.showDriverGroupedSummary') }}
                        </label>
                    </div>

                    <div>
                        <MainButton :label="$t('label.downloadExcel')" type="secondary"
                            @click="downloadPendapatanDriverExcel" />
                    </div>
                </div>
                <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-gray-50 rounded-lg p-3 text-sm">
                        <div class="text-gray-500">{{ $t('names.totalTarif') }}</div>
                        <div class="font-semibold">
                            {{ formatCurrencyNumber(driverTotals.totalTarif) }}
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-3 text-sm">
                        <div class="text-gray-500">{{ $t('names.totalPendapatanDriver') }}</div>
                        <div class="font-semibold">
                            {{ formatCurrencyNumber(driverTotals.totalPendapatanDriver) }}
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-3 text-sm">
                        <div class="text-gray-500">{{ $t('names.totalPendapatanManagement') }}</div>
                        <div class="font-semibold">
                            {{ formatCurrencyNumber(driverTotals.totalPendapatanManagement) }}
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-3 text-sm">
                        <div class="text-gray-500">{{ $t('names.totalPotonganMidtrans') }}</div>
                        <div class="font-semibold">
                            {{ formatCurrencyNumber(driverTotals.totalPotonganMidtrans) }}
                        </div>
                    </div>
                </div>
                <div v-if="showDriverGroupedSummary && driverGroupedSummary.length > 0" class="mt-4">
                    <h4 class="font-semibold text-sm mb-2">
                        {{ $t('title.driverGroupedSummary') }}
                    </h4>

                    <div class="overflow-x-auto">
                        <table class="min-w-full text-xs border border-gray-200">
                            <thead class="bg-gray-100">
                                <tr>
                                    <th class="px-2 py-1 text-left">Driver</th>
                                    <th class="px-2 py-1 text-left">Mobil</th>
                                    <th class="px-2 py-1 text-right">Jumlah Order</th>
                                    <th class="px-2 py-1 text-right">Total Tarif</th>
                                    <th class="px-2 py-1 text-right">Total Pendapatan Driver</th>
                                    <th class="px-2 py-1 text-right">Total Pendapatan Management</th>
                                    <th class="px-2 py-1 text-right">Total Potongan Midtrans</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="row in driverGroupedSummary" :key="row.driverName" class="border-t">
                                    <td class="px-2 py-1">
                                        {{ row.driverName || '-' }}
                                    </td>
                                    <td class="px-2 py-1">
                                        <!-- gabung nama mobil dengan koma -->
                                        {{ row.carNames.join(', ') || '-' }}
                                    </td>
                                    <td class="px-2 py-1 text-right">
                                        {{ row.totalOrder }}
                                    </td>
                                    <td class="px-2 py-1 text-right">
                                        {{ formatCurrencyNumber(row.totalTarif) }}
                                    </td>
                                    <td class="px-2 py-1 text-right">
                                        {{ formatCurrencyNumber(row.totalPendapatanDriver) }}
                                    </td>
                                    <td class="px-2 py-1 text-right">
                                        {{ formatCurrencyNumber(row.totalPendapatanManagement) }}
                                    </td>
                                    <td class="px-2 py-1 text-right">
                                        {{ formatCurrencyNumber(row.totalPotonganMidtrans) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <!-- Tabel Pendapatan Driver -->
                <CustomTable :columns="driverColumns" :rows="driverRows" :pagination="driverPagination"
                    @change-page="onChangeDriverPage">
                    <template #cell(tarif)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                    <template #cell(chargePassenger)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                    <template #cell(surcharge)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                    <template #cell(pendapatanDriver)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                    <template #cell(pendapatanManagement)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                    <template #cell(potonganMidtrans)="{ value }">
                        {{ formatCurrencyNumber(value) }}
                    </template>

                </CustomTable>

            </PageCard>
        </div>
    </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageContainer from '@/components/atoms/PageContainer.vue'
import PageCard from '@/components/atoms/PageCard.vue'
import CustomTable from '@/components/atoms/CustomTable.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import DriverPerformanceChart, {
    type DriverPerformanceItem
} from '@/components/charts/DriverPerformanceChart.vue'
import incomeReportService, {
    type RekapanPendapatanRow,
    type PendapatanDriverRow,
    type IncomeFilterRequest
} from '@/services/reports/income-report.api'
import type { TableField, PaginationRequest } from '@/types/Main'
import { handleErrorResponse } from '@/utils/common'
const showDriverGroupedSummary = ref(false)

type DriverGroupedRow = {
    driverName: string
    carNames: string[]            // list unik mobil yang dipakai driver
    totalTarif: number
    totalPendapatanDriver: number
    totalPendapatanManagement: number
    totalPotonganMidtrans: number
    totalOrder: number
}

const driverGroupedSummary = computed<DriverGroupedRow[]>(() => {
    const map = new Map<
        string,
        {
            carNames: Set<string>
            totalTarif: number
            totalPendapatanDriver: number
            totalPendapatanManagement: number
            totalPotonganMidtrans: number
            totalOrder: number
        }
    >()

    for (const row of driverRows.value) {
        const key = row.driverName || 'Unknown'
        const entry =
            map.get(key) ||
            {
                carNames: new Set<string>(),
                totalTarif: 0,
                totalPendapatanDriver: 0,
                totalPendapatanManagement: 0,
                totalPotonganMidtrans: 0,
                totalOrder: 0
            }

        if (row.carName) {
            entry.carNames.add(row.carName)
        }

        entry.totalTarif += row.tarif || 0
        entry.totalPendapatanDriver += row.pendapatanDriver || 0
        entry.totalPendapatanManagement += row.pendapatanManagement || 0
        entry.totalPotonganMidtrans += row.potonganMidtrans || 0
        entry.totalOrder += 1

        map.set(key, entry)
    }

    return Array.from(map.entries()).map(([driverName, v]) => ({
        driverName,
        carNames: Array.from(v.carNames),
        totalTarif: v.totalTarif,
        totalPendapatanDriver: v.totalPendapatanDriver,
        totalPendapatanManagement: v.totalPendapatanManagement,
        totalPotonganMidtrans: v.totalPotonganMidtrans,
        totalOrder: v.totalOrder
    }))
})
// Tabs
const { t } = useI18n()
const tabs = [
    { key: 'rekapan', label: t('title.revenueRekapan') },
    { key: 'driver', label: t('title.revenueDriver') }
]
const activeTab = ref<'rekapan' | 'driver'>('rekapan')
const driverTotals = computed(() => {
    let totalTarif = 0
    let totalPendapatanDriver = 0
    let totalPendapatanManagement = 0
    let totalPotonganMidtrans = 0   // <--- BARU

    for (const row of driverRows.value) {
        totalTarif += row.tarif || 0
        totalPendapatanDriver += row.pendapatanDriver || 0
        totalPendapatanManagement += row.pendapatanManagement || 0
        totalPotonganMidtrans += row.potonganMidtrans || 0   // <--- BARU
    }

    return {
        totalTarif,
        totalPendapatanDriver,
        totalPendapatanManagement,
        totalPotonganMidtrans       // <--- BARU
    }
})
// Helper date: default 1 hari terakhir (hari ini s/d hari ini)
const formatDate = (d: Date): string => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
const today = new Date()
const defaultStart = formatDate(today) // boleh digeser -1 day kalau mau

// --------- STATE REKAPAN ---------
const rekapanFilter = ref({
    startDate: defaultStart,
    endDate: formatDate(today),
    driverName: '',
    carName: ''
})

const rekapanPagination: Ref<PaginationRequest> = ref({
    page: 1,
    limit: 99999,
    totalPages: 0,
    totalRows: 0,
    search: ''
})

// raw data dari API (strukturnya nested seperti response backend)
const rekapanRawData = ref<RekapanPendapatanRow[]>([])

// tipe row FLAT untuk tabel
type FlatRekapanRow = {
    transactionNumber: string
    createdAt: string            // sudah diformat rapi
    driverName: string
    carName: string
    paymentMethod: string
    distance: string             // "0 km"
    totalPendapatan: number
    pendapatanDriver: number
    managementIncome: number
    potonganMidtrans: number
}

// helper format rupiah
const formatCurrencyNumber = (val: number | string | null | undefined) => {
    if (val == null || val === '') return 'Rp 0'
    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return 'Rp 0'
    return 'Rp ' + num.toLocaleString('id-ID')
}

// helper format datetime
const formatDateTime = (val: string | null | undefined) => {
    if (!val) return '-'
    const d = new Date(val)
    if (isNaN(d.getTime())) return String(val)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}

// data FLAT untuk tabel + filter driverName & carName
const rekapanRows = computed<FlatRekapanRow[]>(() => {
    return rekapanRawData.value
        .map<FlatRekapanRow>((item) => {
            const driverName = item.driver?.name || ''
            const carName = item.orderDetail?.carName || ''
            const paymentMethod = item.orderDetail?.paymentMethod || ''

            const distanceRaw = item.orderDetail?.distance ?? '0'
            const distanceNum =
                typeof distanceRaw === 'string'
                    ? parseFloat(distanceRaw || '0')
                    : Number(distanceRaw || 0)

            const totalPendapatan = item.orderDetail?.totalPendapatan ?? 0
            const pendapatanDriver = item.orderDetail?.pendapatanDriver ?? 0
            const managementIncomeRaw = item.orderDetail?.managementIncome ?? 0
            const managementIncome =
                typeof managementIncomeRaw === 'string'
                    ? parseFloat(managementIncomeRaw || '0')
                    : Number(managementIncomeRaw || 0)

            const potonganMidtrans = item.orderDetail?.potonganMidtrans ?? 0

            return {
                transactionNumber: item.transactionNumber,
                createdAt: formatDateTime(item.createdAt),
                driverName,
                carName,
                paymentMethod,
                distance: `${isNaN(distanceNum) ? 0 : distanceNum} km`,
                totalPendapatan,
                pendapatanDriver,
                managementIncome,
                potonganMidtrans
            }
        })
        .filter((row) => {
            const driverName = row.driverName.toLowerCase()
            const carName = row.carName.toLowerCase()
            const filterDriver = rekapanFilter.value.driverName.toLowerCase()
            const filterCar = rekapanFilter.value.carName.toLowerCase()

            const matchDriver = filterDriver ? driverName.includes(filterDriver) : true
            const matchCar = filterCar ? carName.includes(filterCar) : true

            return matchDriver && matchCar
        })
})

// kolom tabel rekapan
const rekapanColumns: Ref<TableField<FlatRekapanRow>[]> = ref([
    { name: 'transactionNumber', title: t('names.transactionNumber') },
    { name: 'createdAt', title: t('names.date') },
    { name: 'driverName', title: t('names.driverName') },
    { name: 'carName', title: t('names.carName') },
    { name: 'paymentMethod', title: t('names.paymentMethod') },
    { name: 'distance', title: t('names.jarak') },
    { name: 'totalPendapatan', title: t('names.totalPendapatan') },
    { name: 'pendapatanDriver', title: t('names.pendapatanDriver') }
])

// --------- STATE PENDAPATAN DRIVER ---------
const driverFilter = ref({
    startDate: defaultStart,
    endDate: formatDate(today),
    driverName: '',
    carName: ''
})

const driverPagination: Ref<PaginationRequest> = ref({
    page: 1,
    limit: 99999,
    totalPages: 0,
    totalRows: 0,
    search: ''
})

const driverRawData = ref<PendapatanDriverRow[]>([])

// tipe row FLAT untuk table driver
type FlatDriverRow = {
    orderId: number
    tanggal: string
    driverName: string
    carName: string
    paymentMethod: string
    tarif: number
    chargePassenger: number
    pendapatanDriver: number
    pendapatanManagement: number   // <-- dari komisi60
    potonganMidtrans: number
    surcharge: number
    komisi40: number
    komisi60: number               // tetap disimpan kalau mau debug
    potCuciAPK: number
}

// driverRows: data flat + filter nama driver & car
const driverRows = computed<FlatDriverRow[]>(() => {
    return driverRawData.value
        .map<FlatDriverRow>((item) => {
            const chargePassenger = item.chargePassenger ?? 0
            const surcharge = item.surcharge ?? 0
            const pendapatanDriverBase = item.pendapatanDriver ?? 0

            return {
                orderId: item.orderId,
                tanggal: formatDateTime(item.tanggal),
                driverName: item.driverName || '',
                carName: item.carName || '',
                paymentMethod: item.paymentMethod || '',
                tarif: item.tarif ?? 0,
                chargePassenger,                        // <--- SIMPAN
                surcharge,                              // <--- SIMPAN
                pendapatanDriver:
                    pendapatanDriverBase + chargePassenger + surcharge, // <--- TOTAL DRIVER
                pendapatanManagement: item.komisi60 ?? 0,
                potonganMidtrans: item.potonganMidtrans ?? 0,
                komisi40: item.komisi40 ?? 0,
                komisi60: item.komisi60 ?? 0,
                potCuciAPK: item.PotCuciAPK ?? 0
            }
        })
        .filter((row) => {
            const driverName = row.driverName.toLowerCase()
            const carName = row.carName.toLowerCase()
            const filterDriver = driverFilter.value.driverName.toLowerCase()
            const filterCar = driverFilter.value.carName.toLowerCase()

            const matchDriver = filterDriver ? driverName.includes(filterDriver) : true
            const matchCar = filterCar ? carName.includes(filterCar) : true

            return matchDriver && matchCar
        })
})

// kolom tabel pendapatan driver
const driverColumns: Ref<TableField<FlatDriverRow>[]> = ref([
    { name: 'orderId', title: 'Order ID' },
    { name: 'tanggal', title: t('names.date') },
    { name: 'driverName', title: t('names.driverName') },
    { name: 'carName', title: t('names.carName') },
    { name: 'paymentMethod', title: t('names.paymentMethod') },
    { name: 'tarif', title: t('names.tarif') },
    { name: 'chargePassenger', title: t('names.chargePassenger') },   // <--- BARU
    { name: 'surcharge', title: t('names.surcharge') },               // <--- BARU
    { name: 'pendapatanDriver', title: t('names.pendapatanDriver') },
    { name: 'pendapatanManagement', title: t('names.pendapatanManagement') },
    { name: 'potonganMidtrans', title: t('names.potonganMidtrans') }
])

// --------- FETCH FUNCTION ---------
const fetchRekapan = async () => {
    try {
        const params: IncomeFilterRequest = {
            page: rekapanPagination.value.page,
            limit: rekapanPagination.value.limit,
            search: '',
            startDate: rekapanFilter.value.startDate,
            endDate: rekapanFilter.value.endDate
        }
        const res = await incomeReportService.getRekapan(params)

        // ini yang penting
        rekapanRawData.value = res.data

        rekapanPagination.value.totalRows = res.total
        rekapanPagination.value.totalPages = res.pageCount
    } catch (error) {
        handleErrorResponse(error)
    }
}

const fetchPendapatanDriver = async () => {
    try {
        const params: IncomeFilterRequest = {
            page: driverPagination.value.page,
            limit: driverPagination.value.limit,
            search: '',
            startDate: driverFilter.value.startDate,
            endDate: driverFilter.value.endDate
        }
        const res = await incomeReportService.getPendapatanDriver(params)
        driverRawData.value = res.data
        driverPagination.value.totalRows = res.total
        driverPagination.value.totalPages = res.pageCount
    } catch (error) {
        handleErrorResponse(error)
    }
}

const onChangeRekapanPage = (page: number) => {
    rekapanPagination.value.page = page
    fetchRekapan()
}

const onChangeDriverPage = (page: number) => {
    driverPagination.value.page = page
    fetchPendapatanDriver()
}

const resetRekapanFilter = () => {
    rekapanFilter.value = {
        startDate: defaultStart,
        endDate: formatDate(today),
        driverName: '',
        carName: ''
    }
    rekapanPagination.value.page = 1
    fetchRekapan()
}

const resetDriverFilter = () => {
    driverFilter.value = {
        startDate: defaultStart,
        endDate: formatDate(today),
        driverName: '',
        carName: ''
    }
    driverPagination.value.page = 1
    fetchPendapatanDriver()
}

// --------- FORMAT & UTIL ---------
const formatCurrency = (val: number | string | undefined) => {
    if (val == null) return 'Rp 0'
    const num = typeof val === 'string' ? parseFloat(val) : val
    return 'Rp ' + num.toLocaleString('id-ID')
}

// const formatDateTime = (val: string) => {
//     // simple formatting: YYYY-MM-DD HH:mm
//     const d = new Date(val)
//     const date = formatDate(d)
//     const hours = String(d.getHours()).padStart(2, '0')
//     const minutes = String(d.getMinutes()).padStart(2, '0')
//     return `${date} ${hours}:${minutes}`
// }

// --------- DATA UNTUK CHART PERFORMA DRIVER ---------
const driverPerformanceData = computed<DriverPerformanceItem[]>(() => {
    const map = new Map<
        string,
        { totalOrders: number; totalPendapatan: number }
    >()

    for (const item of rekapanRows.value) {
        const name = item.driverName || 'Unknown'
        const current = map.get(name) || { totalOrders: 0, totalPendapatan: 0 }

        current.totalOrders += 1
        current.totalPendapatan += item.totalPendapatan || 0

        map.set(name, current)
    }

    return Array.from(map.entries()).map(([driverName, v]) => ({
        driverName,
        totalOrders: v.totalOrders,
        totalPendapatan: v.totalPendapatan
    }))
})

// --------- DOWNLOAD EXCEL (REKAPAN) ---------
import * as XLSX from 'xlsx'

const downloadRekapanExcel = () => {
    const rows = rekapanRows.value.map((item) => ({
        Tanggal: item.createdAt,
        No_Transaksi: item.transactionNumber,
        Driver: item.driverName,
        Mobil: item.carName,
        Metode_Pembayaran: item.paymentMethod,
        Jarak_km: item.distance,
        Total_Pendapatan: item.totalPendapatan,
        Pendapatan_Driver: item.pendapatanDriver,
        Komisi_Manajemen: item.managementIncome,
        Potongan_Midtrans: item.potonganMidtrans
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Pendapatan Rekapan')

    const fileName = `pendapatan_rekapan_${rekapanFilter.value.startDate}_${rekapanFilter.value.endDate}.xlsx`
    XLSX.writeFile(wb, fileName)
}
const downloadPendapatanDriverExcel = () => {
    // sheet 1: detail order (sudah kita buat sebelumnya)
    const detailRows = driverRows.value.map((item) => ({
        Tanggal: item.tanggal,
        Driver: item.driverName,
        Mobil: item.carName,
        Metode_Pembayaran: item.paymentMethod,
        Tarif: item.tarif,
        Pendapatan_Driver: item.pendapatanDriver,
        Pendapatan_Management: item.pendapatanManagement,
        Potongan_Midtrans: item.potonganMidtrans,
        // Pot_Cuci_APK: item.potCuciAPK
    }))

    detailRows.push({
        Tanggal: 'TOTAL',
        Driver: '',
        Mobil: '',
        Metode_Pembayaran: '',
        Tarif: driverTotals.value.totalTarif,
        Pendapatan_Driver: driverTotals.value.totalPendapatanDriver,
        Pendapatan_Management: driverTotals.value.totalPendapatanManagement,
        Potongan_Midtrans: driverTotals.value.totalPotonganMidtrans,
        // Pot_Cuci_APK: ''
    })

    const wsDetail = XLSX.utils.json_to_sheet(detailRows)

    // sheet 2: ringkasan per pengemudi (optional)
    const groupedRows = driverGroupedSummary.value.map((row) => ({
        Driver: row.driverName,
        Mobil: row.carNames.join(', '),
        Jumlah_Order: row.totalOrder,
        Total_Tarif: row.totalTarif,
        Total_Pendapatan_Driver: row.totalPendapatanDriver,
        Total_Pendapatan_Management: row.totalPendapatanManagement,
        Total_Potongan_Midtrans: row.totalPotonganMidtrans
    }))

    const wsGrouped = XLSX.utils.json_to_sheet(groupedRows)

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Pendapatan Driver')
    XLSX.utils.book_append_sheet(wb, wsGrouped, 'Ringkasan Pengemudi')

    const fileName = `pendapatan_driver_${driverFilter.value.startDate}_${driverFilter.value.endDate}.xlsx`
    XLSX.writeFile(wb, fileName)
}

onMounted(() => {
    fetchRekapan()
    fetchPendapatanDriver()
})
</script>
