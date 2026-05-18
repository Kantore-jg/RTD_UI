<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { baseChartOptions } from '@/lib/chart'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  height: { type: Number, default: 280 },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

const options = computed(() => ({
  ...baseChartOptions,
  plugins: {
    ...baseChartOptions.plugins,
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8, font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 10 } },
    },
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px`, position: 'relative' }">
    <Line :data="chartData" :options="options" />
  </div>
</template>
