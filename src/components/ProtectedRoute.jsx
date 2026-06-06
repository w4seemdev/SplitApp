import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Wrap a route that requires a logged-in user. Sends guests to /login and
// remembers where they were headed so we can return them after sign-in.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  // While the session is restoring (Supabase loads it asynchronously), wait.
  if (loading) {
    return (
      <div className="container">
        <p style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-dim)' }}>Loading…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }
  return children
}
