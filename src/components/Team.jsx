import SectionTitle from './SectionTitle'
import { equipe } from '../data'

const initials = (nom) =>
  nom
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')

export default function Team() {
  return (
    <section id="equipe" className="section team">
      <div className="container">
        <SectionTitle kicker="Ils portent BAARI" title="Équipe des cadres" />
        <div className="team-grid">
          {equipe.map((m, i) => (
            <div className="member reveal zoom" key={m.nom} style={{ transitionDelay: `${i * 100}ms` }}>
              <div className="member-avatar">{initials(m.nom)}</div>
              <h3>{m.nom}</h3>
              <span>{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
