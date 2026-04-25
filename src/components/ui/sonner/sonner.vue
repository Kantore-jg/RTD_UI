<script setup>
import { Toaster } from 'vue-sonner'

defineProps({
  position: { type: String, default: 'bottom-right' },
  richColors: { type: Boolean, default: true },
  expand: { type: Boolean, default: false },
  closeButton: { type: Boolean, default: true },
})
</script>

<template>
  <Toaster
    :position="position"
    :rich-colors="richColors"
    :expand="expand"
    :close-button="closeButton"
    :toast-options="{
      classes: {
        toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
        description: 'group-[.toast]:text-muted-foreground',
        actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
        cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
      },
    }"
  />
</template>
