<template>
  <PageContainer :title="$t('title.financialReports')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="filters.month" class="filter" @change="load">
            <option v-for="month in months" :key="month" :value="month">{{ monthLabel(month) }}</option>
          </select>
          <select v-model="filters.unit" class="filter" @change="load">
            <option value="PUSKOPAU">Avanza Puskopau</option>
            <option value="INVESTOR">Avanza Investor</option>
            <option value="">Gabungan</option>
          </select>
          <div class="flex rounded-lg border border-buttonGray overflow-hidden text-sm">
            <button
              v-for="tab in TABS"
              :key="tab.key"
              class="px-3 py-2"
              :class="activeTab === tab.key ? 'bg-primaryDarkBlue text-white' : 'bg-white'"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 p-3">
          <label class="text-sm">
            <span class="block text-accentGray">Nama Bendahara</span>
            <input v-model="signers.bendahara" class="filter" placeholder="untuk tanda tangan" />
          </label>
          <label class="text-sm">
            <span class="block text-accentGray">Nama Kaunit</span>
            <input v-model="signers.kaunit" class="filter" placeholder="untuk tanda tangan" />
          </label>
          <button class="btn-primary" :disabled="!report || downloading" @click="download">
            {{ downloading ? 'Menyiapkan Excel…' : 'Unduh Excel' }}
          </button>
          <span class="text-xs text-accentGray">Satu file: Neraca Saldo, Laba Rugi, Neraca, Arus Kas, rekening bank, Jurnal Umum, Buku Besar.</span>
        </div>

        <template v-if="report">
          <p class="text-sm font-semibold">
            {{ unitTitle(report.unit) }} · {{ monthLabel(report.month) }}
            <span class="font-normal text-accentGray">({{ formatWorkDate(report.from) }} – {{ formatWorkDate(report.to) }})</span>
          </p>

          <p v-for="bank in bankDiffs" :key="bank.code" class="warning">
            Saldo {{ bank.code === '1-111' ? 'Rek 67' : 'Rek 87' }} di buku besar {{ formatRupiah(bank.ledger) }} berbeda
            {{ formatRupiah(bank.difference) }} dari Dashboard Kas ({{ formatRupiah(bank.cash) }}). Periksa transaksi yang tercatat
            dobel atau tanggalnya salah.
          </p>

          <!-- Laba Rugi -->
          <table v-if="activeTab === 'income'" class="w-full text-sm report">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Keterangan</th>
                <th class="num">{{ monthLabel(report.month) }}</th>
                <th class="num">s/d {{ monthLabel(report.month) }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="section in report.income.sections" :key="section.key">
                <tr class="group"><td colspan="4">{{ section.title }}</td></tr>
                <tr v-for="row in section.rows" :key="row.code">
                  <td>
                    <router-link class="link" :to="ledgerLink(row.code)">{{ row.code }}</router-link>
                  </td>
                  <td class="pl-6">{{ row.name }}</td>
                  <td class="num">{{ formatRupiah(row.month) }}</td>
                  <td class="num">{{ formatRupiah(row.ytd) }}</td>
                </tr>
                <tr class="subtotal">
                  <td></td>
                  <td>Jumlah {{ section.title }}</td>
                  <td class="num">{{ formatRupiah(section.month) }}</td>
                  <td class="num">{{ formatRupiah(section.ytd) }}</td>
                </tr>
              </template>
            </tbody>
            <tfoot>
              <tr>
                <td></td>
                <td>LABA (RUGI) BERSIH</td>
                <td class="num">{{ formatRupiah(report.income.profit.month) }}</td>
                <td class="num">{{ formatRupiah(report.income.profit.ytd) }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Neraca -->
          <div v-if="activeTab === 'balance'" class="space-y-2">
            <table class="w-full text-sm report">
              <tbody>
                <template v-for="part in balanceParts" :key="part.title">
                  <tr class="group"><td colspan="3">{{ part.title }}</td></tr>
                  <template v-for="group in part.groups" :key="group.code">
                    <tr class="subtotal"><td></td><td>{{ group.name }}</td><td></td></tr>
                    <tr v-for="row in group.rows" :key="row.code ?? row.name">
                      <td>
                        <router-link v-if="row.code" class="link" :to="ledgerLink(row.code)">{{ row.code }}</router-link>
                      </td>
                      <td class="pl-6">{{ row.name }}</td>
                      <td class="num">{{ formatRupiah(row.amount) }}</td>
                    </tr>
                  </template>
                  <tr class="subtotal">
                    <td></td>
                    <td>{{ part.totalTitle }}</td>
                    <td class="num">{{ formatRupiah(part.total) }}</td>
                  </tr>
                </template>
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td>TOTAL KEWAJIBAN DAN EKUITAS</td>
                  <td class="num">{{ formatRupiah(report.balance.totalLiabilitiesEquity) }}</td>
                </tr>
              </tfoot>
            </table>
            <p :class="report.balance.balanced ? 'text-green-700' : 'text-red-600'" class="font-semibold text-sm">
              {{ report.balance.balanced ? 'Neraca balance ✓' : 'Neraca tidak balance' }}
            </p>
          </div>

          <!-- Arus Kas -->
          <table v-if="activeTab === 'cash'" class="w-full text-sm report">
            <tbody>
              <tr class="group"><td colspan="3">Saldo awal kas dan bank</td></tr>
              <tr v-for="account in report.cashFlow.accounts" :key="'o' + account.code">
                <td>{{ account.code }}</td>
                <td class="pl-6">{{ account.name }}</td>
                <td class="num">{{ formatRupiah(account.opening) }}</td>
              </tr>
              <tr class="subtotal"><td></td><td>Jumlah saldo awal</td><td class="num">{{ formatRupiah(report.cashFlow.opening) }}</td></tr>
              <tr class="group"><td colspan="3">Penerimaan</td></tr>
              <tr v-for="item in report.cashFlow.inflows" :key="'i' + item.category">
                <td>{{ item.category.includes('-') ? item.category : '' }}</td>
                <td class="pl-6">{{ item.name }}</td>
                <td class="num">{{ formatRupiah(item.amount) }}</td>
              </tr>
              <tr class="subtotal"><td></td><td>Jumlah penerimaan</td><td class="num">{{ formatRupiah(report.cashFlow.totalIn) }}</td></tr>
              <tr class="group"><td colspan="3">Pengeluaran</td></tr>
              <tr v-for="item in report.cashFlow.outflows" :key="'x' + item.category">
                <td>{{ item.category.includes('-') ? item.category : '' }}</td>
                <td class="pl-6">{{ item.name }}</td>
                <td class="num">{{ formatRupiah(item.amount) }}</td>
              </tr>
              <tr class="subtotal"><td></td><td>Jumlah pengeluaran</td><td class="num">{{ formatRupiah(report.cashFlow.totalOut) }}</td></tr>
              <tr class="group"><td colspan="3">Saldo akhir kas dan bank</td></tr>
              <tr v-for="account in report.cashFlow.accounts" :key="'c' + account.code">
                <td>{{ account.code }}</td>
                <td class="pl-6">{{ account.name }}</td>
                <td class="num">{{ formatRupiah(account.closing) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr><td></td><td>TOTAL SALDO KAS DAN BANK</td><td class="num">{{ formatRupiah(report.cashFlow.closing) }}</td></tr>
            </tfoot>
          </table>

          <!-- Neraca Saldo -->
          <table v-if="activeTab === 'trial'" class="w-full text-sm report">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Akun</th>
                <th class="num">Saldo Awal</th>
                <th class="num">Debit</th>
                <th class="num">Kredit</th>
                <th class="num">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in report.trialBalance.rows" :key="row.code">
                <td>
                  <router-link class="link" :to="ledgerLink(row.code)">{{ row.code }}</router-link>
                </td>
                <td>{{ row.name }}</td>
                <td class="num">{{ formatRupiah(shown(row.opening, row.type)) }}</td>
                <td class="num">{{ formatRupiah(row.debit) }}</td>
                <td class="num">{{ formatRupiah(row.credit) }}</td>
                <td class="num font-semibold">{{ formatRupiah(shown(row.closing, row.type)) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3">Jumlah mutasi</td>
                <td class="num">{{ formatRupiah(report.trialBalance.totals.debit) }}</td>
                <td class="num">{{ formatRupiah(report.trialBalance.totals.credit) }}</td>
                <td :class="report.trialBalance.totals.balanced ? 'text-green-700' : 'text-red-600'">
                  {{ report.trialBalance.totals.balanced ? 'Balance ✓' : 'Tidak balance' }}
                </td>
              </tr>
            </tfoot>
          </table>
        </template>
        <p class="text-xs text-accentGray">
          September–Oktober 2026 diambil dari Excel GL bendahara (jurnal riwayat). Mulai 1 November dihitung otomatis dari order,
          kas, penggajian dan hutang driver.
        </p>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah, formatWorkDate } from '@/utils/payroll-format'
import { todayWib } from '@/utils/cash-labels'
import type { BusinessUnit } from '@/utils/accounting'
import { SIGNERS_KEY, bankSheetsFor, monthLabel, monthOptions, unitTitle, type Signers } from '@/utils/accounting-report'
import accountingService, { type FinancialReport, type Ledger } from '@/services/accounting/accounting.api'

const TABS = [
  { key: 'income', label: 'Laba Rugi' },
  { key: 'balance', label: 'Neraca' },
  { key: 'cash', label: 'Arus Kas' },
  { key: 'trial', label: 'Neraca Saldo' }
] as const

const today = todayWib()
const months = monthOptions(today)
const filters = ref({ month: months[0], unit: 'PUSKOPAU' as BusinessUnit | '' })
const activeTab = ref<(typeof TABS)[number]['key']>('income')
const report = ref<FinancialReport | null>(null)
const downloading = ref(false)

const readSigners = (): Signers => {
  try {
    return { bendahara: '', kaunit: '', ...JSON.parse(localStorage.getItem(SIGNERS_KEY) ?? '{}') }
  } catch {
    return { bendahara: '', kaunit: '' }
  }
}
const signers = ref<Signers>(readSigners())
watch(signers, (value) => localStorage.setItem(SIGNERS_KEY, JSON.stringify(value)), { deep: true })

const NORMAL_DEBIT = ['ASET', 'BEBAN']
const shown = (signed: number, type: string): number => (NORMAL_DEBIT.includes(type) ? signed : -signed)

const bankDiffs = computed(() => (report.value?.bankCheck ?? []).filter((bank) => Math.abs(bank.difference) >= 0.01))

const balanceParts = computed(() => {
  if (!report.value) return []
  const { balance } = report.value
  return [
    { title: 'ASET', groups: balance.assets.groups, total: balance.assets.total, totalTitle: 'TOTAL ASET' },
    { title: 'KEWAJIBAN', groups: balance.liabilities.groups, total: balance.liabilities.total, totalTitle: 'TOTAL KEWAJIBAN' },
    {
      title: 'EKUITAS',
      groups: [{ code: '3', name: 'Ekuitas', rows: balance.equity.rows, total: balance.equity.total }],
      total: balance.equity.total,
      totalTitle: 'TOTAL EKUITAS'
    }
  ]
})

const ledgerLink = (code: string) => ({
  path: '/accounting/ledger',
  query: { account: code, from: report.value?.from, to: report.value?.to, unit: filters.value.unit }
})

const load = async (): Promise<void> => {
  try {
    report.value = (await accountingService.getReports(filters.value)).data
  } catch (error) {
    report.value = null
    handleErrorResponse(error)
  }
}

const download = async (): Promise<void> => {
  if (!report.value) return
  downloading.value = true
  try {
    const current = report.value
    const params = { from: current.from, to: current.to, unit: filters.value.unit }
    const codes = new Set(current.trialBalance.rows.filter((row) => row.debit || row.credit).map((row) => row.code))
    for (const bank of bankSheetsFor(filters.value.unit)) {
      if (current.trialBalance.rows.some((row) => row.code === bank.code)) codes.add(bank.code)
    }
    const ledgers: Ledger[] = []
    for (const code of [...codes].sort()) {
      ledgers.push((await accountingService.getLedger({ ...params, account: code })).data)
    }
    const journals = (await accountingService.getJournals({ ...params, withLines: '1' })).data
      .filter((journal) => journal.status === 'ACTIVE')
      .sort((a, b) => a.journalDate.localeCompare(b.journalDate) || a.id - b.id)
    const { buildReportWorkbook, downloadWorkbook, reportFileName } = await import('@/utils/accounting-excel')
    const wb = buildReportWorkbook({ report: current, ledgers, journals, signers: signers.value, printedAt: todayWib() })
    await downloadWorkbook(wb, reportFileName(filters.value.unit, current.month))
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    downloading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.btn-primary {
  @apply rounded-lg bg-primaryDarkBlue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50
}

.report td,
.report th {
  @apply px-3 py-1.5 text-left border-b border-gray-100
}

.report thead {
  @apply bg-gray-100
}

.report .num {
  @apply text-right whitespace-nowrap
}

.group td {
  @apply font-semibold bg-gray-50
}

.subtotal td {
  @apply font-semibold
}

.report tfoot td {
  @apply font-bold border-t-2 border-gray-300
}

.link {
  @apply text-primaryDarkBlue underline
}

.warning {
  @apply text-sm rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-orange-800
}
</style>
