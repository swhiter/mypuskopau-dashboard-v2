<!-- src/components/charts/DriverPerformanceChart.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h3 class="font-semibold mb-4">
      {{ $t('title.driverPerformanceChart') }}
    </h3>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Chart, type ChartData, type ChartOptions, registerables } from 'chart.js'

Chart.register(...registerables)

export interface DriverPerformanceItem {
  driverName: string
  totalOrders: number
  totalPendapatan: number
}

interface Props {
  data: DriverPerformanceItem[]
}

const props = defineProps<Props>()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const renderChart = () => {
  if (!canvasRef.value) return

  const labels = props.data.map((d) => d.driverName)
  const totalPendapatan = props.data.map((d) => d.totalPendapatan)
  const totalOrders = props.data.map((d) => d.totalOrders)

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'Total Pendapatan',
        data: totalPendapatan,
        yAxisID: 'y',
        backgroundColor: 'rgba(59,130,246,0.5)'
      },
      {
        label: 'Jumlah Order',
        data: totalOrders,
        yAxisID: 'y1',
        backgroundColor: 'rgba(16,185,129,0.5)'
      }
    ]
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Total Pendapatan'
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: 'Jumlah Order'
        }
      }
    }
  }

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data,
    options
  })
}

watch(
  () => props.data,
  () => renderChart(),
  { deep: true }
)

onMounted(() => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

<style scoped>
div {
  height: 320px;
}
</style>
