<script setup>
import { computed } from 'vue'
import { TabsList } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
})

const classes = computed(() =>
  cn(
    'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
    props.class
  )
)
</script>

<template>
  <TabsList :class="classes">
    <slot />
  </TabsList>
</template>
