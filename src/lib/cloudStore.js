import { supabase } from './supabase.js'

// Write-through cache for the public.user_data table
// (user_id uuid, key text, value jsonb — RLS restricts every row to its owner).
// Saves are debounced per key so rapid set-logging doesn't spam the network,
// and flushed when the tab is hidden/closed so gym users switching apps
// mid-workout don't lose their last sets.

const DEBOUNCE_MS = 500

const pending = new Map() // 'userId:key' -> { userId, key, value, timer }
const hydrations = new Map() // userId -> Promise<{ [key]: value }>

// Fetch all rows for a user once per session; concurrent callers share the
// same promise, and the resolved map is cached for later mounts.
export function hydrate(userId) {
  if (!hydrations.has(userId)) {
    const promise = supabase
      .from('user_data')
      .select('key,value')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) {
          hydrations.delete(userId) // let the next mount retry
          throw new Error(error.message)
        }
        const map = {}
        for (const row of data || []) map[row.key] = row.value
        return map
      })
    hydrations.set(userId, promise)
  }
  return hydrations.get(userId)
}

function write({ userId, key, value }) {
  supabase
    .from('user_data')
    .upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
    .then(({ error }) => {
      if (error) {
        // Offline or RLS rejection — localStorage still holds the value, and
        // the next successful save of this key will carry the latest state.
      }
    })
}

export function save(userId, key, value) {
  if (!userId) return
  const id = `${userId}:${key}`
  const prev = pending.get(id)
  if (prev) clearTimeout(prev.timer)
  const entry = { userId, key, value }
  entry.timer = setTimeout(() => {
    pending.delete(id)
    write(entry)
  }, DEBOUNCE_MS)
  pending.set(id, entry)
}

export function flush() {
  for (const [id, entry] of pending) {
    clearTimeout(entry.timer)
    pending.delete(id)
    write(entry)
  }
}

// Push pending writes before the tab is backgrounded or unloaded.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
}
