// Static admin credentials + a browser-session flag. No registration, no
// third-party auth by design (see Login.jsx). NOTE: this is a UI gate for the
// panel only — the admin API has its own auth seam (ADMIN_AUTH_ENABLED) for
// when the API faces the internet.
const ADMIN_EMAIL = 'admin@dairyside.in'
const ADMIN_PASSWORD = 'DairySide@2026'

const SESSION_KEY = 'ds_admin_session'

export function login(email, password) {
  const ok =
    String(email).trim().toLowerCase() === ADMIN_EMAIL &&
    String(password) === ADMIN_PASSWORD
  if (ok) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: ADMIN_EMAIL, at: Date.now() }))
  }
  return ok
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function isAuthed() {
  try {
    return Boolean(JSON.parse(sessionStorage.getItem(SESSION_KEY))?.email)
  } catch {
    return false
  }
}

export function currentAdmin() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY))
  } catch {
    return null
  }
}
