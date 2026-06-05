import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty" style={{ marginTop: 80, marginBottom: 80 }}>
        <div className="big">🤷</div>
        <h1 style={{ fontSize: '3rem', marginBottom: 8 }}>404</h1>
        <h3 style={{ marginBottom: 12 }}>This page took a rest day</h3>
        <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
          The page you're looking for doesn't exist. Let's get you back to your training.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">Back Home →</Link>
          <Link to="/tracker" className="btn btn-ghost">Open Tracker</Link>
        </div>
      </div>
    </div>
  )
}
