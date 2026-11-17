<template>
  <PageContainer :title="$t('title.generalLedger')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <select v-model="filters.account" class="filter account" @change="load">
            <option value="" disabled>{{ t('label.chooseAccount') }}</option>
            <option v-for="account in details" :key="account.code" :value="account.code">
              {{ account.code }} {{ account.name }}
            </option>
          </select>
          <input v-model="filters.from" type="date" class="filter" :min="GL_START" @change="load" />
          <span>-</span>
          <input v-model="filters.to" type="date" class="filter" :min="GL_START" @change="load" />
          <select v-model="filters.unit" class="filter" @change="load">
            <option value="">{{ t('label.allUnits') }}</option>
            <option v-for="unit in UNITS" :key="unit" :value="unit">{{ UNIT_LABELS[unit] }}</option>
          </select>
        </div>

        <div v-if="ledger" class="overflow-x-auto">
          <table class="w-full text-sm report">
            <thead>
              <tr>
                <th>{{ t('names.date') }}</th>
                <th>{{ t('names.source') }}</th>
                <th>{{ t('names.description') }}</th>
                <th class="num">{{ t('label.debit') }}</th>
                <th class="num">{{ t('label.credit') }}</th>
                <th class="num">{{ t('names.balance') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="group">
                <td colspan="5">{{ t('names.openingBalance') }}</td>
                <td class="num">{{ formatRupiah(displayBalance(ledger.opening, ledger.account.normal)) }}</td>
              </tr>
              <tr v-for="(row, index) in ledger.rows" :key="index">
                <td class="whitespace-nowrap">{{ formatDay(row.entry_date) }}</td>
                <td>{{ sourceLabel(row) }}</td>
                <td>{{ row.memo ?? t('label.ledgerSummary', { count: row.lines }) }}</td>
                <td class="num">{{ row.debit ? formatRupiah(row.debit) : '' }}</td>
                <td class="num">{{ row.credit ? formatRupiah(row.credit) : '' }}</td>
                <td class="num">{{ formatRupiah(displayBalance(row.balance, ledger.account.normal)) }}</td>
              </tr>
              <tr v-if="!ledger.rows.length">
                <td colspan="6" class="text-center text-accentGray">{{ t('message.ledgerEmpty') }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">{{ t('names.closingBalance') }}</td>
                <td class="num">{{ formatRupiah(displayBalance(ledger.closing, ledger.account.normal)) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p v-else class="text-sm text-accentGray">{{ t('message.ledgerChooseAccount') }}</p>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import { todayWib } from '@/utils/cash-labels'
import { REPORT_START } from '@/utils/accounting-report'
import { UNITS, UNIT_LABELS, displayBalance, type BusinessUnit, type CoaAccount } from '@/utils/accounting'
import accountingService, { type Ledger, type LedgerRow } from '@/services/accounting/accounting.api'

const { t } = useI18n()
const route = useRoute()
const GL_START = REPORT_START

const today = todayWib()
const monthStart = `${today.slice(0, 7)}-01`
const query = route.query
const filters = ref({
  account: String(query.account ?? ''),
  from: String(query.from ?? (monthStart < GL_START ? GL_START : monthStart)),
  to: String(query.to ?? today),
  unit: String(query.unit ?? '') as '' | BusinessUnit
})
const accounts = ref<CoaAccount[]>([])
const details = computed(() => accounts.value.filter((account) => !account.isHeader))
const ledger = ref<Ledger | null>(null)

const formatDay = (day: string): string => day.split('-').reverse().join('/')

const sourceLabel = (row: LedgerRow): string => {
  if (row.source === 'CASH') return t('label.ledgerSourceCash', { id: row.source_id })
  if (row.source === 'DEBT') return t('label.ledgerSourceDebt', { id: row.source_id })
  if (row.source === 'JOURNAL') return t('label.ledgerSourceJournal', { id: row.source_id })
  return row.source === 'ORDER' ? t('label.ledgerSourceOrder') : t('label.ledgerSourcePayroll')
}

const load = async (): Promise<void> => {
  if (!filters.value.account) return
  try {
    ledger.value = (await accountingService.getLedger(filters.value)).data
  } catch (error) {
    handleErrorResponse(error)
  }
}

onMounted(async () => {
  try {
    accounts.value = (await accountingService.getAccounts()).data
  } catch (error) {
    handleErrorResponse(error)
  }
  await load()
})
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.account {
  @apply min-w-[18rem]
}

.report th,
.report td {
  @apply px-3 py-1.5 text-left border-b border-gray-100
}

.report thead {
  @apply bg-gray-100
}

.report .num {
  @apply text-right whitespace-nowrap
}

.group td,
.report tfoot td {
  @apply font-semibold bg-gray-50
}
</style>
