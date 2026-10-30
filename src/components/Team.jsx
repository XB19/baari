import SectionTitle from './SectionTitle'
import { useContent } from '../ContentContext'

const initials = (nom) =>
  nom
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function Team() {
  const { equipe } = useContent()
  return (
    <section id="equipe" className="section team">
      <div className="container">
        <SectionTitle kicker="Ils portent BAARI" title="Équipe des cadres" />
        <div className="team-grid">
          {equipe.map((m, i) => (
            <div className="member reveal zoom" key={m.nom} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="member-avatar">
                {m.photo ? <img src={m.photo} alt={m.nom} /> : initials(m.nom)}
              </div>
              <h3>{m.nom}</h3>
              <span>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
