import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { flush as flushCloud } from '../lib/cloudStore.js'

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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // Safety net: never leave the app stuck on the loading screen if the
    // session request hangs (flaky gym wifi).
    const timer = setTimeout(() => {
      if (active) setLoading(false)
    }, 5000)
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setUser(mapUser(data.session?.user))
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer)
        if (active) setLoading(false)
      })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user))
    })
    return () => {
      active = false
      clearTimeout(timer)
      sub.subscription.unsubscribe()
    }
  }, [])

  async function signup(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
    // Email confirmation enabled: the account exists but there's no session
    // until the user clicks the link in their inbox.
    if (!data.session) return { needsEmailConfirmation: true }
    const u = mapUser(data.user)
    setUser(u)
    return u
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const u = mapUser(data.user)
    setUser(u)
    return u
  }

  async function logout() {
    flushCloud() // land any debounced workout writes before the session ends
    try {
      await supabase.auth.signOut()
    } catch {
      // network failure — the local session is cleared regardless
    }
    setUser(null)
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    })
    if (error) throw new Error(error.message)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
