import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SPLITS } from '../data/splits.js'
import { getMuscleGroup } from '../data/exercises.js'
import { useUserStorage } from '../hooks/useUserStorage.js'
import { useAuth } from '../context/AuthContext.jsx'
import { STORE, buildDefaultProgram } from '../lib/program.js'

// Pull the top exercises for the muscle groups a day targets (max 5 shown).
function exercisesForDay(focusIds, limit = 5) {
  const out = []
  focusIds.forEach((id) => {
    const group = getMuscleGroup(id)
    if (group) {
      // take the first 2 from each group so the day stays varied
      group.exercises.slice(0, 2).forEach((ex) => out.push({ ...ex, color: group.color }))
    }
  })
  return out.slice(0, limit)
}

export default function Splits() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [openId, setOpenId] = useState(SPLITS[0].id)
  const [program, setProgram] = useUserStorage(STORE.program, null)
  const [, setCurrentDay] = useUserStorage(STORE.currentDay, 0)

  const activeSplit = program?.splitId ?? null
  const open = SPLITS.find((s) => s.id === openId)

  // Choosing a split builds a fresh default program and resets the day rotation.
  // Requires an account so the program is saved under the user.
  function chooseSplit(splitId) {
    if (!user) {
      navigate('/login', { state: { from: '/splits' } })
      return
    }
    setProgram(buildDefaultProgram(splitId))
    setCurrentDay(0)
  }

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">Find your program</p>
        <h1>Training Splits</h1>
        <p className="section-sub">
          A split is how you divide muscle groups across your week. The best one is the one you'll
          do consistently — aim to train each muscle about twice a week.
        </p>
      </div>

      {/* Split selector cards */}
      <div className="grid grid-2 section-sm">
        {SPLITS.map((s) => (
          <div
            key={s.id}
            className="card split-card"
            onClick={() => setOpenId(s.id)}
            style={openId === s.id ? { borderColor: 'var(--accent)' } : undefined}
          >
            <div className="top">
              <div>
                <h3>{s.name}</h3>
                <span className="tagline">{s.tagline}</span>
              </div>
              <span className="level-tag">{s.level}</span>
            </div>
            <p>{s.description}</p>
            <div className="split-meta">
              <div>
                <div className="k">{s.daysPerWeek}</div>
                <div className="v">DAYS / WEEK</div>
              </div>
              <div>
                <div className="k">{s.days.length}</div>
                <div className="v">SESSIONS</div>
              </div>
              <div>
                <div className="k" style={{ fontSize: '0.95rem', paddingTop: 6 }}>{s.frequency}</div>
                <div className="v">FREQUENCY</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail of the selected split */}
      {open && (
        <section className="section-sm" style={{ paddingTop: 10 }}>
          <div className="tracker-head">
            <div>
              <p className="eyebrow">{open.frequency}</p>
              <h2 className="section-title">{open.name} — the breakdown</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
                {open.bestFor.map((b) => (
                  <span className="pill" key={b}>✓ {b}</span>
                ))}
              </div>
            </div>
            {activeSplit === open.id ? (
              <button className="btn btn-primary" onClick={() => navigate('/plan')}>
                Pick My Exercises →
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => chooseSplit(open.id)}>
                Choose This Split
              </button>
            )}
          </div>

          <div className="day-grid">
            {open.days.map((day, i) => (
              <div className="day-card" key={i}>
                <div className="head">{day.name}</div>
                <ul>
                  {exercisesForDay(day.focus).map((ex, j) => (
                    <li className="day-ex" key={j}>
                      <span className="nm">
                        <span className="dot" style={{ background: ex.color }} />
                        {ex.name}
                      </span>
                      <span className="reps">{ex.sets} × {ex.reps}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {activeSplit === open.id && (
            <p style={{ marginTop: 20, color: 'var(--text-dim)' }}>
              Nice — <strong style={{ color: 'var(--accent)' }}>{open.name}</strong> is now your program.{' '}
              Next, <Link to="/plan" style={{ color: 'var(--accent)' }}>pick your exercises for each day →</Link>
            </p>
          )}
        </section>
      )}
    </div>
  )
}
