import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const links = [
  { to: '/splits', label: 'Splits' },
  { to: '/plan', label: 'My Plan' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/progress', label: 'Progress' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="nav">
      <div className="container nav-inner">
        <NavLink to="/" className="brand">
          <img src="/dumbbell.svg" alt="" />
          Split<span>App</span>
        </NavLink>

        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.end}
                className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-auth">
          <ThemeToggle />
          {user ? (
            <>
              <NavLink to="/settings" className="nav-user" title="Account & settings">
                Hi, {user.name.split(' ')[0]} ⚙
              </NavLink>
              <button className="btn-ghost btn-sm" onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary btn-sm">Log In</NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
