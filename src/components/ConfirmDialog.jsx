import { useEffect, useRef } from 'react'

// Themed replacement for window.confirm(). Renders nothing when closed.
// Confirm is the first focusable control; Escape or a backdrop click cancels.
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)
  const restoreRef = useRef(null)

  // Move focus into the dialog on open, and give it back on close.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement
      confirmRef.current?.focus()
    } else if (restoreRef.current) {
      restoreRef.current.focus?.()
      restoreRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, width: '100%', padding: 26 }}
      >
        <h2 id="confirm-dialog-title" style={{ fontSize: '1.5rem', letterSpacing: 1, marginBottom: 10 }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: 22 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            ref={confirmRef}
            className="btn btn-primary"
            onClick={onConfirm}
            style={danger ? { background: 'var(--danger)', color: '#fff', boxShadow: 'none' } : undefined}
          >
            {confirmLabel}
          </button>
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
