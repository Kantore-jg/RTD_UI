<script setup>
import { computed } from 'vue'
import { DropdownMenuLabel } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  inset: { type: Boolean, default: false },
})

const classes = computed(() =>
  cn('px-2 py-1.5 text-sm font-semibold', props.inset && 'pl-8', props.class)
)
</script>

<template>
  <DropdownMenuLabel :class="classes">
    <slot />
  </DropdownMenuLabel>
</template>
