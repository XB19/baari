import Icon from './Icon'
import { nav } from '../data'
import { useContent } from '../ContentContext'

export default function Footer() {
  const { contact, activites } = useContent()
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="images/logo-baari.png" alt="Logo BAARI" />
          <p>
            <strong>{contact.nom}</strong> – {contact.sousTitre}. Domaine d'action : {contact.domaine}.
          </p>
          <p className="footer-slogan">{contact.slogan}</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <ul>
            {nav.map((n) => (
              <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Nos activités</h4>
          <ul>
            {activites.map((a) => (
              <li key={a.titre}><a href="#activites">{a.sousTitre || a.titre}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li><Icon name="MapPin" size={16} /> {contact.adresse}, {contact.bp}</li>
            <li><Icon name="Phone" size={16} /> {contact.tel.join(' / ')}</li>
            <li><Icon name="Mail" size={16} /> {contact.email}</li>
            <li><Icon name="FileBadge" size={16} /> {contact.recepisse}</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} Association BAARI – La Barre des Arides. Tous droits réservés.</span>
          <a href="#accueil" className="to-top">
            Retour en haut <Icon name="ArrowUp" size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
