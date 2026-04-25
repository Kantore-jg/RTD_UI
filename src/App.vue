<script setup>
import { watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { Toaster } from 'vue-sonner'

const themeStore = useThemeStore()

watch(() => themeStore.theme, (newTheme) => {
  document.documentElement.classList.toggle('dark', newTheme === 'dark')
}, { immediate: true })
</script>

<template>
  <router-view />
  <Toaster position="top-right" richColors />
</template>
