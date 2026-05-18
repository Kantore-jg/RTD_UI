import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export function storageUrl(path) {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_BASE}/storage/${path}`
}

/** Montant en francs burundais (FBU), sans décimales. */
export function formatFbu(amount) {
  const n = Number(amount || 0)
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })} FBU`
}

/** Quantité entière (pas de décimales). */
export function formatQty(qty) {
  const n = Math.round(Number(qty || 0))
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0, minimumFractionDigits: 0 })
}
