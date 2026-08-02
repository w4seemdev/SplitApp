import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, act } from '@testing-library/react'
import { useUserStorage } from './useUserStorage.js'
import { hydrate, save, resetHydrations } from '../lib/cloudStore.js'

// An in-memory stand-in for public.user_data. Rows look exactly like the real
// select: { key, value, updated_at }. No network, no Supabase project needed.
const h = vi.hoisted(() => {
  const rows = new Map()
  let user = { id: 'u1', email: 'lifter@example.com' }
  const supabase = {
    from: () => ({
      select: () => ({
        eq: () =>
          Promise.resolve({
            data: [...rows.entries()].map(([key, r]) => ({
              key,
              value: r.value,
              updated_at: r.updated_at,
            })),
            error: null,
          }),
      }),
      upsert: (row) => {
        rows.set(row.key, { value: row.value, updated_at: row.updated_at })
        return Promise.resolve({ error: null })
      },
    }),
  }
  return { rows, supabase, getUser: () => user, setUser: (u) => (user = u) }
})

vi.mock('../lib/supabase.js', () => ({
  supabase: h.supabase,
  isSupabaseConfigured: true,
  SUPABASE_SETUP_MESSAGE: 'not configured',
}))

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ user: h.getUser() }),
}))

let latest
let setLatest

function Probe() {
  const [value, setValue] = useUserStorage('history', [])
  latest = value
  setLatest = setValue
  return null
}

const iso = (ms) => new Date(ms).toISOString()
const settle = () => act(async () => {})

beforeEach(() => {
  resetHydrations()
  h.rows.clear()
  window.localStorage.clear()
  h.setUser({ id: 'u1', email: 'lifter@example.com' })
})

describe('useUserStorage cloud sync', () => {
  // The regression test for the data-loss bug: the session-long hydration
  // cache was frozen at login, so remounting a component replayed that stale
  // snapshot over a workout logged since — and then pushed the truncated
  // array back to the server, destroying it permanently.
  it('keeps a workout logged just before navigation when the component remounts', async () => {
    h.rows.set('history', { value: ['B', 'A'], updated_at: iso(1000) })

    const tracker = render(<Probe />)
    await settle()
    expect(latest).toEqual(['B', 'A'])

    // User logs workout C on /tracker.
    await act(async () => setLatest((prev) => ['C', ...prev]))
    expect(latest).toEqual(['C', 'B', 'A'])

    // Navigating to /progress unmounts Tracker and mounts a fresh consumer.
    tracker.unmount()
    render(<Probe />)
    await settle()

    expect(latest).toEqual(['C', 'B', 'A'])
  })

  it('does not resurrect the previous session after logout', async () => {
    h.rows.set('history', { value: ['A'], updated_at: iso(1000) })
    await hydrate('u1')

    // Another device logs a workout while this tab is signed out.
    h.rows.set('history', { value: ['NEW', 'A'], updated_at: iso(5000) })
    resetHydrations() // what AuthContext.logout() now calls

    render(<Probe />)
    await settle()
    expect(latest).toEqual(['NEW', 'A'])
  })
})

describe('cloudStore hydration cache', () => {
  it('reflects saves made during the same session', async () => {
    h.rows.set('history', { value: ['A'], updated_at: iso(1000) })

    const first = await hydrate('u1')
    expect(first.history.value).toEqual(['A'])

    save('u1', 'history', ['B', 'A'])

    const second = await hydrate('u1')
    expect(second.history.value).toEqual(['B', 'A'])
  })

  it('resetHydrations() forces the next hydrate to refetch from the server', async () => {
    h.rows.set('history', { value: ['A'], updated_at: iso(1000) })
    await hydrate('u1')

    h.rows.set('history', { value: ['Z'], updated_at: iso(9000) })
    resetHydrations()

    const refetched = await hydrate('u1')
    expect(refetched.history.value).toEqual(['Z'])
  })
})
