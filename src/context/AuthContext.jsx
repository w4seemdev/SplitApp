import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import * as local from '../lib/auth.js'

const AuthContext = createContext(null)

// Map a Supabase user object to the simple { id, name, email } shape the rest
// of the app already expects (Navbar, useUserStorage keying, Settings, etc.).
function mapUser(su) {
  if (!su) return null
  return {
    id: su.id,
    email: su.email,
    name: su.user_metadata?.name || su.email?.split('@')[0] || 'Athlete',
  }
}

export function AuthProvider({ children }) {
  // With Supabase, the session loads asynchronously, so start in a loading state.
  // Without it, restore the local session synchronously.
  const [user, setUser] = useState(() => (isSupabaseConfigured ? null : local.getSession()))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(mapUser(data.session?.user))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user))
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signup(name, email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (error) throw new Error(error.message)
      // If email confirmation is enabled, there's no session yet.
      if (!data.session) return { needsConfirmation: true }
      const u = mapUser(data.user)
      setUser(u)
      return u
    }
    const u = await local.signupUser(name, email, password)
    local.saveSession(u)
    setUser(u)
    return u
  }

  async function login(email, password) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      const u = mapUser(data.user)
      setUser(u)
      return u
    }
    const u = await local.loginUser(email, password)
    local.saveSession(u)
    setUser(u)
    return u
  }

  async function logout() {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    else local.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
