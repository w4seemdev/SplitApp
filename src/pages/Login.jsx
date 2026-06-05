import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dest = location.state?.from || '/plan'

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (isSignup && form.name.trim().length < 2) return setError('Please enter your name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('Enter a valid email address.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')

    setBusy(true)
    try {
      if (isSignup) await signup(form.name, form.email, form.password)
      else await login(form.email, form.password)
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card card">
        <Link to="/" className="brand" style={{ justifyContent: 'center', marginBottom: 6 }}>
          <img src="/dumbbell.svg" alt="" />
          Iron<span>Path</span>
        </Link>
        <h1 className="auth-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="auth-sub">
          {isSignup
            ? 'Save your split, build your plan, and track every workout.'
            : 'Log in to pick up your program where you left off.'}
        </p>

        {/* Mode toggle */}
        <div className="auth-toggle">
          <button className={!isSignup ? 'on' : ''} onClick={() => { setMode('login'); setError('') }}>
            Log In
          </button>
          <button className={isSignup ? 'on' : ''} onClick={() => { setMode('signup'); setError('') }}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="auth-field">
              <label>Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Alex Lifter" autoComplete="name" />
            </div>
          )}
          <div className="auth-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="At least 6 characters"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Please wait…' : isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError('') }}>
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>

        <p className="auth-note">
          🔒 Demo accounts are stored in your browser and passwords are hashed. No data leaves this device.
        </p>
      </div>
    </div>
  )
}
