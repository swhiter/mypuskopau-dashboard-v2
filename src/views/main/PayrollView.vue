<template>
  <PageContainer :title="$t('title.payroll')">
    <!-- RINGKASAN PERIODE BERJALAN -->
    <PageCard>
      <PayrollSummaryCard ref="summaryCard" @changed="refreshAll" />
    </PageCard>

    <!-- MENUNGGU PENGGAJIAN -->
    <PageCard>
      <PayrollPendingData ref="pendingData" @changed="refreshAll" />
    </PageCard>

    <!-- RIWAYAT PENGGAJIAN -->
    <PageCard>
      <PayrollHistoryData ref="historyData" @changed="refreshAll" />
    </PageCard>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageCard from '@/components/atoms/PageCard.vue'
import PageContainer from '@/components/atoms/PageContainer.vue'
import PayrollSummaryCard from '@/components/organisms/PayrollSummaryCard.vue'
import PayrollPendingData from '@/components/organisms/PayrollPendingData.vue'
import PayrollHistoryData from '@/components/organisms/PayrollHistoryData.vue'

const summaryCard = ref<InstanceType<typeof PayrollSummaryCard> | null>(null)
const pendingData = ref<InstanceType<typeof PayrollPendingData> | null>(null)
const historyData = ref<InstanceType<typeof PayrollHistoryData> | null>(null)

// Setelah proses / edit / tutup buku, semua bagian dimuat ulang
const refreshAll = (): void => {
  summaryCard.value?.refresh()
  pendingData.value?.refresh()
  historyData.value?.refresh()
}
</script>
