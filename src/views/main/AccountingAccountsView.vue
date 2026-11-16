<template>
  <PageContainer :title="$t('title.chartOfAccounts')">
    <PageCard>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-3">
          <input v-model="search" type="search" class="filter" :placeholder="t('label.searchAccount')" />
          <label class="flex items-center gap-2 text-sm">
            <input v-model="showInactive" type="checkbox" /> {{ t('label.showInactive') }}
          </label>
          <div class="flex-1" />
          <MainButton v-if="canWrite" :label="t('label.addAccount')" @click="openForm()" />
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm coa-table">
            <thead>
              <tr>
                <th>{{ t('names.accountCode') }}</th>
                <th>{{ t('names.accountName') }}</th>
                <th>{{ t('names.accountType') }}</th>
                <th>{{ t('names.normalBalance') }}</th>
                <th>{{ t('names.cashAccount') }}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in visible" :key="account.code"
                :class="{ header: account.isHeader, inactive: !account.isActive }">
                <td>{{ account.code }}</td>
                <td :style="{ paddingLeft: `${0.75 + accountDepth(account, accounts) * 1.25}rem` }">
                  {{ account.name }}
                  <span v-if="account.isSystem" class="badge">{{ t('label.systemAccount') }}</span>
                  <span v-if="!account.isActive" class="badge">{{ t('label.inactive') }}</span>
                </td>
                <td>{{ COA_TYPE_LABELS[account.type] }}</td>
                <td>{{ account.normal === 'D' ? t('label.debit') : t('label.credit') }}</td>
                <td>{{ account.cashAccount ? accountLabel(account.cashAccount) : '' }}</td>
                <td>
                  <button v-if="canWrite && !account.isHeader && !account.isSystem" type="button" class="action-link"
                    @click="openForm(account)">{{ t('label.update') }}</button>
                  <router-link v-if="!account.isHeader" class="action-link ml-3"
                    :to="{ path: '/accounting/ledger', query: { account: account.code } }">{{ t('title.generalLedger') }}</router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed, onMounted, ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import MainButton from '@/components/atoms/MainButton.vue'
import ModalCoaForm from '@/components/molecules/modals/ModalCoaForm.vue'
import { useModalStore } from '@/stores/modal'
import { getCurrentUser, handleErrorResponse } from '@/utils/common'
import { accountLabel } from '@/utils/cash-labels'
import { COA_TYPE_LABELS, accountDepth, type CoaAccount } from '@/utils/accounting'
import accountingService from '@/services/accounting/accounting.api'

const { t } = useI18n()
const modal = useModalStore()

// Bendahara mengelola akun; admin hanya melihat
const canWrite = getCurrentUser().role === 'bendahara'
const accounts = ref<CoaAccount[]>([])
const search = ref('')
const showInactive = ref(false)

const visible = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return accounts.value.filter(
    (account) =>
      (showInactive.value || account.isActive) &&
      (!keyword || `${account.code} ${account.name}`.toLowerCase().includes(keyword))
  )
})

const load = async (): Promise<void> => {
  try {
    accounts.value = (await accountingService.getAccounts()).data
  } catch (error) {
    handleErrorResponse(error)
  }
}

const openForm = (account?: CoaAccount): void => {
  modal.openModal({
    component: ModalCoaForm,
    props: {
      title: account ? t('title.editAccount') : t('title.addAccount'),
      account,
      headers: accounts.value.filter((item) => item.isHeader)
    }
  })
  modal.onOk(load)
}

onMounted(load)
</script>

<style scoped>
.filter {
  @apply border border-buttonGray rounded-lg px-3 py-2 text-sm bg-white
}

.coa-table th,
.coa-table td {
  @apply px-3 py-1.5 text-left border-b border-gray-100
}

.coa-table thead {
  @apply bg-gray-100
}

.header td {
  @apply font-semibold bg-gray-50
}

.inactive td {
  @apply text-accentGray
}

.badge {
  @apply ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-accentGray font-normal
}

.action-link {
  @apply text-primaryDarkBlue font-semibold underline
}
</style>
