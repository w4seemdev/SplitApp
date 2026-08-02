import { supabase } from './supabase.js'

// Write-through cache for the public.user_data table
// (user_id uuid, key text, value jsonb, updated_at timestamptz — RLS restricts
// every row to its owner). Saves are debounced per key so rapid set-logging
// doesn't spam the network, and flushed when the tab is hidden/closed so gym
// users switching apps mid-workout don't lose their last sets.

const DEBOUNCE_MS = 500

const pending = new Map() // 'userId:key' -> { userId, key, value, updatedAt, timer }
const hydrations = new Map() // userId -> Promise<{ [key]: { value, updatedAt } }>
const failed = new Map() // 'userId:key' -> { userId, key, value, updatedAt }

// Fetch all rows for a user once per session; concurrent callers share the
// same promise, and the resolved map is cached for later mounts.
//
// save() patches that cached map on every change. Without this the map stayed
// frozen at its login-time contents, so remounting a component mid-session
// (navigating /tracker -> /progress) replayed a stale snapshot over newer
// local data and then pushed the truncated result to the server.
export function hydrate(userId) {
  if (!supabase) return Promise.resolve({})
  if (!hydrations.has(userId)) {
    const promise = supabase
      .from('user_data')
      .select('key,value,updated_at')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error) {
          hydrations.delete(userId) // let the next mount retry
          throw new Error(error.message)
        }
        const map = {}
        for (const row of data || []) {
          map[row.key] = { value: row.value, updatedAt: Date.parse(row.updated_at) || 0 }
        }
        return map
      })
    hydrations.set(userId, promise)
  }
  return hydrations.get(userId)
}

// Keep the cached hydration map in step with a local change, so the next
// component to mount sees what the user actually has now.
function patchHydration(userId, key, value, updatedAt) {
  const cached = hydrations.get(userId)
  if (!cached) return
  cached
    .then((map) => {
      map[key] = { value, updatedAt }
    })
    .catch(() => {
      // hydration failed; nothing to keep in step
    })
}

function write(entry) {
  if (!supabase) return
  const { userId, key, value, updatedAt } = entry
  const id = `${userId}:${key}`
  supabase
    .from('user_data')
    .upsert(
      { user_id: userId, key, value, updated_at: new Date(updatedAt).toISOString() },
      { onConflict: 'user_id,key' }
    )
    .then(({ error }) => {
      // Offline or RLS rejection. localStorage still holds the value, so keep
      // the entry queued and retry when the connection returns rather than
      // dropping a logged workout on the floor.
      if (error) failed.set(id, entry)
      else failed.delete(id)
    })
}

export function save(userId, key, value) {
  if (!userId) return
  const id = `${userId}:${key}`
  const prev = pending.get(id)
  if (prev) clearTimeout(prev.timer)
  const updatedAt = Date.now()
  const entry = { userId, key, value, updatedAt }
  patchHydration(userId, key, value, updatedAt)
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

// Re-send writes that never landed (offline mid-workout).
export function retryFailed() {
  for (const [id, entry] of failed) {
    failed.delete(id)
    write(entry)
  }
}

// Drop every cached session. Called on logout so signing back in — in the same
// tab, or as a different account — re-reads from the server instead of
// resurrecting the previous session's snapshot.
export function resetHydrations() {
  for (const entry of pending.values()) clearTimeout(entry.timer)
  pending.clear()
  hydrations.clear()
  failed.clear()
}

// Push pending writes before the tab is backgrounded or unloaded, and drain
// anything that failed once the network is back.
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
  window.addEventListener('pagehide', flush)
  window.addEventListener('online', retryFailed)
}
