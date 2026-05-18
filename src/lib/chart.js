import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const FALLBACK_COLORS = [
  'oklch(0.55 0.16 250)',
  'oklch(0.65 0.15 160)',
  'oklch(0.6 0.18 350)',
  'oklch(0.65 0.16 55)',
  'oklch(0.5 0.12 220)',
]

export function getChartColors(count = 5) {
  if (typeof document === 'undefined') return FALLBACK_COLORS.slice(0, count)
  const root = document.documentElement
  const fromVars = [
    '--primary',
    '--chart-2',
    '--chart-3',
    '--chart-4',
    '--chart-5',
  ].map((v) => {
    const val = getComputedStyle(root).getPropertyValue(v).trim()
    return val || null
  }).filter(Boolean)

  const palette = fromVars.length ? fromVars : FALLBACK_COLORS
  return Array.from({ length: count }, (_, i) => palette[i % palette.length])
}

export function withAlpha(color, alpha = 0.15) {
  if (color.startsWith('oklch(')) {
    return color.replace(/\)$/, ` / ${alpha})`)
  }
  return color
}

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom',
      labels: { boxWidth: 12, padding: 14, font: { size: 11 } },
    },
    tooltip: {
      bodyFont: { size: 12 },
      titleFont: { size: 12 },
    },
  },
}

export { Chart }
