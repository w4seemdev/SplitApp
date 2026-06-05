export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong style={{ color: 'var(--text)' }}>IRONPATH</strong> — train with a plan.
        </div>
        <div>Built on evidence-based hypertrophy research · {new Date().getFullYear()}</div>
      </div>
    </footer>
  )
}
