import { useState, useEffect } from 'react'

const KEY = 'ironpath:theme'

// Toggles between the light and dark Tailwind palettes by flipping the
// data-theme attribute on <html>. The choice is saved in localStorage and
// re-applied before paint by the inline script in index.html.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem(KEY, theme) } catch { /* ignore */ }
  }, [theme])

  const isDark = theme === 'dark'
  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle color theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
