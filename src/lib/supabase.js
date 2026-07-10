import { createClient } from '@supabase/supabase-js'

// Env vars take precedence (e.g. to point at a different project), but the
// production project is baked in as a fallback so deploys work without host
// env config. The anon key is public by design — every row in the database is
// protected server-side by Row-Level Security, so exposing it grants nothing.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://kblgcgxjlofkcocrhoyy.supabase.co'
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtibGdjZ3hqbG9ma2NvY3Job3l5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MjQ2MzUsImV4cCI6MjA5NjQwMDYzNX0.97xeoWeWBlIwnBgK_P1hRyGdBQKPcMTpb7Nxlio9j5c'

// Always true now that credentials are baked in; kept for compatibility.
export const isSupabaseConfigured = true

export const supabase = createClient(url, anonKey)
