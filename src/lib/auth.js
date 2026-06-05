// Browser-based account storage. NOTE: this is demo-grade auth — accounts live
// in localStorage on this device. Passwords are hashed (SHA-256) so they're not
// stored in plain text, but real apps need a server. Easy to swap for a backend.

const USERS_KEY = 'ironpath:users'
const SESSION_KEY = 'ironpath:session'

function read(key, fallback) {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export function getUsers() {
  return read(USERS_KEY, [])
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

// SHA-256 hash of the password (+ a salt) using the Web Crypto API.
export async function hashPassword(password) {
  const data = new TextEncoder().encode(`${password}::ironpath-v1`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Strip the password hash before exposing a user to the app.
function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email }
}

export async function signupUser(name, email, password) {
  const users = getUsers()
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('An account with this email already exists.')
  }
  const user = {
    id: 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    email: email.trim(),
    passwordHash: await hashPassword(password),
    createdAt: Date.now(),
  }
  saveUsers([...users, user])
  return publicUser(user)
}

export async function loginUser(email, password) {
  const user = getUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) throw new Error('No account found with that email.')
  const hash = await hashPassword(password)
  if (hash !== user.passwordHash) throw new Error('Incorrect password.')
  return publicUser(user)
}

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}
export function getSession() {
  return read(SESSION_KEY, null)
}
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}
