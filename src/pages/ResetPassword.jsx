import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const infoStyle = {
  background: 'var(--accent-glow)',
  border: '1px solid var(--accent)',
  color: 'var(--accent-soft)',
  padding: '11px 14px',
  borderRadius: 'var(--radius)',
  fontSize: '0.9rem',
}

// Landing page for the Supabase password-recovery email link. The link signs
// the user in with a temporary recovery session; once that session exists we
// let them set a new password via updateUser.
export default function ResetPassword() {
  const [ready, setReady] = useState(false)
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (active && data.session) setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setBusy(true)
    try {
      const { error: err } = await supabase.auth.updateUser({ password: form.password })
      if (err) throw new Error(err.message)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not update your password.')
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
        <h1 className="auth-title">Set a new password</h1>

        {done ? (
          <>
            <div style={infoStyle}>✓ Password updated. You can now log in with your new password.</div>
            <p className="auth-switch">
              <Link to="/login">Go to log in →</Link>
            </p>
          </>
        ) : !ready ? (
          <>
            <p className="auth-sub">
              Open the reset link from your email to set a new password. If you got here by accident, you can
              request a new link from the login page.
            </p>
            <p className="auth-switch">
              <Link to="/login">← Back to log in</Link>
            </p>
          </>
        ) : (
          <>
            <p className="auth-sub">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="reset-password">New password</label>
                <input
                  id="reset-password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="reset-confirm">Confirm new password</label>
                <input
                  id="reset-confirm"
                  type="password"
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Repeat your new password"
                  autoComplete="new-password"
                />
              </div>

              <div aria-live="polite">{error && <div className="auth-error">⚠ {error}</div>}</div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
                {busy ? 'Please wait…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
