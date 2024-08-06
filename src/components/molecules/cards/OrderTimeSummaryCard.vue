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
  responsive: true
}

const chartData: Ref<ChartData<'doughnut'>> = ref({
  labels: Object.keys(props.summary),
  datasets: []
})

watch(summary, (newValue) => {
  // 
}, { deep: true })
</script>