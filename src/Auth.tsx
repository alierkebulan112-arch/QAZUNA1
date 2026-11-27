import { useState } from 'react'
import type { Dict } from './data'

export type User = { name: string; email: string }
type Stored = User & { hash: string }

const USERS_KEY = 'qazyna_users'
const SESSION_KEY = 'qazyna_session'

const readUsers = (): Stored[] => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

async function sha(text: string) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return btoa(unescape(encodeURIComponent(text)))
  }
}

export function loadSession(): User | null {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
export function saveSession(user: User | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  } catch { /* ignore */ }
}

export default function Auth({ mode, t, onDone }: { mode: 'login' | 'register'; t: Dict; onDone: (u: User) => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const isRegister = mode === 'register'

  const submit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    const mail = email.trim().toLowerCase()
    if (!mail || !password || (isRegister && (!name.trim() || !password2))) return setError(t.errFill)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return setError(t.errEmail)
    if (isRegister && password.length < 6) return setError(t.errPass)
    if (isRegister && password !== password2) return setError(t.errMatch)
    setBusy(true)
    const hash = await sha(password)
    const users = readUsers()
    if (isRegister) {
      if (users.some((u) => u.email === mail)) { setBusy(false); return setError(t.errExists) }
      const user = { name: name.trim(), email: mail }
      try { localStorage.setItem(USERS_KEY, JSON.stringify([...users, { ...user, hash }])) } catch { /* ignore */ }
      saveSession(user)
      onDone(user)
    } else {
      const found = users.find((u) => u.email === mail && u.hash === hash)
      if (!found) { setBusy(false); return setError(t.errWrong) }
      const user = { name: found.name, email: found.email }
      saveSession(user)
      onDone(user)
    }
  }

  return (
    <main className="auth-page">
      <div className="yurt-bg" />
      <div className="atmosphere" />
      <a className="brand auth-brand" href="#collection">
        <span className="brand-mark">Q</span>
        <span>QAZYNA<small>Ұлттық мұра</small></span>
      </a>
      <form className="auth-card" onSubmit={submit} noValidate>
        <p className="eyebrow">QAZYNA · {t.welcome.toUpperCase()}</p>
        <h2>{isRegister ? t.authRegister : t.authLogin}</h2>
        {isRegister && (
          <label>{t.name}<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
        )}
        <label>{t.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        <label>{t.password}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isRegister ? 'new-password' : 'current-password'} /></label>
        {isRegister && (
          <label>{t.password2}<input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} autoComplete="new-password" /></label>
        )}
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-btn" type="submit" disabled={busy}>{isRegister ? t.authRegister : t.authLogin}</button>
        <p className="auth-switch">
          {isRegister ? t.haveAccount : t.noAccount}{' '}
          <a href={isRegister ? '#/login' : '#/register'}>{isRegister ? t.authLogin : t.authRegister}</a>
        </p>
        <p className="auth-note">{t.authNote}</p>
        <a className="auth-back" href="#collection">← {t.back}</a>
      </form>
    </main>
  )
}
