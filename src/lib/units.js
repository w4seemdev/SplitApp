// Weight-unit helpers so the app works for both kg and lb users worldwide.

export const KG_TO_LB = 2.2046226218

// Normalize any stored unit value to a safe label.
export const unitLabel = (u) => (u === 'lb' ? 'lb' : 'kg')

// Convert a weight/volume value from one unit to another.
export function convert(value, from, to) {
  if (!value || from === to) return value || 0
  return from === 'kg' ? value * KG_TO_LB : value / KG_TO_LB
}

// Round and add thousands separators (e.g. 12345 -> "12,345").
export const fmt = (n) => Math.round(n || 0).toLocaleString()
