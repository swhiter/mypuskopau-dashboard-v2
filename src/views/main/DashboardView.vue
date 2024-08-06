<template>
  <PageContainer :title="$t('title.dashboard')">
    <div class="flex w-full max-w-full space-x-6">
      <div class="flex w-full md:w-3/5">
        <YearlyIncomeCard :income="yearlyIncome" />
      </div>
      <div class="flex w-full md:w-2/5">
        <DailyOrderSummaryCard />
      </div>
    </div>
    <div class="flex w-full max-w-full space-x-6">
      <div class="flex w-full md:w-3/5">
        <OrderSummaryCard :summary="orderCountByStatus" />
      </div>
      <div class="flex w-full md:w-2/5">
        <OrderTimeSummaryCard :summary="orderTimeSummary" />
      </div>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/components/atoms/PageContainer.vue';
import DailyOrderSummaryCard from '@/components/molecules/cards/DailyOrderSummaryCard.vue';
import OrderSummaryCard from '@/components/molecules/cards/OrderSummaryCard.vue';
import OrderTimeSummaryCard from '@/components/molecules/cards/OrderTimeSummaryCard.vue';
import YearlyIncomeCard from '@/components/molecules/cards/YearlyIncomeCard.vue';
import dashboardService from '@/services/dashboard/dashboard.api';
import type { OrderCountByStatus, OrderPerPeriod, YearlyIncome } from '@/types/Dashboard';
import { handleErrorResponse } from '@/utils/common';
import { onMounted, ref, type Ref } from 'vue';

const year: Ref<string> = ref('2024')
const startDate: Ref<string> = ref('2024-08-01')
const endDate: Ref<string> = ref('2024-08-31')
const loading: Ref<boolean> = ref(false)

const yearlyIncome: Ref<YearlyIncome> = ref({
  Januari: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Februari: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Maret: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  April: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Mei: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Juni: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Juli: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Agustus: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  September: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Oktober: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  November: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  },
  Desember: {
    earlyMorningIncome: 0,
    dayIncome: 0,
    eveningIncome: 0
  }
})

const orderCountByStatus: Ref<OrderCountByStatus> = ref({
  totalOrder: 0,
  pendingOrders: 0,
  successfulOrders: 0,
  failedOrders: 0
})

const orderTimeSummary: Ref<OrderPerPeriod> = ref({
  totalOrder: 0,
  earlyMorningOrder: 0,
  dayOrders: 0,
  eveningOrders: 0
})

const getData = async () => {
  const req = {
    year: year.value,
    startDate: startDate.value,
    endDate: endDate.value
  }
  loading.value = true
  try {
    const response = await dashboardService.getDashboardData(req)
    yearlyIncome.value = response.data.income
    orderCountByStatus.value = response.data.countOrderByStatus
    orderTimeSummary.value = response.data.calculateOrderPerPeriod
  } catch (error) {
    handleErrorResponse(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getData()
})
</script>