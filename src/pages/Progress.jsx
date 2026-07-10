import { Link } from 'react-router-dom'
import { useUserStorage } from '../hooks/useUserStorage.js'
import usePageTitle from '../hooks/usePageTitle.js'
import { STORE, dayShortName } from '../lib/program.js'
import { convert, fmt, unitLabel } from '../lib/units.js'
import { MUSCLE_GROUPS } from '../data/exercises.js'

const MUSCLE_COLOR = Object.fromEntries(MUSCLE_GROUPS.map((m) => [m.name, m.color]))

// Training streak = count of training days where the gap between consecutive
// training days is <= 2 calendar days (scheduled rest doesn't break it);
// a gap of 3+ days ends the streak.
function computeStreak(history) {
  if (!history.length) return 0
  const DAY_MS = 24 * 60 * 60 * 1000
  // Unique training days at midnight-local granularity, newest first.
  const days = [...new Set(history.map((h) => new Date(h.date).setHours(0, 0, 0, 0)))]
    .sort((a, b) => b - a)
  const today = new Date().setHours(0, 0, 0, 0)
  // Math.round absorbs DST-shifted 23/25-hour days.
  if (Math.round((today - days[0]) / DAY_MS) >= 3) return 0
  let streak = 1
  for (let i = 1; i < days.length; i++) {
    if (Math.round((days[i - 1] - days[i]) / DAY_MS) >= 3) break
    streak++
  }
  return streak
}

export default function Progress() {
  usePageTitle('Progress')
  const [history] = useUserStorage(STORE.history, [])
  const [settings] = useUserStorage(STORE.settings, { unit: 'kg' })
  const unit = unitLabel(settings?.unit)

  // ---------- Empty state ----------
  if (!history.length) {
    return (
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Your numbers</p>
          <h1>Progress</h1>
        </div>
        <div className="empty section-sm">
          <div className="big">📊</div>
          <h3 style={{ marginBottom: 10 }}>No workouts logged yet</h3>
          <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
            Finish a workout in the tracker and your stats — volume, streaks, and per-muscle
            breakdown — will show up here.
          </p>
          <Link to="/tracker" className="btn btn-primary">Go to Tracker →</Link>
        </div>
      </div>
    )
  }

  const totalVolume = history.reduce((v, h) => v + convert(h.volume, h.unit || 'kg', unit), 0)
  const totalSets = history.reduce((n, h) => n + (h.sets || 0), 0)
  const streak = computeStreak(history)

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const weekVolume = history
    .filter((h) => new Date(h.date).getTime() >= weekAgo)
    .reduce((v, h) => v + convert(h.volume, h.unit || 'kg', unit), 0)

  // Recent sessions (oldest→newest) for the bar chart.
  const recent = history.slice(0, 14).reverse()
  const maxVol = Math.max(...recent.map((h) => convert(h.volume, h.unit || 'kg', unit)), 1)

  // Volume per muscle group across all history.
  const muscleVol = {}
  history.forEach((h) =>
    h.exercises?.forEach((ex) => {
      const v = convert(ex.volume, h.unit || 'kg', unit)
      muscleVol[ex.muscle] = (muscleVol[ex.muscle] || 0) + v
    })
  )
  const muscleRows = Object.entries(muscleVol).sort((a, b) => b[1] - a[1])
  const maxMuscle = Math.max(...muscleRows.map(([, v]) => v), 1)

  const best = history.reduce((b, h) => {
    const v = convert(h.volume, h.unit || 'kg', unit)
    return v > b.v ? { v, day: h.day, date: h.date } : b
  }, { v: 0, day: '', date: null })

  const stats = [
    { k: fmt(history.length), v: 'Workouts' },
    { k: `${fmt(totalVolume)} ${unit}`, v: 'Total volume' },
    { k: fmt(totalSets), v: 'Total sets' },
    { k: `${streak} 🔥`, v: 'Training streak' },
  ]

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">Your numbers</p>
        <h1>Progress</h1>
        <p className="section-sub">
          Every finished workout, turned into stats. Keep your volume trending up — that's
          progressive overload, the #1 driver of growth.
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid section-sm" style={{ paddingBottom: 24 }}>
        {stats.map((s) => (
          <div className="card stat-card" key={s.v}>
            <div className="stat-k">{s.k}</div>
            <div className="stat-v">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Recent sessions bar chart */}
      <div className="card" style={{ padding: 24, marginBottom: 22 }}>
        <div className="card-head">
          <h3>Recent sessions</h3>
          <span className="muted">This week: <strong style={{ color: 'var(--accent-soft)' }}>{fmt(weekVolume)} {unit}</strong></span>
        </div>
        <div className="bar-chart">
          {recent.map((h) => {
            const v = convert(h.volume, h.unit || 'kg', unit)
            return (
              <div className="vbar-col" key={h.id} title={`${h.day} — ${fmt(v)} ${unit}`}>
                <div className="vbar-track">
                  <div className="vbar-fill" style={{ height: `${(v / maxVol) * 100}%` }} />
                </div>
                <div className="vbar-label">{dayShortName(h.day).slice(0, 6)}</div>
              </div>
            )
          })}
        </div>
        {best.date && (
          <p className="muted" style={{ marginTop: 14, fontSize: '0.84rem' }}>
            🏆 Best session: <strong style={{ color: 'var(--text)' }}>{dayShortName(best.day)}</strong> — {fmt(best.v)} {unit}
            {' '}on {new Date(best.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        )}
      </div>

      {/* Volume by muscle */}
      <div className="card" style={{ padding: 24 }}>
        <div className="card-head">
          <h3>Volume by muscle</h3>
          <span className="muted">all-time</span>
        </div>
        {muscleRows.map(([muscle, v]) => (
          <div className="mvol-row" key={muscle}>
            <div className="mvol-name">{muscle}</div>
            <div className="mvol-track">
              <div
                className="mvol-fill"
                style={{ width: `${(v / maxMuscle) * 100}%`, background: MUSCLE_COLOR[muscle] || 'var(--accent)' }}
              />
            </div>
            <div className="mvol-val">{fmt(v)} {unit}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
