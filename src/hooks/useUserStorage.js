import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import * as cloudStore from '../lib/cloudStore.js'

// Like useLocalStorage, but namespaced to the current user so every account
// keeps its own program and history. Falls back to a "guest" namespace when
// nobody is logged in. Re-reads automatically when the user changes.
// Signed-in users also get cloud sync: values hydrate from Supabase user_data
// on login, and every change is written through to the cloud (debounced).
function read(key, fallback) {
  try {
    const v = window.localStorage.getItem(key)
    return v !== null ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

// Accounts from the old local-only auth stored users under 'ironpath:users'.
// Find the legacy id matching this email so that data can migrate to the cloud.
function legacyLocalId(email) {
  try {
    const users = JSON.parse(window.localStorage.getItem('ironpath:users') || '[]')
    const match = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase())
    return match ? match.id : null
  } catch {
    return null
  }
}

export function useUserStorage(suffix, defaultValue) {
  const { user } = useAuth()
  const userId = user?.id
  const userEmail = user?.email
  const key = `ironpath:${userId ? `u:${userId}` : 'guest'}:${suffix}`

  const [state, setState] = useState(() => ({ key, value: read(key, defaultValue) }))
  // Only values the user actually changed get written to the cloud — initial
  // mounts must never push defaults over data another device already saved.
  const dirty = useRef(false)

  // If the key changed (user logged in/out/switched), reload synchronously.
  let current = state
  if (state.key !== key) {
    current = { key, value: read(key, defaultValue) }
    setState(current)
    dirty.current = false
  }

  // Once the signed-in user's cloud data arrives, adopt it. If the cloud has
  // no row for this key but this browser does (current namespace or an old
  // local-auth account), push the local value up — never the reverse.
  useEffect(() => {
    if (!userId) return
    let active = true
    cloudStore
      .hydrate(userId)
      .then((map) => {
        if (Object.prototype.hasOwnProperty.call(map, suffix)) {
          if (active && !dirty.current) setState({ key, value: map[suffix] })
          return
        }
        let localValue = read(key, undefined)
        if (localValue === undefined && userEmail) {
          const oldId = legacyLocalId(userEmail)
          if (oldId) {
            localValue = read(`ironpath:u:${oldId}:${suffix}`, undefined)
            if (localValue !== undefined && active && !dirty.current) {
              setState({ key, value: localValue })
            }
          }
        }
        if (localValue !== undefined) {
          map[suffix] = localValue // keep the shared hydration cache consistent
          cloudStore.save(userId, suffix, localValue)
        }
      })
      .catch(() => {
        // offline or cloud error — keep local values; next mount retries
      })
    return () => {
      active = false
    }
  }, [userId, userEmail, key, suffix])

  useEffect(() => {
    try {
      window.localStorage.setItem(current.key, JSON.stringify(current.value))
    } catch {
      // storage unavailable — keep working in memory
    }
    if (dirty.current && userId) cloudStore.save(userId, suffix, current.value)
  }, [current.key, current.value, userId, suffix])

  const setValue = (updater) => {
    dirty.current = true
    setState((prev) => ({
      key,
      value: typeof updater === 'function' ? updater(prev.value) : updater,
    }))
  }

  return [current.value, setValue]
}
