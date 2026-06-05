import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMuscleGroup } from '../data/exercises.js'
import { useUserStorage } from '../hooks/useUserStorage.js'
import { STORE, dayShortName, findLastPerformance } from '../lib/program.js'
import { unitLabel } from '../lib/units.js'
import RestTimer from '../components/RestTimer.jsx'

const emptySet = () => ({ weight: '', reps: '' })

// Seed a logging sheet from a training day's selected exercises (3 sets each).
function buildWorkout(day) {
  if (!day || day.type === 'rest') return []
  return day.exercises.map((ex) => ({ ...ex, sets: [emptySet(), emptySet(), emptySet()] }))
}

// Reduce the in-progress workout to per-exercise logs of completed sets.
function summarize(workout) {
  return workout
    .map((ex) => {
      const done = ex.sets
        .filter((s) => parseFloat(s.weight) > 0 && parseInt(s.reps, 10) > 0)
        .map((s) => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps, 10) }))
      const volume = done.reduce((v, s) => v + s.weight * s.reps, 0)
      const top = done.reduce((b, s) => (!b || s.weight > b.weight ? s : b), null)
      return { name: ex.name, muscle: ex.muscle, sets: done, volume: Math.round(volume), top }
    })
    .filter((e) => e.sets.length > 0)
}

const muscleLine = (focus) =>
  focus.map((id) => getMuscleGroup(id)?.name).filter(Boolean).join(' · ')

export default function Tracker() {
  const [program] = useUserStorage(STORE.program, null)
  const [currentDay, setCurrentDay] = useUserStorage(STORE.currentDay, 0)
  const [history, setHistory] = useUserStorage(STORE.history, [])
  const [settings] = useUserStorage(STORE.settings, { unit: 'kg' })
  const unit = unitLabel(settings?.unit)
  const [workout, setWorkout] = useState([])
  const [justFinished, setJustFinished] = useState(null)

  const days = program?.days ?? []
  const safeIndex = days.length ? currentDay % days.length : 0
  const today = days[safeIndex]
  const nextIndex = days.length ? (safeIndex + 1) % days.length : 0
  const tomorrow = days[nextIndex]

  useEffect(() => {
    setWorkout(buildWorkout(today))
  }, [program, safeIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const update = (exIdx, setIdx, field, value) =>
    setWorkout((prev) => {
      const next = structuredClone(prev)
      next[exIdx].sets[setIdx][field] = value
      return next
    })
  const addSet = (exIdx) =>
    setWorkout((prev) => {
      const next = structuredClone(prev)
      next[exIdx].sets.push(emptySet())
      return next
    })
  const removeSet = (exIdx, setIdx) =>
    setWorkout((prev) => {
      const next = structuredClone(prev)
      if (next[exIdx].sets.length > 1) next[exIdx].sets.splice(setIdx, 1)
      return next
    })

  function advance(entry, restDone) {
    if (entry) setHistory([entry, ...history])
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
      alert('Log at least one set (weight and reps) before finishing 💪')
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
          {workout.map((ex, exIdx) => {
            const last = findLastPerformance(history, ex.name)
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
                    ↩ Last time: <strong>{last.top.weight}{last.unit} × {last.top.reps}</strong>
                    {' · '}{last.volume.toLocaleString()} {last.unit} total
                    <span className="ago"> ({new Date(last.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                  </div>
                )}

                <div className="set-row" style={{ color: 'var(--text-mute)', fontSize: '0.74rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  <span style={{ textAlign: 'center' }}>Set</span>
                  <span>Weight ({unit})</span>
                  <span>Reps</span>
                  <span></span>
                </div>

                {ex.sets.map((s, setIdx) => (
                  <div className="set-row" key={setIdx}>
                    <span className="set-no">{setIdx + 1}</span>
                    <input type="number" min="0" placeholder="0" value={s.weight}
                      onChange={(e) => update(exIdx, setIdx, 'weight', e.target.value)} />
                    <input type="number" min="0" placeholder="0" value={s.reps}
                      onChange={(e) => update(exIdx, setIdx, 'reps', e.target.value)} />
                    <button className="icon-btn" title="Remove set" onClick={() => removeSet(exIdx, setIdx)}>−</button>
                  </div>
                ))}
                <button className="add-set" onClick={() => addSet(exIdx)}>+ Add set</button>
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
            <button className="chip" onClick={() => { if (confirm('Clear all workout history?')) setHistory([]) }}>
              Clear history
            </button>
          </div>
          {history.map((h) => (
            <div className="history-item" key={h.id}>
              <div>
                <strong>{h.day}</strong>
                <div className="meta">
                  {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{h.split} · {h.sets} sets
                </div>
              </div>
              <div className="vol">{h.volume.toLocaleString()} {h.unit || 'kg'}</div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
