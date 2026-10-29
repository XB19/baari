import { useState } from 'react'
import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { valeurs } from '../data'

export default function Values() {
  const [current, setCurrent] = useState(0)
  const v = valeurs[current]

  return (
    <section id="valeurs" className="section values">
      <div className="container">
        <SectionTitle kicker="Ce qui nous guide" title="Nos valeurs" light />
        <div className="values-tabs reveal zoom" role="tablist">
          {valeurs.map((val, i) => (
            <button
              key={val.id}
              role="tab"
              aria-selected={i === current}
              className={i === current ? 'active' : ''}
              onClick={() => setCurrent(i)}
            >
              <Icon name={val.icon} size={22} />
              {val.titre}
            </button>
          ))}
        </div>
        <div className="values-panel" key={v.id} role="tabpanel">
          <div className={`values-media ${v.id === 'citoyennete' ? 'contain' : ''}`}>
            <img src={v.image} alt={v.titre} />
          </div>
          <div className="values-text">
            <h3>{v.titre}</h3>
            {v.paragraphes.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {v.points && (
              <ul className="check-list">
                {v.points.map((p) => (
                  <li key={p}><Icon name="CircleCheck" size={20} /> <span>{p}</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
