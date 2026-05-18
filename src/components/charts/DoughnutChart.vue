<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { baseChartOptions } from '@/lib/chart'

const props = defineProps({
  labels: { type: Array, default: () => [] },
  datasets: { type: Array, default: () => [] },
  height: { type: Number, default: 260 },
})

const chartData = computed(() => ({
  labels: props.labels,
  datasets: props.datasets,
}))

const options = computed(() => ({
  ...baseChartOptions,
  cutout: '58%',
  plugins: {
    ...baseChartOptions.plugins,
    legend: {
      display: true,
      position: 'bottom',
      labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
    },
  },
}))
</script>

<template>
  <div :style="{ height: `${height}px`, position: 'relative' }">
    <Doughnut :data="chartData" :options="options" />
  </div>
</template>
