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
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setSecs((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          beep()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  function start(d) {
    setDuration(d)
    setSecs(d)
    setRunning(true)
  }
  function toggle() {
    if (secs === 0) start(duration)
    else setRunning((r) => !r)
  }
  function reset() {
    setRunning(false)
    setSecs(0)
  }

  const pct = duration ? ((duration - secs) / duration) * 100 : 0
  const done = secs === 0 && !running

  return (
    <div className={'rest-timer' + (running ? ' active' : '')}>
      <div className="rt-top">
        <span className="rt-label">⏱ REST</span>
        <span className="rt-time">{fmt(secs)}</span>
      </div>
      <div className="rt-track">
        <div className="rt-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="rt-presets">
        {PRESETS.map((d) => (
          <button
            key={d}
            className={'rt-preset' + (duration === d ? ' sel' : '')}
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
        <button className="rt-btn" onClick={reset}>Reset</button>
      </div>
    </div>
  )
}
