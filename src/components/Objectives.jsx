import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { useContent } from '../ContentContext'

export default function Objectives() {
  const { objectifs, groupesCibles } = useContent()
  return (
    <section id="objectifs" className="section objectives">
      <div className="container">
        <SectionTitle kicker="Nos axes" title="Les objectifs de BAARI" />
        <div className="objectives-grid">
          {objectifs.map((o, i) => (
            <article className="objective reveal" key={o} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
              <span className="objective-num">{String(i + 1).padStart(2, '0')}</span>
              <p>{o}</p>
            </article>
          ))}
        </div>

        <div className="targets reveal zoom">
          <div className="targets-head">
            <div className="targets-icon"><Icon name="Target" size={30} /></div>
            <div>
              <span className="kicker">Pour qui ?</span>
              <h3>Nos groupes cibles</h3>
            </div>
          </div>
          <ul className="targets-list">
            {groupesCibles.map((g, i) => (
              <li key={g.label} className="reveal pop" style={{ transitionDelay: `${200 + i * 90}ms` }}>
                <span><Icon name={g.icon} size={26} /></span>
                {g.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
