import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const Splits = lazy(() => import('./pages/Splits.jsx'))
const Plan = lazy(() => import('./pages/Plan.jsx'))
const Exercises = lazy(() => import('./pages/Exercises.jsx'))
const Tracker = lazy(() => import('./pages/Tracker.jsx'))
const Progress = lazy(() => import('./pages/Progress.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

// On route change, move focus to <main> (screen readers announce the new
// page) and reset scroll. Skips the initial mount so page load keeps
// normal focus order.
function FocusMainOnNavigate() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const main = document.getElementById('main')
    if (main) main.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Navbar />
      <FocusMainOnNavigate />
      <main id="main" tabIndex={-1}>
        <ErrorBoundary>
          <Suspense fallback={<div className="page-loading" role="status">Loading…</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/splits" element={<Splits />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/plan"
                element={
                  <ProtectedRoute>
                    <Plan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tracker"
                element={
                  <ProtectedRoute>
                    <Tracker />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  )
}
