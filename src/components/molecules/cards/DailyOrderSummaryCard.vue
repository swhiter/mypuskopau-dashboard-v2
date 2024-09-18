<template>
  <DashboardCard :title="t('title.order')">
    <div class="flex w-full h-80 2xl:h-96 items-center justify-center">
      <Line :options="chartOptions" :data="chartData" />
    </div>
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/atoms/DashboardCard.vue';
import type { DailyOrder } from '@/types/Dashboard';
import { ref, toRefs, watch, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Line } from 'vue-chartjs';
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip, type ChartData, type ChartDataset, type ChartOptions } from 'chart.js';
import { DateTime } from 'luxon';

const { t } = useI18n()

interface Props {
  summary: DailyOrder[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const { summary } = toRefs(props)

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true
      }
    }
  }
}

const chartData: Ref<ChartData<'line'>> = ref({
  labels: Array.from({ length: 7 }, (_, i) => i + 1),
  datasets: []
})

watch(summary, (newValue) => {
  chartData.value = convertToChartDatasets(newValue)
})

const convertToChartDatasets = (value: DailyOrder[]): ChartData<'line'> => {
  const label = Array.from({ length: 7 }, (_, i) => i + 1)
  const currentWeekOrders: DailyOrder[] = getCurrentWeekOrders(value)
  const priorWeekOrders: DailyOrder[] = getPriorWeekOrders(value)
  const currentWeekValue: number[] = []
  const priorWeekValue: number[] = []

  for (const item of currentWeekOrders) {
    currentWeekValue.push(item.totalOrders)
  }
  for (const item of priorWeekOrders) {
    priorWeekValue.push(item.totalOrders)
  }

  const dataset: ChartDataset<'line'>[] = [
    {
      label: t('label.currentWeek'),
      data: currentWeekValue,
      // fill: false,
      backgroundColor: '#5A6ACF',
      borderColor: '#5A6ACF'
    },
    {
      label: t('label.lastWeek'),
      data: priorWeekValue,
      // fill: false,
      backgroundColor: '#C7CEFF',
      borderColor: '#C7CEFF'
    }
  ]

  return {
    labels: label,
    datasets: dataset
  }
}

const getCurrentWeekOrders = (data: DailyOrder[]): DailyOrder[] => {
  const now = DateTime.now()
  const weekAgo = now.minus({ days: 7 })

  return data.filter((order) => {
    const orderDate = DateTime.fromISO(order.orderDate)
    return orderDate >= weekAgo && orderDate <= now
  })
}

const getPriorWeekOrders = (data: DailyOrder[]): DailyOrder[] => {
  const now = DateTime.now()
  const endWeek = now.minus({ days: 8 })
  const startWeek = endWeek.minus({ days: 7 })

  return data.filter((order) => {
    const orderDate = DateTime.fromISO(order.orderDate)
    return orderDate >= startWeek && orderDate <= endWeek
  })
}
</script>