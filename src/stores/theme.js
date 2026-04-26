import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const accentPresets = {
  blue: {
    light: {
      '--primary': 'oklch(0.6 0.16 250)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.6 0.16 250 / 0.5)',
      '--accent': 'oklch(0.94 0.02 250)',
      '--accent-foreground': 'oklch(0.6 0.16 250)',
      '--sidebar-primary': 'oklch(0.6 0.16 250)',
      '--sidebar-ring': 'oklch(0.6 0.16 250)',
    },
    dark: {
      '--primary': 'oklch(0.55 0.14 250)',
      '--primary-foreground': 'oklch(0.15 0.02 240)',
      '--ring': 'oklch(0.55 0.14 250 / 0.5)',
      '--accent': 'oklch(0.25 0.03 250)',
      '--accent-foreground': 'oklch(0.55 0.14 250)',
      '--sidebar-primary': 'oklch(0.55 0.14 250)',
      '--sidebar-ring': 'oklch(0.55 0.14 250)',
    },
  },
  violet: {
    light: {
      '--primary': 'oklch(0.55 0.17 295)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.55 0.17 295 / 0.5)',
      '--accent': 'oklch(0.94 0.03 295)',
      '--accent-foreground': 'oklch(0.55 0.17 295)',
      '--sidebar-primary': 'oklch(0.55 0.17 295)',
      '--sidebar-ring': 'oklch(0.55 0.17 295)',
    },
    dark: {
      '--primary': 'oklch(0.52 0.15 295)',
      '--primary-foreground': 'oklch(0.15 0.02 295)',
      '--ring': 'oklch(0.52 0.15 295 / 0.5)',
      '--accent': 'oklch(0.25 0.04 295)',
      '--accent-foreground': 'oklch(0.52 0.15 295)',
      '--sidebar-primary': 'oklch(0.52 0.15 295)',
      '--sidebar-ring': 'oklch(0.52 0.15 295)',
    },
  },
  emerald: {
    light: {
      '--primary': 'oklch(0.6 0.15 160)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.6 0.15 160 / 0.5)',
      '--accent': 'oklch(0.94 0.03 160)',
      '--accent-foreground': 'oklch(0.6 0.15 160)',
      '--sidebar-primary': 'oklch(0.6 0.15 160)',
      '--sidebar-ring': 'oklch(0.6 0.15 160)',
    },
    dark: {
      '--primary': 'oklch(0.55 0.13 160)',
      '--primary-foreground': 'oklch(0.15 0.02 160)',
      '--ring': 'oklch(0.55 0.13 160 / 0.5)',
      '--accent': 'oklch(0.25 0.04 160)',
      '--accent-foreground': 'oklch(0.55 0.13 160)',
      '--sidebar-primary': 'oklch(0.55 0.13 160)',
      '--sidebar-ring': 'oklch(0.55 0.13 160)',
    },
  },
  rose: {
    light: {
      '--primary': 'oklch(0.6 0.18 350)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.6 0.18 350 / 0.5)',
      '--accent': 'oklch(0.94 0.03 350)',
      '--accent-foreground': 'oklch(0.6 0.18 350)',
      '--sidebar-primary': 'oklch(0.6 0.18 350)',
      '--sidebar-ring': 'oklch(0.6 0.18 350)',
    },
    dark: {
      '--primary': 'oklch(0.55 0.16 350)',
      '--primary-foreground': 'oklch(0.15 0.02 350)',
      '--ring': 'oklch(0.55 0.16 350 / 0.5)',
      '--accent': 'oklch(0.25 0.04 350)',
      '--accent-foreground': 'oklch(0.55 0.16 350)',
      '--sidebar-primary': 'oklch(0.55 0.16 350)',
      '--sidebar-ring': 'oklch(0.55 0.16 350)',
    },
  },
  orange: {
    light: {
      '--primary': 'oklch(0.65 0.16 55)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.65 0.16 55 / 0.5)',
      '--accent': 'oklch(0.94 0.03 55)',
      '--accent-foreground': 'oklch(0.65 0.16 55)',
      '--sidebar-primary': 'oklch(0.65 0.16 55)',
      '--sidebar-ring': 'oklch(0.65 0.16 55)',
    },
    dark: {
      '--primary': 'oklch(0.6 0.14 55)',
      '--primary-foreground': 'oklch(0.15 0.02 55)',
      '--ring': 'oklch(0.6 0.14 55 / 0.5)',
      '--accent': 'oklch(0.25 0.04 55)',
      '--accent-foreground': 'oklch(0.6 0.14 55)',
      '--sidebar-primary': 'oklch(0.6 0.14 55)',
      '--sidebar-ring': 'oklch(0.6 0.14 55)',
    },
  },
  slate: {
    light: {
      '--primary': 'oklch(0.28 0.02 260)',
      '--primary-foreground': 'oklch(1 0 0)',
      '--ring': 'oklch(0.28 0.02 260 / 0.4)',
      '--accent': 'oklch(0.92 0.01 260)',
      '--accent-foreground': 'oklch(0.28 0.02 260)',
      '--sidebar-primary': 'oklch(0.28 0.02 260)',
      '--sidebar-ring': 'oklch(0.28 0.02 260)',
    },
    dark: {
      '--primary': 'oklch(0.7 0.02 260)',
      '--primary-foreground': 'oklch(0.15 0.02 260)',
      '--ring': 'oklch(0.7 0.02 260 / 0.4)',
      '--accent': 'oklch(0.28 0.02 260)',
      '--accent-foreground': 'oklch(0.7 0.02 260)',
      '--sidebar-primary': 'oklch(0.7 0.02 260)',
      '--sidebar-ring': 'oklch(0.7 0.02 260)',
    },
  },
}

function applyAccentToDOM(accentId, mode) {
  const preset = accentPresets[accentId]
  if (!preset) return
  const vars = preset[mode] || preset.light
  const root = document.documentElement
  for (const [prop, value] of Object.entries(vars)) {
    root.style.setProperty(prop, value)
  }
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref('light')
  const accent = ref('blue')

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  function setAccent(id) {
    if (!accentPresets[id]) return
    accent.value = id
    applyAccentToDOM(id, theme.value)
  }

  function applyCurrentAccent() {
    applyAccentToDOM(accent.value, theme.value)
  }

  watch(theme, (mode) => {
    applyAccentToDOM(accent.value, mode)
  })

  return { theme, accent, toggleTheme, setAccent, applyCurrentAccent, accentPresets }
}, {
  persist: {
    key: 'theme-storage',
    afterRestore(ctx) {
      const { accent, theme } = ctx.store
      applyAccentToDOM(accent, theme)
    },
  },
})
