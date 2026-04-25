<script setup>
import { computed } from 'vue'
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
} from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  class: { type: String, default: '' },
  orientation: { type: String, default: 'vertical' },
})

const rootClasses = computed(() =>
  cn('relative overflow-hidden', props.class)
)
</script>

<template>
  <ScrollAreaRoot :class="rootClasses">
    <ScrollAreaViewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      :orientation="orientation"
      class="flex touch-none select-none transition-colors"
      :class="
        orientation === 'vertical'
          ? 'h-full w-2.5 border-l border-l-transparent p-px'
          : 'h-2.5 flex-col border-t border-t-transparent p-px'
      "
    >
      <ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
    <ScrollAreaCorner />
  </ScrollAreaRoot>
</template>
