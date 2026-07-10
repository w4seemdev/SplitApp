import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Info/success messages reuse the error box layout but in accent colors so a
// happy state (account created, reset email sent) never reads as a failure.
const infoStyle = {
  background: 'var(--accent-glow)',
  border: '1px solid var(--accent)',
  color: 'var(--accent-soft)',
  padding: '11px 14px',
  borderRadius: 'var(--radius)',
  fontSize: '0.9rem',
}

export default function Login() {
  const { login, signup, resetPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dest = location.state?.from || '/plan'

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'forgot'
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'
  const isForgot = mode === 'forgot'
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const switchMode = (m) => {
    setMode(m)
    setError('')
    setInfo('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (isSignup && form.name.trim().length < 2) return setError('Please enter your name.')
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return setError('Enter a valid email address.')
    if (!isForgot && form.password.length < 6) return setError('Password must be at least 6 characters.')

    setBusy(true)
    try {
      if (isForgot) {
        await resetPassword(form.email)
        setInfo('Password reset email sent — check your inbox for the link.')
        setBusy(false)
        return
      }
      if (isSignup) {
        const res = await signup(form.name, form.email, form.password)
        // Email confirmation on: no session yet, prompt to confirm.
        if (res?.needsEmailConfirmation) {
          setMode('login')
          setInfo('Account created! Check your email to confirm your account, then log in.')
          setBusy(false)
          return
        }
      } else {
        await login(form.email, form.password)
      }
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
          Split<span>App</span>
        </Link>
        <h1 className="auth-title">
          {isForgot ? 'Reset your password' : isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="auth-sub">
          {isForgot
            ? "Enter your account email and we'll send you a reset link."
            : isSignup
              ? 'Save your split, build your plan, and track every workout.'
              : 'Log in to pick up your program where you left off.'}
        </p>

        {/* Mode toggle */}
        {!isForgot && (
          <div className="auth-toggle">
            <button className={!isSignup ? 'on' : ''} onClick={() => switchMode('login')}>
              Log In
            </button>
            <button className={isSignup ? 'on' : ''} onClick={() => switchMode('signup')}>
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && (
            <div className="auth-field">
              <label htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Alex Lifter"
                autoComplete="name"
              />
            </div>
          )}
          <div className="auth-field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          {!isForgot && (
            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="At least 6 characters"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          <div aria-live="polite">
            {error && <div className="auth-error">⚠ {error}</div>}
            {info && <div style={infoStyle}>✓ {info}</div>}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'Please wait…' : isForgot ? 'Send Reset Link' : isSignup ? 'Create Account' : 'Log In'}
          </button>
        </form>

        {mode === 'login' && (
          <p className="auth-switch" style={{ marginTop: 12 }}>
            <button onClick={() => switchMode('forgot')}>Forgot password?</button>
          </p>
        )}

        <p className="auth-switch">
          {isForgot ? (
            <button onClick={() => switchMode('login')}>← Back to log in</button>
          ) : (
            <>
              {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => switchMode(isSignup ? 'login' : 'signup')}>
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </>
          )}
        </p>

        <p className="auth-note">
          🔒 Your program and workout history sync securely to your account, so you can log in from any device.
        </p>
      </div>
    </div>
  )
}
