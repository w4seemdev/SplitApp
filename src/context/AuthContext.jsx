import { createContext, useContext, useState } from 'react'
import { signupUser, loginUser, saveSession, getSession, clearSession } from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Restore the logged-in user from the saved session on first load.
  const [user, setUser] = useState(() => getSession())

  async function signup(name, email, password) {
    const u = await signupUser(name, email, password)
    saveSession(u)
    setUser(u)
    return u
  }

  async function login(email, password) {
    const u = await loginUser(email, password)
    saveSession(u)
    setUser(u)
    return u
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
