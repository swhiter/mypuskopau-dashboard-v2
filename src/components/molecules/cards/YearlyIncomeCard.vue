<template>
  <DashboardCard :title="t('title.earnings')" :loading="loading">
    <Bar id="yearly-income-chart" :options="chartOptions" :data="chartData" />
  </DashboardCard>
</template>

<script setup lang="ts">
import DashboardCard from '@/components/atoms/DashboardCard.vue';
import type { YearlyIncome } from '@/types/Dashboard';
import { useI18n } from 'vue-i18n';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type ChartDataset, type ChartData, type ChartOptions } from 'chart.js';
import { ref, toRefs, watch, type Ref } from 'vue';

const { t } = useI18n()

interface Props {
  income: YearlyIncome
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})
const { income } = toRefs(props)

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartOptions: ChartOptions<'bar'> = {
  responsive: true
}

const chartData: Ref<ChartData<'bar'>> = ref({
  labels: Object.keys(props.income),
  datasets: []
})

watch(income, (newValue) => {
  chartData.value = convertToChartDatasets(newValue)
}, { deep: true })

const convertToChartDatasets = (value: YearlyIncome): ChartData<'bar'> => {
  const labels: string[] = Object.keys(value)
  const earlyMorningIncome: number[] = []
  const dayIncome: number[] = []
  const eveningIncome: number[] = []

  for (const month of labels) {
    const data = value[month as keyof YearlyIncome]
    earlyMorningIncome.push(data.earlyMorningIncome)
    dayIncome.push(data.dayIncome)
    eveningIncome.push(data.eveningIncome)
  }

  const dataset: ChartDataset<'bar'>[] = [
    {
      label: 'Pagi',
      data: earlyMorningIncome,
      backgroundColor: '#C7CEFF',
      borderRadius: 10
    },
    {
      label: 'Siang',
      data: dayIncome,
      backgroundColor: '#94959A',
      borderRadius: 10
    },
    {
      label: 'Sore',
      data: eveningIncome,
      backgroundColor: '#5A6ACF',
      borderRadius: 10
    }
  ]

  const chart: ChartData<'bar'> = {
    labels: labels,
    datasets: dataset
  }

  return chart
}
</script>