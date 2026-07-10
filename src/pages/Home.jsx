import { Link } from 'react-router-dom'
import { SPLITS } from '../data/splits.js'
import { MUSCLE_GROUPS, ALL_EXERCISES } from '../data/exercises.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

// Little weekly-volume visual for the hero — illustrative "sets per week" bars.
const heroBars = [
  { name: 'Chest', pct: 82, color: '#e8485e' },
  { name: 'Back', pct: 90, color: '#3f8ae6' },
  { name: 'Shoulders', pct: 70, color: '#eda63b' },
  { name: 'Legs', pct: 95, color: '#e2549c' },
  { name: 'Arms', pct: 60, color: '#9a6cf0' },
]

const features = [
  {
    ic: '🎯',
    title: 'Science-Based Splits',
    text: 'Full Body, Upper/Lower, Push/Pull/Legs and Bro Split — each built to hit every muscle with the right frequency.',
  },
  {
    ic: '📚',
    title: 'Exercise Library',
    text: `Browse ${ALL_EXERCISES.length} exercises grouped by muscle, with recommended sets and reps for hypertrophy.`,
  },
  {
    ic: '📈',
    title: 'Track Every Set',
    text: 'Log weight and reps for each set. Your workouts and total volume are saved automatically.',
  },
  {
    ic: '🔁',
    title: 'Progressive Overload',
    text: 'See your volume add up over time — the #1 driver of muscle growth, made visible.',
  },
]

const principles = [
  { num: '10–20', label: 'Hard sets per muscle / week' },
  { num: '2×', label: 'Train each muscle per week' },
  { num: '6–12', label: 'Reps for hypertrophy' },
  { num: '1.6–2.2g', label: 'Protein per kg bodyweight' },
]

export default function Home() {
  usePageTitle('Home')
  return (
    <>
      {/* ---------------- HERO ---------------- */}
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Build muscle with a plan</p>
            <h1>
              Stop guessing.<br />
              Start <span className="accent">growing.</span>
            </h1>
            <p className="hero-lead">
              SplitApp turns the science of muscle growth into a simple system: pick a proven
              training split, follow it muscle-by-muscle, and track every set you lift.
            </p>
            <div className="hero-cta">
              <Link to="/splits" className="btn btn-primary">Choose Your Split →</Link>
              <Link to="/exercises" className="btn btn-ghost">Browse Exercises</Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="num">{SPLITS.length}</div>
                <div className="lbl">Proven splits</div>
              </div>
              <div className="hero-stat">
                <div className="num">{MUSCLE_GROUPS.length}</div>
                <div className="lbl">Muscle groups</div>
              </div>
              <div className="hero-stat">
                <div className="num">{ALL_EXERCISES.length}</div>
                <div className="lbl">Exercises</div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            {/* Illustrative chart, not real data — a heading here also broke the h1→h2 outline. */}
            <div
              aria-hidden="true"
              style={{
                fontFamily: 'var(--font-cond)',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: 'var(--text-dim)',
                letterSpacing: 3,
                marginBottom: 20,
              }}
            >
              WEEKLY VOLUME · SETS
            </div>
            {heroBars.map((b) => (
              <div className="muscle-bar" key={b.name} aria-hidden="true">
                <div className="name">{b.name}</div>
                <div className="track">
                  <div className="fill" style={{ width: `${b.pct}%`, background: b.color }} />
                </div>
              </div>
            ))}
            <p style={{ color: 'var(--text-mute)', fontSize: '0.8rem', marginTop: '14px' }}>
              Research sweet spot: 10–20 hard sets per muscle, each week.
            </p>
          </div>
        </div>
      </header>

      {/* ---------------- FEATURES ---------------- */}
      <section className="section">
        <div className="container">
          <p className="eyebrow">Everything you need</p>
          <h2 className="section-title">One app, from plan to progress</h2>
          <div className="grid grid-4" style={{ marginTop: 40 }}>
            {features.map((f) => (
              <div className="card feature" key={f.title}>
                <div className="ic" aria-hidden="true">{f.ic}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRINCIPLES ---------------- */}
      <section className="section" style={{ background: 'var(--bg-soft)' }}>
        <div className="container">
          <p className="eyebrow">The science, distilled</p>
          <h2 className="section-title">The numbers that actually grow muscle</h2>
          <p className="section-sub">
            Muscle grows from mechanical tension, enough volume, and progressive overload —
            recovered by protein and sleep. Hit these targets consistently and you will grow.
          </p>
          <div className="grid grid-4" style={{ marginTop: 40 }}>
            {principles.map((p) => (
              <div className="card feature" key={p.label} style={{ textAlign: 'center' }}>
                <div className="num" style={{ fontFamily: 'var(--font-head)', fontSize: '2.4rem', color: 'var(--accent)' }}>
                  {p.num}
                </div>
                <p style={{ marginTop: 8 }}>{p.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Your next workout starts now</h2>
          <p className="section-sub" style={{ margin: '14px auto 28px' }}>
            Pick a split, open the tracker, and log your first set. It takes two minutes.
          </p>
          <Link to="/tracker" className="btn btn-primary">Open the Tracker →</Link>
        </div>
      </section>
    </>
  )
}
