import { useEffect } from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

// Like useLocalStorage, but namespaced to the current user so every account
// keeps its own program and history. Falls back to a "guest" namespace when
// nobody is logged in. Re-reads automatically when the user changes.
function read(key, fallback) {
  try {
    const v = window.localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function useUserStorage(suffix, defaultValue) {
  const { user } = useAuth()
  const key = `ironpath:${user ? `u:${user.id}` : 'guest'}:${suffix}`

  const [state, setState] = useState(() => ({ key, value: read(key, defaultValue) }))

  // If the key changed (user logged in/out/switched), reload synchronously.
  let current = state
  if (state.key !== key) {
    current = { key, value: read(key, defaultValue) }
    setState(current)
  }

  useEffect(() => {
    try {
      window.localStorage.setItem(current.key, JSON.stringify(current.value))
    } catch {
      // storage unavailable — keep working in memory
    }
  }, [current.key, current.value])

  const setValue = (updater) =>
    setState((prev) => ({
      key,
      value: typeof updater === 'function' ? updater(prev.value) : updater,
    }))

  return [current.value, setValue]
}
