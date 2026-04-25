<script setup>
import { computed } from 'vue'
import { DropdownMenuItem } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  inset: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const classes = computed(() =>
  cn(
    'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
    props.inset && 'pl-8',
    props.class
  )
)
</script>

<template>
  <DropdownMenuItem :class="classes" :disabled="disabled">
    <slot />
  </DropdownMenuItem>
</template>
