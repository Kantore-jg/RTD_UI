<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { baseChartOptions } from '@/lib/chart'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  height: { type: Number, default: 280 },
  horizontal: { type: Boolean, default: false },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

const options = computed(() => ({
  ...baseChartOptions,
  indexAxis: props.horizontal ? 'y' : 'x',
  plugins: {
    ...baseChartOptions.plugins,
    legend: { display: false },
  },
  scales: {
    x: {
      beginAtZero: true,
      grid: props.horizontal ? { display: false } : undefined,
      ticks: { precision: 0, font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      grid: props.horizontal ? undefined : { display: false },
      ticks: { precision: 0, font: { size: 10 } },
    },
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px`, position: 'relative' }">
    <Bar :data="chartData" :options="options" />
  </div>
</template>
