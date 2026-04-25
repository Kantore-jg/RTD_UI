<script setup>
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  src: { type: String, default: '' },
  alt: { type: String, default: '' },
  class: { type: String, default: '' },
})

const hasError = ref(false)

const classes = computed(() =>
  cn('aspect-square h-full w-full', props.class)
)
</script>

<template>
  <img
    v-if="src && !hasError"
    :src="src"
    :alt="alt"
    :class="classes"
    @error="hasError = true"
  />
</template>
