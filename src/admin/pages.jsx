import { useEffect, useState } from 'react'
import { Copy, ImageIcon, Inbox, Mail, MailOpen, Trash2 } from 'lucide-react'
import { UploadButton } from './ImageField'
import { api } from './api'

const formatDate = (d) => new Date(d).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

function PageHead({ title, hint, children }) {
  return (
    <div className="adm-page-head">
      <div>
        <h1>{title}</h1>
        {hint && <p>{hint}</p>}
      </div>
      {children}
    </div>
  )
}

export function Dashboard({ content, go, unread, onUnread }) {
  const [messages, setMessages] = useState([])
  const [mediaCount, setMediaCount] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api('/messages'), api('/media')])
      .then(([m, media]) => {
        setMessages(m)
        setMediaCount(media.length)
        onUnread(m.filter((x) => !x.lu).length)
      })
      .catch((e) => setError(e.message))
  }, [onUnread])

  const tiles = [
    { label: 'Messages non lus', value: unread, page: 'messages', accent: true },
    { label: 'Messages reçus', value: messages.length, page: 'messages' },
    { label: 'Activités', value: content.activites.length, page: 'activites' },
    { label: 'Réalisations', value: content.realisations.length, page: 'realisations' },
    { label: 'Objectifs', value: content.objectifs.length, page: 'objectifs' },
    { label: 'Images envoyées', value: mediaCount, page: 'media' },
  ]

  return (
    <>
      <PageHead title="Tableau de bord" hint="Vue d'ensemble du site de l'Association BAARI." />
      {error && <p className="adm-alert error">{error}</p>}
      <div className="adm-tiles">
        {tiles.map((t) => (
          <button type="button" key={t.label} className={`adm-tile ${t.accent ? 'accent' : ''}`} onClick={() => go(t.page)}>
            <strong>{t.value}</strong>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <section className="adm-card">
        <h2>Derniers messages</h2>
        {messages.length === 0 && <p className="adm-muted">Aucun message pour le moment.</p>}
        <ul className="adm-recent">
          {messages.slice(0, 5).map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => go('messages')}>
                <strong className={m.lu ? '' : 'unread'}>{m.nom}</strong>
                <span>{m.sujet}</span>
                <time>{formatDate(m.created_at)}</time>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export function Messages({ onUnread }) {
  const [messages, setMessages] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/messages').then(setMessages).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (messages) onUnread(messages.filter((m) => !m.lu).length)
  }, [messages, onUnread])

  const setRead = async (m, lu) => {
    try {
      const updated = await api(`/messages/${m.id}`, { method: 'PATCH', body: { lu } })
      setMessages((list) => list.map((x) => (x.id === m.id ? updated : x)))
    } catch (e) {
      setError(e.message)
    }
  }

  const toggle = (m) => {
    setOpenId(openId === m.id ? null : m.id)
    if (!m.lu) setRead(m, true)
  }

  const remove = async (m) => {
    if (!window.confirm(`Supprimer définitivement le message de ${m.nom} ?`)) return
    try {
      await api(`/messages/${m.id}`, { method: 'DELETE' })
      setMessages((list) => list.filter((x) => x.id !== m.id))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <>
      <PageHead title="Messages" hint="Les messages envoyés depuis le formulaire de contact. Ils restent confidentiels." />
      {error && <p className="adm-alert error">{error}</p>}
      {messages?.length === 0 && (
        <div className="adm-card adm-empty"><Inbox size={34} /><p>Aucun message pour le moment.</p></div>
      )}
      <div className="adm-messages">
        {messages?.map((m) => (
          <article key={m.id} className={`adm-card adm-message ${m.lu ? '' : 'unread'}`}>
            <button type="button" className="adm-message-head" aria-expanded={openId === m.id} onClick={() => toggle(m)}>
              {m.lu ? <MailOpen size={19} /> : <Mail size={19} />}
              <strong>{m.nom}</strong>
              <span>{m.sujet}</span>
              <time>{formatDate(m.created_at)}</time>
            </button>
            {openId === m.id && (
              <div className="adm-message-body">
                <p className="adm-pre">{m.message}</p>
                <div className="adm-row">
                  <a className="adm-btn" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.sujet}`)}`}>
                    <Mail size={17} /> Répondre à {m.email}
                  </a>
                  <button type="button" className="adm-btn ghost" onClick={() => setRead(m, false)}>
                    <Mail size={17} /> Marquer non lu
                  </button>
                  <button type="button" className="adm-btn danger" onClick={() => remove(m)}>
                    <Trash2 size={17} /> Supprimer
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  )
}

export function Media() {
  const [media, setMedia] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    api('/media').then(setMedia).catch((e) => setNotice({ ok: false, text: e.message }))
  }, [])

  const remove = async (m) => {
    if (!window.confirm(`Supprimer « ${m.original_name} » ? Si elle est utilisée sur le site, elle n'y apparaîtra plus.`)) return
    try {
      await api(`/media/${m.id}`, { method: 'DELETE' })
      setMedia((list) => list.filter((x) => x.id !== m.id))
    } catch (e) {
      setNotice({ ok: false, text: e.message })
    }
  }

  const copy = async (m) => {
    await navigator.clipboard.writeText(m.url)
    setNotice({ ok: true, text: 'Adresse de l’image copiée.' })
  }

  return (
    <>
      <PageHead title="Médiathèque" hint="Images JPG, PNG ou WebP, 5 Mo maximum.">
        <UploadButton
          onUploaded={(m) => {
            setMedia((list) => [m, ...(list || [])])
            setNotice({ ok: true, text: 'Image ajoutée.' })
          }}
          onError={(text) => setNotice({ ok: false, text })}
        />
      </PageHead>
      {notice && <p className={`adm-alert ${notice.ok ? 'ok' : 'error'}`} role="status">{notice.text}</p>}
      {media?.length === 0 && (
        <div className="adm-card adm-empty"><ImageIcon size={34} /><p>Aucune image envoyée pour le moment.</p></div>
      )}
      <div className="adm-media-grid">
        {media?.map((m) => (
          <figure key={m.id} className="adm-media-item">
            <img src={m.url} alt={m.original_name} />
            <figcaption>{m.original_name}</figcaption>
            <div className="adm-row">
              <button type="button" className="adm-icon-btn" aria-label={`Copier l'adresse de ${m.original_name}`} onClick={() => copy(m)}>
                <Copy size={17} />
              </button>
              <button type="button" className="adm-icon-btn danger" aria-label={`Supprimer ${m.original_name}`} onClick={() => remove(m)}>
                <Trash2 size={17} />
              </button>
            </div>
          </figure>
        ))}
      </div>
    </>
  )
}

export function Account({ email }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [notice, setNotice] = useState(null)
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.next !== form.confirm) return setNotice({ ok: false, text: 'Les deux mots de passe ne correspondent pas.' })
    try {
      await api('/password', { method: 'PUT', body: { current: form.current, next: form.next } })
      setForm({ current: '', next: '', confirm: '' })
      setNotice({ ok: true, text: 'Mot de passe modifié.' })
    } catch (err) {
      setNotice({ ok: false, text: err.message })
    }
  }

  return (
    <>
      <PageHead title="Mon compte" hint={`Connecté avec ${email}.`} />
      <form className="adm-card adm-stack adm-narrow" onSubmit={submit}>
        <h2>Changer le mot de passe</h2>
        {notice && <p className={`adm-alert ${notice.ok ? 'ok' : 'error'}`} role="status">{notice.text}</p>}
        <label className="adm-field">
          <span>Mot de passe actuel</span>
          <input type="password" name="current" autoComplete="current-password" value={form.current} onChange={update} required />
        </label>
        <label className="adm-field">
          <span>Nouveau mot de passe (10 caractères minimum)</span>
          <input type="password" name="next" autoComplete="new-password" minLength={10} value={form.next} onChange={update} required />
        </label>
        <label className="adm-field">
          <span>Confirmer le nouveau mot de passe</span>
          <input type="password" name="confirm" autoComplete="new-password" value={form.confirm} onChange={update} required />
        </label>
        <button type="submit" className="btn btn-primary">Enregistrer</button>
      </form>
    </>
  )
}
