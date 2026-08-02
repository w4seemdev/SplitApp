import { createClient } from '@supabase/supabase-js'

// Credentials come from the environment only. Nothing is baked in: every
// deployment must be pointed at its own Supabase project via VITE_SUPABASE_URL
// and VITE_SUPABASE_ANON_KEY, so an install can never silently read from or
// write to somebody else's database.
//
// The anon key is public by design (Vite inlines VITE_* vars into the client
// bundle). It is only safe because every row is protected server-side by
// Row-Level Security — a deployment without those policies is wide open.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const SUPABASE_SETUP_MESSAGE =
  'Account features are unavailable: this deployment has no Supabase project ' +
  'configured. Copy .env.example to .env and set VITE_SUPABASE_URL and ' +
  'VITE_SUPABASE_ANON_KEY (Dashboard → Project Settings → API).'

if (!isSupabaseConfigured) console.error(SUPABASE_SETUP_MESSAGE)

// null when unconfigured. Every caller guards on it, so a missing backend
// degrades to "signed-out guest" instead of white-screening the whole app —
// the public pages (home, splits, exercises) keep working.
export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
