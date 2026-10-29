import { useState } from 'react'
import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { contact } from '../data'

const sujets = ['Demande générale', 'Accompagnement / prise en charge', 'Partenariat', 'Parrainage', 'Faire un don', 'Autre']

export default function Contact() {
  const [form, setForm] = useState({ nom: '', email: '', sujet: sujets[0], message: '' })
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  // Pas de serveur : le message est préparé dans la messagerie du visiteur.
  const submit = (e) => {
    e.preventDefault()
    const body = `${form.message}\n\n${form.nom} – ${form.email}`
    window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`[Site BAARI] ${form.sujet}`)}&body=${encodeURIComponent(body)}`
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
                {contact.tel.map((t, i) => (
                  <p key={t}><a href={`tel:${contact.telLiens[i]}`}>{t}</a></p>
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
            <button type="submit" className="btn btn-primary">
              <Icon name="Send" size={18} /> Envoyer
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
