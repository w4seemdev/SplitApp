import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useUserStorage } from '../hooks/useUserStorage.js'
import { STORE } from '../lib/program.js'
import { unitLabel } from '../lib/units.js'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [program, setProgram] = useUserStorage(STORE.program, null)
  const [currentDay, setCurrentDay] = useUserStorage(STORE.currentDay, 0)
  const [history, setHistory] = useUserStorage(STORE.history, [])
  const [settings, setSettings] = useUserStorage(STORE.settings, { unit: 'kg' })
  const [msg, setMsg] = useState('')

  const unit = unitLabel(settings?.unit)
  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2600) }

  function setUnit(u) {
    setSettings({ ...settings, unit: u })
    flash(`Units set to ${u === 'lb' ? 'pounds (lb)' : 'kilograms (kg)'}.`)
  }

  function exportData() {
    const data = { app: 'SplitApp', exportedAt: new Date().toISOString(), program, currentDay, history, settings }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `splitapp-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    flash('Backup downloaded ✓')
  }

  function importData(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (data.program !== undefined) setProgram(data.program)
        if (Array.isArray(data.history)) setHistory(data.history)
        if (typeof data.currentDay === 'number') setCurrentDay(data.currentDay)
        if (data.settings) setSettings(data.settings)
        flash('Data imported ✓')
      } catch {
        flash('Could not read that file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function clearAll() {
    if (confirm('Delete your program and all workout history? This cannot be undone.')) {
      setProgram(null)
      setCurrentDay(0)
      setHistory([])
      flash('All workout data cleared.')
    }
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <p className="eyebrow">Your account</p>
        <h1>Settings</h1>
      </div>

      <div className="section-sm" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Account */}
        <div className="card settings-card">
          <h3>Account</h3>
          <div className="setting-row">
            <span className="setting-label">Name</span>
            <span>{user?.name}</span>
          </div>
          <div className="setting-row">
            <span className="setting-label">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="setting-row">
            <span className="setting-label">Logged sessions</span>
            <span>{history.length}</span>
          </div>
        </div>

        {/* Units */}
        <div className="card settings-card">
          <h3>Units</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Choose the weight unit used across the tracker and progress.
          </p>
          <div className="seg">
            <button className={'seg-btn' + (unit === 'kg' ? ' on' : '')} onClick={() => setUnit('kg')}>
              Kilograms (kg)
            </button>
            <button className={'seg-btn' + (unit === 'lb' ? ' on' : '')} onClick={() => setUnit('lb')}>
              Pounds (lb)
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="card settings-card">
          <h3>Your data</h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Everything is stored in this browser. Export a backup, or move it to another device.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={exportData}>⬇ Export backup</button>
            <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
              ⬆ Import backup
              <input type="file" accept="application/json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Danger zone */}
        <div className="card settings-card danger-zone">
          <h3>Danger zone</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost danger" onClick={clearAll}>Clear all workout data</button>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </div>
        </div>
      </div>

      {msg && <div className="toast">{msg}</div>}
    </div>
  )
}
