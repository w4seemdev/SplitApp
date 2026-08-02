import { Link, useParams, useNavigate } from 'react-router-dom'
import { SPLITS } from '../data/splits.js'
import { splitSeo } from '../data/seo.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import { useUserStorage } from '../hooks/useUserStorage.js'
import { useAuth } from '../context/AuthContext.jsx'
import { STORE, buildDefaultProgram, exercisesForDay } from '../lib/program.js'
import NotFound from './NotFound.jsx'

// Landing page for a single training split, e.g. /splits/ppl. Exists so each
// split has its own indexable URL with the full routine on it — the /splits
// index selects between splits client-side and can't be linked to or ranked.
export default function SplitDetail() {
  const { splitId } = useParams()
  const seo = splitSeo(splitId)
  usePageTitle(seo ? `${seo.split.name} Split` : 'Split Not Found')

  const navigate = useNavigate()
  const { user } = useAuth()
  const [program, setProgram] = useUserStorage(STORE.program, null)
  const [, setCurrentDay] = useUserStorage(STORE.currentDay, 0)

  if (!seo) return <NotFound />
  const { split } = seo
  const isActive = program?.splitId === split.id

  // Sign-in first, then build the program. If a different program already
  // exists, send the lifter to /splits where switching is an explicit,
  // confirmed action rather than a silent overwrite.
  function start() {
    if (!user) {
      navigate('/login', { state: { from: `/splits/${split.id}` } })
      return
    }
    if (program && !isActive) {
      navigate('/splits')
      return
    }
    if (!program) {
      setProgram(buildDefaultProgram(split.id))
      setCurrentDay(0)
    }
    navigate('/plan')
  }

  const otherSplits = SPLITS.filter((s) => s.id !== split.id)

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">
          <Link to="/splits" style={{ color: 'inherit' }}>Training Splits</Link> · {split.level}
        </p>
        <h1>{seo.heading}</h1>
        <p className="section-sub">{seo.intro}</p>
      </div>

      <div className="split-meta" style={{ maxWidth: 560, marginTop: 24 }}>
        <div>
          <div className="k">{split.daysPerWeek}</div>
          <div className="v">DAYS / WEEK</div>
        </div>
        <div>
          <div className="k">{split.days.length}</div>
          <div className="v">SESSIONS</div>
        </div>
        <div>
          <div className="k" style={{ fontSize: '0.95rem', paddingTop: 6 }}>{split.frequency}</div>
          <div className="v">FREQUENCY</div>
        </div>
      </div>

      <div style={{ marginTop: 26 }}>
        <button className="btn btn-primary" onClick={start}>
          {isActive ? 'Pick My Exercises →' : `Start the ${split.name} Split`}
        </button>
      </div>

      <section className="section-sm">
        <h2 className="section-title">{seo.whoHeading}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
          {split.bestFor.map((b) => (
            <span className="pill" key={b}>✓ {b}</span>
          ))}
        </div>
      </section>

      <section className="section-sm">
        <h2 className="section-title">The full {split.daysPerWeek}-day routine</h2>
        <div className="day-grid">
          {split.days.map((day, i) => (
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
      </section>

      <section className="section-sm">
        <h2 className="section-title">{seo.progressHeading}</h2>
        <p style={{ color: 'var(--text-dim)', maxWidth: 720, marginTop: 12 }}>{seo.progressBody}</p>
      </section>

      <section className="section-sm">
        <h2 className="section-title">Muscles this split trains</h2>
        <div className="chips" style={{ marginTop: 14 }}>
          {seo.muscles.map((m) => (
            <Link className="chip" key={m.id} to={`/exercises/${m.id}`}>
              {m.name} exercises
            </Link>
          ))}
        </div>
      </section>

      <section className="section-sm">
        <h2 className="section-title">Common questions</h2>
        {seo.faq.map((item) => (
          <div key={item.q} style={{ marginTop: 20, maxWidth: 720 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 6 }}>{item.q}</h3>
            <p style={{ color: 'var(--text-dim)' }}>{item.a}</p>
          </div>
        ))}
      </section>

      <section className="section-sm">
        <h2 className="section-title">Other splits</h2>
        <div className="chips" style={{ marginTop: 14 }}>
          {otherSplits.map((s) => (
            <Link className="chip" key={s.id} to={`/splits/${s.id}`}>
              {s.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
