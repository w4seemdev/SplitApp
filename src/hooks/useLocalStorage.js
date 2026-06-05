import { useState, useEffect } from 'react'

// Persist a piece of React state to localStorage so progress survives reloads.
// Usage: const [value, setValue] = useLocalStorage('key', defaultValue)
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or unavailable — fail silently, app still works in-memory.
    }
  }, [key, value])

  return [value, setValue]
}
