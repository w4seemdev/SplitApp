import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUserStorage } from '../hooks/useUserStorage.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { STORE, poolForDay, buildDefaultProgram, makeRestDay, dayShortName } from '../lib/program.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Plan() {
  usePageTitle('My Plan')
  const [program, setProgram] = useUserStorage(STORE.program, null)
  const [editingIdx, setEditingIdx] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [deletingIdx, setDeletingIdx] = useState(null)
  const [showReset, setShowReset] = useState(false)

  // ---------- No split chosen yet ----------
  if (!program) {
    return (
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Make it yours</p>
          <h1>My Plan</h1>
        </div>
        <div className="empty section-sm">
          <div className="big">📋</div>
          <h3 style={{ marginBottom: 10 }}>Choose a split first</h3>
          <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
            Pick a training split, then come back here to choose exactly which exercises
            you want on each day.
          </p>
          <Link to="/splits" className="btn btn-primary">Choose a Split →</Link>
        </div>
      </div>
    )
  }

  const isSelected = (dayIdx, name) =>
    program.days[dayIdx].exercises.some((e) => e.name === name)

  function mutate(fn) {
    setProgram((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
  }

  const toggle = (dayIdx, exercise) =>
    mutate((p) => {
      const list = p.days[dayIdx].exercises
      const at = list.findIndex((e) => e.name === exercise.name)
      if (at >= 0) list.splice(at, 1)
      else list.push(exercise)
    })

  const moveDay = (i, dir) =>
    mutate((p) => {
      const j = i + dir
      if (j < 0 || j >= p.days.length) return
      ;[p.days[i], p.days[j]] = [p.days[j], p.days[i]]
    })

  const confirmDeleteDay = () => {
    mutate((p) => p.days.splice(deletingIdx, 1))
    setDeletingIdx(null)
  }

  const addRestDay = () => mutate((p) => p.days.push(makeRestDay()))

  function startRename(i) {
    setEditingIdx(i)
    setEditValue(program.days[i].name)
  }
  function saveRename() {
    const name = editValue.trim()
    if (name) mutate((p) => { p.days[editingIdx].name = name })
    setEditingIdx(null)
  }

  function confirmReset() {
    setProgram(buildDefaultProgram(program.splitId))
    setShowReset(false)
  }

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">{program.splitName}</p>
        <h1>My Plan</h1>
        <p className="section-sub">
          Build each day the way you like to train: tap exercises to add or remove them, rename or
          reorder days, and drop in rest days. This is exactly what the tracker will walk you through.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <Link to="/tracker" className="btn btn-primary">Start Training →</Link>
          <button className="btn btn-ghost" onClick={addRestDay}>+ Add Rest Day</button>
          <Link to="/splits" className="btn btn-ghost">Change Split</Link>
          <button className="btn btn-ghost" onClick={() => setShowReset(true)}>Reset to Defaults</button>
        </div>
      </div>

      <div className="section-sm">
        {program.days.map((day, dayIdx) => {
          const isRest = day.type === 'rest'
          return (
            <div className={'card plan-day' + (isRest ? ' rest' : '')} key={dayIdx}>
              <div className="day-title">
                {editingIdx === dayIdx ? (
                  <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={editValue}
                      aria-label="Day name"
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                      autoFocus
                      style={{ flex: 1, minWidth: 160 }}
                    />
                    <button className="btn-primary btn-sm" onClick={saveRename}>Save</button>
                    <button className="btn-ghost btn-sm" onClick={() => setEditingIdx(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <h3>{isRest ? '😴 ' : ''}{day.name}</h3>
                    <div className="day-tools">
                      <button className="tool" title="Move up" aria-label={`Move ${day.name} up`} onClick={() => moveDay(dayIdx, -1)} disabled={dayIdx === 0}>↑</button>
                      <button className="tool" title="Move down" aria-label={`Move ${day.name} down`} onClick={() => moveDay(dayIdx, 1)} disabled={dayIdx === program.days.length - 1}>↓</button>
                      <button className="tool" title="Rename" aria-label={`Rename ${day.name}`} onClick={() => startRename(dayIdx)}>✏</button>
                      <button
                        className="tool danger"
                        title={program.days.length <= 1 ? 'Keep at least one day in your week' : 'Delete day'}
                        aria-label={`Delete ${day.name}`}
                        onClick={() => setDeletingIdx(dayIdx)}
                        disabled={program.days.length <= 1}
                      >
                        ✕
                      </button>
                    </div>
                  </>
                )}
              </div>

              {isRest ? (
                <p className="hint" style={{ marginBottom: 0 }}>
                  Recovery day — muscle grows while you rest. No exercises to log; the tracker just
                  rolls you to the next session.
                </p>
              ) : (
                <>
                  <p className="hint">
                    {day.exercises.length} selected · tap to include or remove an exercise for {dayShortName(day.name)}.
                  </p>
                  {poolForDay(day.focus).map((block) => (
                    <div className="muscle-block" key={block.muscleId}>
                      <div className="muscle-subhead">
                        <span className="dot" style={{ background: block.color }} />
                        {block.muscle}
                      </div>
                      <div className="ex-toggle-wrap">
                        {block.exercises.map((ex) => {
                          const on = isSelected(dayIdx, ex.name)
                          return (
                            <button
                              key={ex.name}
                              className={'ex-toggle' + (on ? ' on' : '')}
                              aria-pressed={on}
                              onClick={() => toggle(dayIdx, ex)}
                            >
                              <span className="mark" aria-hidden="true">{on ? '✓' : '+'}</span>
                              {ex.name}
                              <span className="meta">{ex.target}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {day.exercises.length === 0 && (
                    <p style={{ color: 'var(--accent)', fontSize: '0.85rem', marginTop: 14 }}>
                      ⚠ No exercises selected for this day — add at least one.
                    </p>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={deletingIdx !== null}
        title="Delete day?"
        message={
          deletingIdx !== null
            ? `Remove "${program.days[deletingIdx].name}" from your week? Its exercise picks go with it.`
            : ''
        }
        confirmLabel="Delete Day"
        danger
        onConfirm={confirmDeleteDay}
        onCancel={() => setDeletingIdx(null)}
      />

      <ConfirmDialog
        open={showReset}
        title="Reset to defaults?"
        message="Every day goes back to the recommended default exercises. This removes rest days and renamed days."
        confirmLabel="Reset Plan"
        danger
        onConfirm={confirmReset}
        onCancel={() => setShowReset(false)}
      />
    </div>
  )
}
