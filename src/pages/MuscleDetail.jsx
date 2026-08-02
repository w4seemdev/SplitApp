import { Link, useParams } from 'react-router-dom'
import { MUSCLE_GROUPS } from '../data/exercises.js'
import { muscleSeo } from '../data/seo.js'
import { usePageTitle } from '../hooks/usePageTitle.js'
import NotFound from './NotFound.jsx'

// Landing page for one muscle group, e.g. /exercises/chest. The /exercises
// index filters client-side, so no single muscle has a URL of its own; this
// gives each one an indexable page with its exercises, volume, and splits.
export default function MuscleDetail() {
  const { muscleId } = useParams()
  const seo = muscleSeo(muscleId)
  usePageTitle(seo ? `${seo.group.name} Exercises` : 'Muscle Group Not Found')

  if (!seo) return <NotFound />
  const { group } = seo
  const others = MUSCLE_GROUPS.filter((m) => m.id !== group.id)

  return (
    <div className="container">
      <div className="page-head">
        <p className="eyebrow">
          <Link to="/exercises" style={{ color: 'inherit' }}>Exercise Library</Link> · {group.anatomy}
        </p>
        <h1>
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              borderRadius: 5,
              background: group.color,
              marginRight: 12,
            }}
          />
          {seo.heading}
        </h1>
        <p className="section-sub">{seo.intro}</p>
      </div>

      <section className="section-sm">
        <h2 className="section-title">
          Every {group.name.toLowerCase()} exercise, with sets and reps
        </h2>
        <div className="card" style={{ overflow: 'hidden', padding: 0, marginTop: 18 }}>
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

      <section className="section-sm">
        <h2 className="section-title">{seo.volumeHeading}</h2>
        <p style={{ color: 'var(--text-dim)', maxWidth: 720, marginTop: 12 }}>{seo.volumeBody}</p>
      </section>

      <section className="section-sm">
        <h2 className="section-title">Splits that train {group.name.toLowerCase()}</h2>
        <div className="grid grid-2" style={{ marginTop: 18 }}>
          {seo.sessions.map(({ split, days }) => (
            <Link className="card" key={split.id} to={`/splits/${split.id}`}>
              <div className="top">
                <div>
                  <h3>{split.name}</h3>
                  <span className="tagline">
                    {days}× per week · {split.daysPerWeek} days total
                  </span>
                </div>
                <span className="level-tag">{split.level}</span>
              </div>
              <p>{split.tagline}</p>
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
        <h2 className="section-title">Other muscle groups</h2>
        <div className="chips" style={{ marginTop: 14 }}>
          {others.map((m) => (
            <Link className="chip" key={m.id} to={`/exercises/${m.id}`}>
              {m.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
