<template>
  <DashboardCard :title="t('title.orderTime')" :loading="loading">
    <Doughnut id="order-time-chart" :options="chartOptions" :data="chartData" />
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/atoms/DashboardCard.vue';
import type { OrderPerPeriod } from '@/types/Dashboard';
import { ref, toRefs, watch, type Ref } from 'vue';
import { Chart as ChartJS, Tooltip, Legend, ArcElement, type ChartDataset, type ChartData, type ChartOptions } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

interface Props {
  summary: OrderPerPeriod
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
const { summary } = toRefs(props)

ChartJS.register(ArcElement, Tooltip, Legend)

const chartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  cutout: 60,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const chartData: Ref<ChartData<'doughnut'>> = ref({
  labels: Object.keys(props.summary),
  datasets: []
})

watch(summary, (newValue) => {
  chartData.value = convertToChartDatasets(newValue)
}, { deep: true })

const convertToChartDatasets = (value: OrderPerPeriod): ChartData<'doughnut'> => {
  const labels: string[] = Object.keys(value)
  const orderIndex: number = labels.findIndex((name) => name == 'totalOrder')
  if (orderIndex > -1) {
    labels.splice(orderIndex, 1)
  }

  const datasets: ChartDataset<'doughnut'>[] = [
    {
      label: 'Dataset 1',
      data: [],
      backgroundColor: ['#C7CEFF', '#94959A', '#5A6ACF']
    }
  ]

  for (const [index, item] of labels.entries()) {
    datasets[0].data.push(value[item as keyof OrderPerPeriod])
    if (labels[index] == 'earlyMorningOrder') {
      labels[index] = '00.00 - 07.59'
    } else if (labels[index] == 'dayOrders') {
      labels[index] = '08.00 - 16.59'
    } else if (labels[index] == 'eveningOrders') {
      labels[index] = '17.00 - 23.59'
    }
  }

  const chart: ChartData<'doughnut'> = {
    labels: labels,
    datasets: datasets
  }

  return chart
}
</script>