import { useState, useEffect, useRef } from 'react'

const PRESETS = [60, 90, 120, 180]

// Short beep when the timer hits zero, using the Web Audio API (no asset needed).
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    // Browsers cap concurrent AudioContexts — release this one once done.
    osc.onended = () => { ctx.close().catch(() => {}) }
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {
    // audio not available — silently ignore
  }
}

function fmt(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function RestTimer() {
  const [secs, setSecs] = useState(0)
  const [running, setRunning] = useState(false)
  const [duration, setDuration] = useState(90)
  const [announce, setAnnounce] = useState('')
  // End timestamp, not tick-counting: mobile browsers throttle setInterval in
  // background/locked tabs, so remaining time is always derived from Date.now().
  const endAtRef = useRef(null)
  const announcedRef = useRef({})

  useEffect(() => {
    if (!running) return
    function tick() {
      const remaining = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000))
      setSecs(remaining)
      if (remaining <= 30 && remaining > 10 && !announcedRef.current[30]) {
        announcedRef.current[30] = true
        setAnnounce('30 seconds left')
      }
      if (remaining <= 10 && remaining > 0 && !announcedRef.current[10]) {
        announcedRef.current[10] = true
        setAnnounce('10 seconds left')
      }
      if (remaining === 0 && !announcedRef.current.done) {
        announcedRef.current.done = true
        setRunning(false)
        beep()
        setAnnounce('Rest complete')
      }
    }
    const id = setInterval(tick, 500)
    // Re-sync immediately when the tab becomes visible again.
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [running])

  function start(d) {
    setDuration(d)
    setSecs(d)
    endAtRef.current = Date.now() + d * 1000
    announcedRef.current = {}
    setAnnounce(`Rest timer started, ${d} seconds`)
    setRunning(true)
  }
  function toggle() {
    if (secs === 0) {
      start(duration)
    } else if (running) {
      setRunning(false)
    } else {
      endAtRef.current = Date.now() + secs * 1000
      setRunning(true)
    }
  }
  function reset() {
    setRunning(false)
    setSecs(0)
    announcedRef.current = {}
    setAnnounce('')
  }

  const pct = duration ? ((duration - secs) / duration) * 100 : 0
  const done = secs === 0 && !running

  return (
    <div className={'rest-timer' + (running ? ' active' : '')} role="region" aria-label="Rest timer">
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
      <div className="rt-top">
        <span className="rt-label"><span aria-hidden="true">⏱ </span>REST</span>
        <span className="rt-time" role="timer" aria-label={`Time remaining ${fmt(secs)}`}>{fmt(secs)}</span>
      </div>
      <div className="rt-track" aria-hidden="true">
        <div className="rt-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="rt-presets">
        {PRESETS.map((d) => (
          <button
            key={d}
            className={'rt-preset' + (duration === d ? ' sel' : '')}
            aria-pressed={duration === d}
            aria-label={`Start ${d} second rest`}
            onClick={() => start(d)}
          >
            {d}s
          </button>
        ))}
      </div>
      <div className="rt-controls">
        <button className="rt-btn primary" onClick={toggle}>
          {running ? 'Pause' : done ? 'Start' : 'Resume'}
        </button>
        <button className="rt-btn" onClick={reset} aria-label="Reset rest timer">Reset</button>
      </div>
    </div>
  )
}
