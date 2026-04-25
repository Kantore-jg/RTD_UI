<script setup>
import { computed } from 'vue'
import { TabsRoot } from 'radix-vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  defaultValue: { type: String, default: '' },
  modelValue: { type: String, default: undefined },
  class: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const classes = computed(() => cn(props.class))
</script>

<template>
  <TabsRoot
    :default-value="defaultValue"
    :model-value="modelValue"
    :class="classes"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </TabsRoot>
</template>
