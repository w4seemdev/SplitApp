import { createClient } from '@supabase/supabase-js'

// Reads your Supabase project credentials from the environment (.env).
// If they're not set, the app falls back to local (browser-only) auth so it
// still runs in demo mode. Add your keys to .env to switch to real accounts.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured ? createClient(url, anonKey) : null
