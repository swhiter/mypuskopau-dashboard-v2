<template>
  <PageContainer :title="$t('title.trialBalance')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <input v-model="filters.from" type="date" class="filter" :min="GL_START" @change="load" />
          <span>-</span>
          <input v-model="filters.to" type="date" class="filter" :min="GL_START" @change="load" />
          <select v-model="filters.unit" class="filter" @change="load">
            <option value="">{{ t('label.allUnits') }}</option>
            <option v-for="unit in UNITS" :key="unit" :value="unit">{{ UNIT_LABELS[unit] }}</option>
          </select>
          <label class="flex items-center gap-2 text-sm">
            <input v-model="hideZero" type="checkbox" /> {{ t('label.hideZero') }}
          </label>
        </div>

        <p v-if="unclassified.count" class="warning">
          {{ t('message.unclassifiedWarning', { count: unclassified.count, amount: formatRupiah(unclassified.amount) }) }}
          <router-link to="/cash" class="underline font-semibold">{{ t('label.openCash') }}</router-link>
        </p>

        <div class="overflow-x-auto">
          <table class="w-full text-sm report">
            <thead>
              <tr>
                <th>{{ t('names.accountCode') }}</th>
                <th>{{ t('names.accountName') }}</th>
                <th class="num">{{ t('names.openingBalance') }}</th>
                <th class="num">{{ t('label.debit') }}</th>
                <th class="num">{{ t('label.credit') }}</th>
                <th class="num">{{ t('names.closingBalance') }}</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="type in COA_TYPES" :key="type">
                <tr v-if="rowsOf(type).length" class="group">
                  <td colspan="6">{{ COA_TYPE_LABELS[type] }}</td>
                </tr>
                <tr v-for="row in rowsOf(type)" :key="row.code">
                  <td>
                    <router-link class="link" :to="ledgerLink(row.code)">{{ row.code }}</router-link>
                  </td>
                  <td>{{ row.name }}</td>
                  <td class="num">{{ formatRupiah(displayBalance(row.opening, row.normal)) }}</td>
                  <td class="num">{{ formatRupiah(row.debit) }}</td>
                  <td class="num">{{ formatRupiah(row.credit) }}</td>
                  <td class="num font-semibold">{{ formatRupiah(displayBalance(row.closing, row.normal)) }}</td>
                </tr>
              </template>
            </tbody>
            <tfoot v-if="report">
              <tr>
                <td colspan="3">{{ t('label.total') }}</td>
                <td class="num">{{ formatRupiah(report.totals.debit) }}</td>
                <td class="num">{{ formatRupiah(report.totals.credit) }}</td>
                <td :class="report.totals.balanced ? 'text-green-700' : 'text-red-600'">
                  {{ report.totals.balanced ? t('label.balanced') : t('label.notBalanced') }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p class="text-xs text-accentGray">{{ t('message.trialBalanceInfo') }}</p>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onMounted, ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import { handleErrorResponse } from '@/utils/common'
import { formatRupiah } from '@/utils/payroll-format'
import { todayWib } from '@/utils/cash-labels'
import { REPORT_START } from '@/utils/accounting-report'
import { COA_TYPES, COA_TYPE_LABELS, UNITS, UNIT_LABELS, displayBalance, type CoaType } from '@/utils/accounting'
import accountingService, { type TrialBalance } from '@/services/accounting/accounting.api'

const { t } = useI18n()
const GL_START = REPORT_START

const today = todayWib()
const monthStart = `${today.slice(0, 7)}-01`
const filters = ref({ from: monthStart < GL_START ? GL_START : monthStart, to: today, unit: '' as '' | 'INVESTOR' | 'PUSKOPAU' })
const hideZero = ref(true)
const report = ref<TrialBalance | null>(null)
const unclassified = ref({ count: 0, amount: 0 })

const rowsOf = (type: CoaType) =>
  (report.value?.rows ?? []).filter(
    (row) => row.type === type && (!hideZero.value || row.opening || row.debit || row.credit)
  )

const ledgerLink = (code: string) => ({ path: '/accounting/ledger', query: { account: code, ...filters.value } })

const load = async (): Promise<void> => {
  try {
    const [balance, pending] = await Promise.all([
      accountingService.getTrialBalance(filters.value),
      accountingService.getUnclassified()
    ])
    report.value = balance.data
    unclassified.value = {
      count: pending.data.length,
      amount: pending.data.reduce((total, row) => total + row.amount, 0)
    }
  } catch (error) {
    handleErrorResponse(error)
  }
}

onMounted(load)
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
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

.group td {
  @apply font-semibold bg-gray-50
}

.report tfoot td {
  @apply font-semibold border-t-2 border-gray-300
}

.link {
  @apply text-primaryDarkBlue underline
}

.warning {
  @apply text-sm rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-orange-800
}
</style>
