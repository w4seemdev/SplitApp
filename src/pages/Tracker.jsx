import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMuscleGroup } from '../data/exercises.js'
import { useUserStorage } from '../hooks/useUserStorage.js'
import usePageTitle from '../hooks/usePageTitle.js'
import { STORE, dayShortName, findLastPerformance } from '../lib/program.js'
import { unitLabel } from '../lib/units.js'
import RestTimer from '../components/RestTimer.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const emptySet = () => ({ weight: '', reps: '' })

// Resume an interrupted session for up to 12 hours; older drafts are stale.
const RESUME_WINDOW_MS = 12 * 60 * 60 * 1000

// Program exercises don't store equipment, so look it up in the library.
const isBodyweight = (ex) =>
  getMuscleGroup(ex.muscleId)?.exercises.find((e) => e.name === ex.name)?.equipment === 'Bodyweight'

// Targets like '3 × 30–60s' (Plank) are timed — the user logs seconds, not reps.
const isTimed = (ex) => /\d\s*s\b/.test(ex.target || '')

// Display a logged set: '60kg × 8', 'BW × 12', or 'BW 45s'.
const fmtSet = (s, unit) => {
  const w = s.weight > 0 ? `${s.weight}${unit}` : 'BW'
  return s.duration ? `${w} ${s.duration}s` : `${w} × ${s.reps}`
}

// Seed a logging sheet from a training day's selected exercises (3 sets each).
function buildWorkout(day) {
  if (!day || day.type === 'rest') return []
  return day.exercises.map((ex) => ({ ...ex, sets: [emptySet(), emptySet(), emptySet()] }))
}

// Reduce the in-progress workout to per-exercise logs of completed sets.
// Bodyweight exercises count with no weight entered; timed exercises store
// the entered number as { duration } seconds instead of reps.
function summarize(workout) {
  return workout
    .map((ex) => {
      const bodyweight = isBodyweight(ex)
      const timed = isTimed(ex)
      const done = ex.sets
        .filter((s) => parseInt(s.reps, 10) > 0 && (bodyweight || parseFloat(s.weight) > 0))
        .map((s) => {
          const weight = parseFloat(s.weight) > 0 ? parseFloat(s.weight) : 0
          const count = parseInt(s.reps, 10)
          return timed ? { weight, reps: 0, duration: count } : { weight, reps: count }
        })
      const volume = done.reduce((v, s) => v + s.weight * s.reps, 0)
      const top = done.reduce((b, s) => (!b || s.weight > b.weight ? s : b), null)
      return { name: ex.name, muscle: ex.muscle, sets: done, volume: Math.round(volume), top }
    })
    .filter((e) => e.sets.length > 0)
}

const muscleLine = (focus) =>
  focus.map((id) => getMuscleGroup(id)?.name).filter(Boolean).join(' · ')

export default function Tracker() {
  usePageTitle('Tracker')
  const [program] = useUserStorage(STORE.program, null)
  const [currentDay, setCurrentDay] = useUserStorage(STORE.currentDay, 0)
  const [history, setHistory] = useUserStorage(STORE.history, [])
  const [settings] = useUserStorage(STORE.settings, { unit: 'kg' })
  const [activeWorkout, setActiveWorkout] = useUserStorage('activeWorkout', null)
  const unit = unitLabel(settings?.unit)
  const unitWord = unit === 'lb' ? 'pounds' : 'kilograms'
  const [workout, setWorkout] = useState([])
  const [justFinished, setJustFinished] = useState(null)
  const [resumed, setResumed] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  const days = program?.days ?? []
  const safeIndex = days.length ? currentDay % days.length : 0
  const today = days[safeIndex]
  const nextIndex = days.length ? (safeIndex + 1) % days.length : 0
  const tomorrow = days[nextIndex]

  useEffect(() => {
    // Restore a recent in-progress sheet for this same day; otherwise start fresh.
    if (
      activeWorkout &&
      activeWorkout.dayIndex === safeIndex &&
      Date.now() - activeWorkout.startedAt < RESUME_WINDOW_MS &&
      Array.isArray(activeWorkout.sheet) &&
      activeWorkout.sheet.length > 0
    ) {
      setWorkout(activeWorkout.sheet)
      setResumed(true)
    } else {
      if (activeWorkout) setActiveWorkout(null)
      setWorkout(buildWorkout(today))
      setResumed(false)
    }
  }, [program, safeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mirror every edit to storage so a locked phone / evicted tab can resume.
  const saveDraft = (sheet) =>
    setActiveWorkout((prev) => ({
      dayIndex: safeIndex,
      startedAt: prev && prev.dayIndex === safeIndex ? prev.startedAt : Date.now(),
      sheet,
    }))

  const update = (exIdx, setIdx, field, value) => {
    const next = structuredClone(workout)
    next[exIdx].sets[setIdx][field] = value
    setWorkout(next)
    saveDraft(next)
  }
  const addSet = (exIdx) => {
    const next = structuredClone(workout)
    next[exIdx].sets.push(emptySet())
    setWorkout(next)
    saveDraft(next)
  }
  const removeSet = (exIdx, setIdx) => {
    if (workout[exIdx].sets.length <= 1) return
    const next = structuredClone(workout)
    next[exIdx].sets.splice(setIdx, 1)
    setWorkout(next)
    saveDraft(next)
  }

  function advance(entry, restDone) {
    if (entry) setHistory((prev) => [entry, ...prev])
    setActiveWorkout(null)
    setResumed(false)
    setJustFinished({
      done: today.name,
      rest: restDone,
      next: tomorrow.name,
      nextMuscles: tomorrow.type === 'rest' ? '' : muscleLine(tomorrow.focus),
      nextRest: tomorrow.type === 'rest',
      volume: entry?.volume ?? 0,
    })
    setCurrentDay(nextIndex)
  }

  function finishDay() {
    const exercises = summarize(workout)
    if (exercises.length === 0) {
      alert('Log at least one set before finishing 💪')
      return
    }
    const volume = exercises.reduce((v, e) => v + e.volume, 0)
    const sets = exercises.reduce((n, e) => n + e.sets.length, 0)
    advance(
      { id: Date.now(), date: new Date().toISOString(), split: program.splitName, day: today.name, volume, sets, exercises, unit },
      false
    )
  }

  const completeRest = () => advance(null, true)

  const liveVolume = summarize(workout).reduce((v, e) => v + e.volume, 0)
  const pendingDelete = history.find((h) => h.id === deleteId)

  // ---------- No program yet ----------
  if (!program) {
    return (
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Log your lifts</p>
          <h1>Tracker</h1>
        </div>
        <div className="empty section-sm">
          <div className="big">🏋️</div>
          <h3 style={{ marginBottom: 10 }}>No program yet</h3>
          <p style={{ maxWidth: 440, margin: '0 auto 22px' }}>
            Choose a split and pick your exercises first — then your day-by-day workout shows up here.
          </p>
          <Link to="/splits" className="btn btn-primary">Choose a Split →</Link>
        </div>
      </div>
    )
  }

  // ---------- Just finished a day ----------
  if (justFinished) {
    return (
      <div className="container">
        <div className="page-head">
          <p className="eyebrow">Nice work</p>
          <h1>{justFinished.rest ? 'Recovered' : 'Day Complete'}</h1>
        </div>
        <div className="complete-card section-sm">
          <div className="big">{justFinished.rest ? '😌' : '🔥'}</div>
          <h2>{justFinished.rest ? 'Rest complete!' : `${dayShortName(justFinished.done)} done!`}</h2>
          <p className="next-line">
            {!justFinished.rest && <>{justFinished.volume.toLocaleString()} {unit} of total volume logged.<br /></>}
            Tomorrow: <b>{justFinished.nextRest ? '😴 Rest Day' : dayShortName(justFinished.next)}</b>
            {justFinished.nextMuscles ? ` — ${justFinished.nextMuscles}` : ''}
          </p>
          <button className="btn btn-primary" onClick={() => setJustFinished(null)}>
            {justFinished.nextRest ? 'See Tomorrow →' : "See Tomorrow's Workout →"}
          </button>
          <div className="day-pips" style={{ justifyContent: 'center' }}>
            {days.map((d, i) => (
              <span key={i} className={'day-pip' + (i === nextIndex ? ' current' : '')}>
                {d.type === 'rest' ? '😴' : dayShortName(d.name)}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">{program.splitName} · log your lifts</p>
        <h1>Tracker</h1>
      </div>

      {/* Today banner */}
      <div className="today-banner section-sm" style={{ paddingTop: 22, paddingBottom: 22 }}>
        <div>
          <div className="lbl">TODAY'S SESSION</div>
          <h2>{today.type === 'rest' ? '😴 Rest Day' : today.name}</h2>
          <div className="muscles">{today.type === 'rest' ? 'Recovery — let those muscles grow' : muscleLine(today.focus)}</div>
        </div>
        {today.type !== 'rest' && (
          <div style={{ textAlign: 'right' }}>
            <span className="field-label">Live volume</span>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--accent)' }}>
              {liveVolume.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-mute)' }}>{unit}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rotation pips */}
      <div className="day-pips" style={{ marginBottom: 24 }}>
        {days.map((d, i) => (
          <span key={i} className={'day-pip' + (i === safeIndex ? ' current' : i < safeIndex ? ' done' : '')}>
            {i < safeIndex ? '✓ ' : ''}{d.type === 'rest' ? '😴 Rest' : dayShortName(d.name)}
          </span>
        ))}
      </div>

      {/* Rest day */}
      {today.type === 'rest' ? (
        <div className="empty">
          <div className="big">😴</div>
          <h3 style={{ marginBottom: 10 }}>Rest & recover</h3>
          <p style={{ maxWidth: 440, margin: '0 auto 22px' }}>
            Muscle is built during recovery, not just in the gym. Eat your protein, sleep well, and
            come back stronger. Up next: <strong style={{ color: 'var(--text)' }}>{dayShortName(tomorrow.name)}</strong>.
          </p>
          <button className="btn btn-primary" onClick={completeRest}>Done Resting — Next Day →</button>
        </div>
      ) : today.exercises.length === 0 ? (
        <div className="empty">
          <div className="big">🤔</div>
          <h3 style={{ marginBottom: 10 }}>No exercises picked for {dayShortName(today.name)}</h3>
          <p style={{ maxWidth: 420, margin: '0 auto 22px' }}>
            Head to My Plan to add exercises for this day — or skip to the next session.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/plan" className="btn btn-primary">Edit My Plan →</Link>
            <button className="btn btn-ghost" onClick={() => setCurrentDay(nextIndex)}>Skip to {dayShortName(tomorrow.name)} →</button>
          </div>
        </div>
      ) : (
        <>
          {resumed && (
            <div
              className="last-time"
              role="status"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}
            >
              <span>↩ Resumed your workout in progress</span>
              <button
                className="icon-btn"
                aria-label="Dismiss resumed-workout notice"
                onClick={() => setResumed(false)}
                style={{ width: 28, height: 28, fontSize: '0.95rem' }}
              >
                ×
              </button>
            </div>
          )}

          {workout.map((ex, exIdx) => {
            const last = findLastPerformance(history, ex.name)
            const bodyweight = isBodyweight(ex)
            const timed = isTimed(ex)
            return (
              <div className="card log-card" key={ex.name}>
                <div className="ex-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ex.color }} />
                    <h4>{ex.name}</h4>
                    <span className="pill">{ex.muscle}</span>
                  </div>
                  <span style={{ color: 'var(--text-mute)', fontSize: '0.82rem' }}>Target: {ex.target}</span>
                </div>

                {last?.top && (
                  <div className="last-time">
                    ↩ Last time: <strong>{fmtSet(last.top, last.unit)}</strong>
                    {last.volume > 0 && <>{' · '}{last.volume.toLocaleString()} {last.unit} total</>}
                    <span className="ago"> ({new Date(last.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                  </div>
                )}

                <div className="set-row" style={{ color: 'var(--text-mute)', fontSize: '0.74rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  <span style={{ textAlign: 'center' }}>Set</span>
                  <span>{bodyweight ? `+ Weight (${unit})` : `Weight (${unit})`}</span>
                  <span>{timed ? 'Seconds' : 'Reps'}</span>
                  <span></span>
                </div>

                {ex.sets.map((s, setIdx) => (
                  <div className="set-row" key={setIdx}>
                    <span className="set-no">{setIdx + 1}</span>
                    <input type="number" min="0" placeholder={bodyweight ? 'BW' : '0'} value={s.weight}
                      aria-label={`${ex.name}, set ${setIdx + 1}, ${bodyweight ? 'added weight' : 'weight'} in ${unitWord}`}
                      onChange={(e) => update(exIdx, setIdx, 'weight', e.target.value)} />
                    <input type="number" min="0" placeholder="0" value={s.reps}
                      aria-label={`${ex.name}, set ${setIdx + 1}, ${timed ? 'seconds' : 'reps'}`}
                      onChange={(e) => update(exIdx, setIdx, 'reps', e.target.value)} />
                    <button className="icon-btn" title="Remove set"
                      aria-label={`Remove set ${setIdx + 1} of ${ex.name}`}
                      onClick={() => removeSet(exIdx, setIdx)}>−</button>
                  </div>
                ))}
                <button className="add-set" aria-label={`Add set to ${ex.name}`} onClick={() => addSet(exIdx)}>+ Add set</button>
              </div>
            )
          })}

          <div className="next-up" style={{ marginBottom: 16 }}>
            <span className="arrow">UP NEXT →</span>
            <span>
              After today: <strong>{tomorrow.type === 'rest' ? '😴 Rest Day' : dayShortName(tomorrow.name)}</strong>
              {tomorrow.type !== 'rest' && ` (${muscleLine(tomorrow.focus)})`}
            </span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={finishDay}>
            Finish {dayShortName(today.name)} — Save &amp; Go to Tomorrow
          </button>

          <RestTimer />
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="section-sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>History</h2>
            <button className="chip" onClick={() => setConfirmClear(true)}>
              Clear history
            </button>
          </div>
          {history.map((h) => {
            const expanded = expandedId === h.id
            return (
              <div className="history-item" key={h.id} style={{ display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <button
                    aria-expanded={expanded}
                    aria-label={`${expanded ? 'Hide' : 'Show'} details for ${h.day}`}
                    onClick={() => setExpandedId(expanded ? null : h.id)}
                    style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'none', padding: 0, textAlign: 'left', color: 'inherit' }}
                  >
                    <span>
                      <strong>{h.day}</strong>
                      <span className="meta" style={{ display: 'block' }}>
                        {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {' · '}{h.split} · {h.sets} sets
                      </span>
                    </span>
                    <span className="vol">{h.volume.toLocaleString()} {h.unit || 'kg'}</span>
                  </button>
                  <button
                    className="icon-btn"
                    title="Delete workout"
                    aria-label={`Delete ${h.day} workout from ${new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    onClick={() => setDeleteId(h.id)}
                  >
                    🗑
                  </button>
                </div>
                {expanded && (
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    {h.exercises?.length ? (
                      h.exercises.map((ex) => (
                        <div key={ex.name} style={{ marginBottom: 8 }}>
                          <strong style={{ fontSize: '0.9rem' }}>{ex.name}</strong>
                          <div className="meta">{ex.sets.map((s) => fmtSet(s, h.unit || 'kg')).join(' · ')}</div>
                        </div>
                      ))
                    ) : (
                      <div className="meta">No per-exercise detail saved for this entry.</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Clear all history?"
        message="This permanently deletes every logged workout. There's no undo."
        confirmLabel="Clear history"
        danger
        onConfirm={() => { setHistory([]); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this workout?"
        message={pendingDelete ? `${pendingDelete.day} on ${new Date(pendingDelete.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} will be removed from your history.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => { setHistory((prev) => prev.filter((h) => h.id !== deleteId)); setDeleteId(null) }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
