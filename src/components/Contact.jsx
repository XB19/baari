import { useState } from 'react'
import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { telHref, useContent } from '../ContentContext'

const sujets = ['Demande générale', 'Accompagnement / prise en charge', 'Partenariat', 'Parrainage', 'Faire un don', 'Autre']

const emptyForm = { nom: '', email: '', sujet: sujets[0], message: '', site: '' }

export default function Contact() {
  const { contact } = useContent()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const openMail = () => {
    const body = `${form.message}\n\n${form.nom} – ${form.email}`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`[Site BAARI] ${form.sujet}`)}&body=${encodeURIComponent(body)}`
  }

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const isJson = res.headers.get('content-type')?.includes('json')
      // Serveur absent : on repasse par la messagerie du visiteur.
      if (!isJson) return openMail()
      const data = await res.json()
      if (!res.ok) return setStatus({ ok: false, text: data.error })
      setForm(emptyForm)
      setStatus({ ok: true, text: 'Merci, votre message a bien été envoyé.' })
    } catch {
      openMail()
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <SectionTitle kicker="Parlons-en" title="Nous contacter">
          Une question, un besoin d'écoute, une envie de nous soutenir ? Écrivez-nous en toute confidentialité.
        </SectionTitle>
        <div className="contact-grid">
          <div className="contact-info reveal from-left">
            <div className="info-item">
              <span><Icon name="MapPin" size={22} /></span>
              <div>
                <h4>Adresse</h4>
                <p>{contact.adresse}</p>
                <p>{contact.adresseFlyer}</p>
                <p>{contact.bp}</p>
              </div>
            </div>
            <div className="info-item">
              <span><Icon name="Phone" size={22} /></span>
              <div>
                <h4>Téléphone</h4>
                {contact.tel.map((t) => (
                  <p key={t}><a href={telHref(t)}>{t}</a></p>
                ))}
              </div>
            </div>
            <div className="info-item">
              <span><Icon name="Mail" size={22} /></span>
              <div>
                <h4>E-mail</h4>
                <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
              </div>
            </div>
            <div className="info-item">
              <span><Icon name="Globe" size={22} /></span>
              <div>
                <h4>Site web</h4>
                <p>{contact.site}</p>
              </div>
            </div>
          </div>

          <form className="contact-form reveal from-right" onSubmit={submit}>
            <input className="hp-field" name="site" value={form.site} onChange={update} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div className="field-row">
              <label>
                Nom complet
                <input name="nom" value={form.nom} onChange={update} required />
              </label>
              <label>
                E-mail
                <input type="email" name="email" value={form.email} onChange={update} required />
              </label>
            </div>
            <label>
              Sujet
              <select name="sujet" value={form.sujet} onChange={update}>
                {sujets.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea name="message" rows="5" value={form.message} onChange={update} required />
            </label>
            {status && (
              <p className={`form-status ${status.ok ? 'ok' : 'error'}`} role="status">{status.text}</p>
            )}
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Icon name="Send" size={18} /> {sending ? 'Envoi…' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
