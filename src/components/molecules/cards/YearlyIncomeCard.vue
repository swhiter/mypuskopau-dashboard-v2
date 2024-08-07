<template>
  <DashboardCard :title="t('title.earnings')" :loading="loading">
    <div class="flex w-full h-80 2xl:h-96 items-center justify-center">
      <Bar id="yearly-income-chart" :options="chartOptions" :data="chartData" />
    </div>
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
      label: '00.00 - 07.59',
      data: earlyMorningIncome,
      backgroundColor: '#C7CEFF',
      borderRadius: 10
    },
    {
      label: '08.00 - 16.59',
      data: dayIncome,
      backgroundColor: '#94959A',
      borderRadius: 10
    },
    {
      label: '17.00 - 23.59',
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