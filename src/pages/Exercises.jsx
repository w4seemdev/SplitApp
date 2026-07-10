import { useState } from 'react'
import { MUSCLE_GROUPS, ALL_EXERCISES } from '../data/exercises.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Exercises() {
  usePageTitle('Exercise Library')
  // null = overview grid of all muscle groups; otherwise the selected group id.
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const group = MUSCLE_GROUPS.find((m) => m.id === selected)

  // A non-empty search takes over the page: match by name across every group,
  // narrowed by the active muscle chip if one is selected.
  const q = query.trim().toLowerCase()
  const results = q
    ? ALL_EXERCISES.filter(
        (ex) => ex.name.toLowerCase().includes(q) && (!selected || ex.muscleId === selected)
      )
    : null

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">Know what to train</p>
        <h1>Exercise Library</h1>
        <p className="section-sub">
          Every major muscle group with its anatomy and the best exercises for building it —
          including recommended sets and reps for hypertrophy.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginTop: 30, marginBottom: 18, maxWidth: 420 }}>
        <label
          htmlFor="exercise-search"
          style={{ display: 'block', color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 6 }}
        >
          Search exercises
        </label>
        <input
          id="exercise-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Bench Press, Curl, Squat…"
          style={{ width: '100%' }}
        />
      </div>

      {/* Filter chips */}
      <div className="chips">
        <button
          className={'chip' + (selected === null ? ' active' : '')}
          aria-pressed={selected === null}
          onClick={() => setSelected(null)}
        >
          All Groups
        </button>
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m.id}
            className={'chip' + (selected === m.id ? ' active' : '')}
            aria-pressed={selected === m.id}
            onClick={() => setSelected(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Search results across every group */}
      {results && (
        <section className="section-sm" style={{ paddingTop: 0 }}>
          {results.length > 0 ? (
            <>
              <p style={{ color: 'var(--text-dim)', marginBottom: 16 }}>
                {results.length} exercise{results.length === 1 ? '' : 's'} matching “{query.trim()}”
              </p>
              <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
                <table className="ex-table">
                  <thead>
                    <tr>
                      <th>Exercise</th>
                      <th>Muscle</th>
                      <th>Type</th>
                      <th>Equipment</th>
                      <th>Sets</th>
                      <th>Reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((ex) => (
                      <tr key={ex.muscleId + ex.name}>
                        <td style={{ fontWeight: 600 }}>{ex.name}</td>
                        <td>
                          <span
                            aria-hidden="true"
                            style={{
                              display: 'inline-block',
                              width: 9,
                              height: 9,
                              borderRadius: 3,
                              background: ex.color,
                              marginRight: 8,
                            }}
                          />
                          {ex.muscle}
                        </td>
                        <td><span className={'type-tag type-' + ex.type}>{ex.type}</span></td>
                        <td style={{ color: 'var(--text-dim)' }}>{ex.equipment}</td>
                        <td>{ex.sets}</td>
                        <td>{ex.reps}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty">
              <div className="big" aria-hidden="true">🔍</div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>No exercises match “{query.trim()}”</h2>
              <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
                Try a shorter name{selected ? ', or search across all muscle groups' : ''}.
              </p>
              <button className="btn btn-ghost" onClick={() => setQuery('')}>Clear Search</button>
            </div>
          )}
        </section>
      )}

      {/* Overview: cards for every muscle group */}
      {!results && !group && (
        <div className="grid grid-3 section-sm" style={{ paddingTop: 0 }}>
          {MUSCLE_GROUPS.map((m) => (
            <div
              className="card muscle-card"
              key={m.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelected(m.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(m.id)
                }
              }}
            >
              <div className="bar" style={{ background: m.color }} />
              <div className="body">
                <h3>{m.name}</h3>
                <div className="anat">{m.anatomy}</div>
                <p>{m.blurb}</p>
                <span className="count">{m.exercises.length} exercises →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail: exercise table for the selected muscle group */}
      {!results && group && (
        <section className="section-sm" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <span style={{ width: 16, height: 16, borderRadius: 5, background: group.color }} />
            <h2 className="section-title" style={{ fontSize: '2rem' }}>{group.name}</h2>
          </div>
          <p className="anat" style={{ fontStyle: 'italic', color: 'var(--text-mute)', marginBottom: 4 }}>
            {group.anatomy}
          </p>
          <p style={{ color: 'var(--text-dim)', maxWidth: 640, marginBottom: 24 }}>{group.blurb}</p>

          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <table className="ex-table">
              <thead>
                <tr>
                  <th>Exercise</th>
                  <th>Type</th>
                  <th>Equipment</th>
                  <th>Sets</th>
                  <th>Reps</th>
                </tr>
              </thead>
              <tbody>
                {group.exercises.map((ex) => (
                  <tr key={ex.name}>
                    <td style={{ fontWeight: 600 }}>{ex.name}</td>
                    <td><span className={'type-tag type-' + ex.type}>{ex.type}</span></td>
                    <td style={{ color: 'var(--text-dim)' }}>{ex.equipment}</td>
                    <td>{ex.sets}</td>
                    <td>{ex.reps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
