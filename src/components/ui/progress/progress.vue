<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  class: { type: String, default: '' },
})

const percentage = computed(() => (props.modelValue / props.max) * 100)

const containerClasses = computed(() =>
  cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', props.class)
)
</script>

<template>
  <div :class="containerClasses" role="progressbar" :aria-valuenow="modelValue" :aria-valuemin="0" :aria-valuemax="max">
    <div
      class="h-full w-full flex-1 bg-primary transition-all"
      :style="{ transform: `translateX(-${100 - percentage}%)` }"
    />
  </div>
</template>
