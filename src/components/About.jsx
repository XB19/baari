import Icon from './Icon'
import { useContent } from '../ContentContext'

export default function About() {
  const { contact, mission } = useContent()
  return (
    <section id="apropos" className="section about">
      <div className="container about-grid">
        <div className="about-media reveal from-left">
          <img className="about-img-main" src="images/humanisme.jpg" alt="Accompagnement d'une famille par l'association BAARI" />
          <img className="about-img-second" src="images/octobre-rose.jpg" alt="Équipe BAARI lors d'Octobre Rose" />
          <div className="about-logo floating">
            <img src="images/logo-baari.png" alt="" />
          </div>
        </div>
        <div className="about-text reveal from-right">
          <span className="kicker">Qui sommes-nous ?</span>
          <h2>
            Association BAARI <span className="script">La barre des Arides</span>
          </h2>
          <p>
            <strong>Domaine d'action :</strong> {contact.domaine}.
          </p>
          <p className="about-quote">
            <Icon name="Quote" size={28} />
            {contact.slogan}
          </p>
          <div className="mission-card">
            <div className="mission-icon"><Icon name="Award" size={30} /></div>
            <div>
              <h3>Notre mission</h3>
              <p>{mission}</p>
            </div>
          </div>
          <ul className="about-facts">
            <li><Icon name="MapPin" size={18} /> {contact.adresse}, {contact.bp}</li>
            <li><Icon name="FileBadge" size={18} /> Récépissé {contact.recepisse}</li>
          </ul>
          <a href="#valeurs" className="btn btn-secondary">
            Nos valeurs <Icon name="ArrowRight" size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}
