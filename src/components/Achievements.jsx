import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { realisations } from '../data'

export default function Achievements() {
  return (
    <section id="realisations" className="section achievements">
      <div className="container">
        <SectionTitle kicker="Nos actions" title="Nos réalisations" />
        <div className="cards-grid">
          {realisations.map((r, i) => (
            <article className="card reveal from-bottom" key={r.titre} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="card-media">
                <img src={r.image} alt={r.titre} loading="lazy" />
                <span className="card-tag">{r.categorie}</span>
              </div>
              <div className="card-body">
                <h3>{r.titre}</h3>
                {r.texte && <p>{r.texte}</p>}
                {r.lieux && (
                  <ul className="places">
                    {r.lieux.map((l) => (
                      <li key={l}><Icon name="MapPin" size={16} /> {l}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
