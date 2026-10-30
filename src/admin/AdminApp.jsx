import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, ImageIcon, KeyRound, LayoutDashboard, LogOut, Mail, Menu, X } from 'lucide-react'
import * as defaults from '../data'
import SectionEditor from './SectionEditor'
import { Account, Dashboard, Media, Messages } from './pages'
import { sections } from './sections'
import { api } from './api'
import './admin.css'

const pageFromHash = () => window.location.hash.slice(1) || 'dashboard'

function LoginScreen({ onDone }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { email } = await api('/login', { method: 'POST', body: form })
      onDone(email)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="adm-auth">
      <form className="adm-auth-box" onSubmit={submit}>
        <img src="/images/logo-baari.png" alt="Logo BAARI" />
        <h1>Administration BAARI</h1>
        <p>Connectez-vous pour gérer le site.</p>
        {error && <p className="adm-alert error" role="alert">{error}</p>}
        <label className="adm-field">
          <span>E-mail</span>
          <input type="email" name="email" autoComplete="username" value={form.email} onChange={update} required autoFocus />
        </label>
        <label className="adm-field">
          <span>Mot de passe</span>
          <input type="password" name="password" autoComplete="current-password" value={form.password} onChange={update} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Patientez…' : 'Se connecter'}
        </button>
        <a href="/" className="adm-back">Retour au site</a>
      </form>
    </main>
  )
}

function NavButton({ id, label, Icon, page, go, badge }) {
  return (
    <button type="button" className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => go(id)}>
      <Icon size={19} /> <span>{label}</span>
      {badge > 0 && <em>{badge}</em>}
    </button>
  )
}

function Workspace({ email, onLogout }) {
  const [page, setPage] = useState(pageFromHash)
  const [content, setContent] = useState(null)
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [error, setError] = useState('')
  const dirty = useRef(false)

  const setDirty = useCallback((value) => {
    dirty.current = value
  }, [])

  useEffect(() => {
    fetch('/api/content')
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setContent({ ...defaults, ...data }))
      .catch(() => setError('Impossible de charger le contenu. Le serveur est-il démarré ?'))
    api('/messages').then((m) => setUnread(m.filter((x) => !x.lu).length)).catch(() => {})
  }, [])

  useEffect(() => {
    const warn = (e) => {
      if (dirty.current) e.preventDefault()
    }
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('beforeunload', warn)
    window.addEventListener('hashchange', onHash)
    return () => {
      window.removeEventListener('beforeunload', warn)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  const go = (id) => {
    if (id === page) return setMenuOpen(false)
    if (dirty.current && !window.confirm('Des modifications ne sont pas publiées. Quitter cette page ?')) return
    dirty.current = false
    window.location.hash = id
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }

  const logout = async () => {
    if (dirty.current && !window.confirm('Des modifications ne sont pas publiées. Se déconnecter ?')) return
    dirty.current = false
    await api('/logout', { method: 'POST' }).catch(() => {})
    onLogout()
  }

  const onSaved = useCallback((key, value) => setContent((c) => ({ ...c, [key]: value })), [])
  const section = sections.find((s) => s.key === page)

  return (
    <div className="adm-shell">
      <aside className={`adm-sidebar ${menuOpen ? 'open' : ''}`}>
        <a className="adm-brand" href="/">
          <img src="/images/logo-baari.png" alt="" />
          <span><strong>BAARI</strong><em>Administration</em></span>
        </a>
        <nav aria-label="Administration">
          <NavButton id="dashboard" label="Tableau de bord" Icon={LayoutDashboard} page={page} go={go} />
          <NavButton id="messages" label="Messages" Icon={Mail} page={page} go={go} badge={unread} />
          <p>Contenu du site</p>
          {sections.map((s) => <NavButton key={s.key} id={s.key} label={s.label} Icon={s.icon} page={page} go={go} />)}
          <p>Gestion</p>
          <NavButton id="media" label="Médiathèque" Icon={ImageIcon} page={page} go={go} />
          <NavButton id="account" label="Mon compte" Icon={KeyRound} page={page} go={go} />
        </nav>
      </aside>
      {menuOpen && <button type="button" className="adm-scrim" aria-label="Fermer le menu" onClick={() => setMenuOpen(false)} />}

      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-icon-btn adm-burger" aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="adm-email">{email}</span>
          <a className="adm-btn ghost" href="/" target="_blank" rel="noreferrer"><ExternalLink size={17} /> Voir le site</a>
          <button type="button" className="adm-btn ghost" onClick={logout}><LogOut size={17} /> Déconnexion</button>
        </header>
        <main className="adm-content">
          {error && <p className="adm-alert error">{error}</p>}
          {content && (
            <>
              {page === 'dashboard' && <Dashboard content={content} go={go} unread={unread} onUnread={setUnread} />}
              {page === 'messages' && <Messages onUnread={setUnread} />}
              {page === 'media' && <Media />}
              {page === 'account' && <Account email={email} />}
              {section && (
                <SectionEditor key={section.key} section={section} saved={content[section.key]} onSaved={onSaved} onDirtyChange={setDirty} />
              )}
              {!section && !['dashboard', 'messages', 'media', 'account'].includes(page) && (
                <p className="adm-alert error">Page introuvable.</p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default function AdminApp() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api('/status').then(setStatus).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    document.title = 'Administration – BAARI'
    load()
    window.addEventListener('baari:session-expired', load)
    return () => window.removeEventListener('baari:session-expired', load)
  }, [load])

  if (error) return <main className="adm-auth"><p className="adm-alert error">{error}</p></main>
  if (!status) return <div className="page-loader" />
  if (!status.email) return <LoginScreen onDone={(email) => setStatus({ email })} />
  return <Workspace email={status.email} onLogout={load} />
}
