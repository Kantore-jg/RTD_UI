<script setup>
import { DropdownMenuRoot } from 'radix-vue'

const props = defineProps({
  open: { type: Boolean, default: undefined },
  defaultOpen: { type: Boolean, default: false },
  dir: { type: String, default: undefined },
})

const emit = defineEmits(['update:open'])
</script>

<template>
  <DropdownMenuRoot :open="open" :default-open="defaultOpen" :dir="dir" @update:open="emit('update:open', $event)">
    <slot />
  </DropdownMenuRoot>
</template>
