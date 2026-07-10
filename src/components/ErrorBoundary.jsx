import { Component } from 'react'

// Catches render/lifecycle errors below it so a page crash shows a themed
// fallback instead of white-screening the whole app.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // No error-reporting service is wired up yet; keep a trace for debugging.
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container">
          <div className="empty" style={{ marginTop: 80, marginBottom: 80 }}>
            <div className="big" aria-hidden="true">🏋️</div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: 8 }}>Something went wrong</h1>
            <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
              An unexpected error crashed this page. Reloading usually fixes it — your
              logged workouts are safe.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
