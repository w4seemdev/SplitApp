import { useState } from 'react'
import { MUSCLE_GROUPS } from '../data/exercises.js'

export default function Exercises() {
  // null = overview grid of all muscle groups; otherwise the selected group id.
  const [selected, setSelected] = useState(null)
  const group = MUSCLE_GROUPS.find((m) => m.id === selected)

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

      {/* Filter chips */}
      <div className="chips" style={{ marginTop: 30 }}>
        <button
          className={'chip' + (selected === null ? ' active' : '')}
          onClick={() => setSelected(null)}
        >
          All Groups
        </button>
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m.id}
            className={'chip' + (selected === m.id ? ' active' : '')}
            onClick={() => setSelected(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Overview: cards for every muscle group */}
      {!group && (
        <div className="grid grid-3 section-sm" style={{ paddingTop: 0 }}>
          {MUSCLE_GROUPS.map((m) => (
            <div className="card muscle-card" key={m.id} onClick={() => setSelected(m.id)}>
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
      {group && (
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
