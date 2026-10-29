import Icon from './Icon'
import SectionTitle from './SectionTitle'
import { activites, encorePlus } from '../data'

export default function Activities() {
  return (
    <section id="activites" className="section activities">
      <div className="container">
        <SectionTitle kicker="Sur le terrain" title="Les activités de BAARI" />
        <div className="activities-list">
          {activites.map((a, i) => (
            <article className={`activity ${i % 2 ? 'reverse' : ''}`} key={a.titre}>
              <div className={`activity-media reveal ${i % 2 ? 'from-right' : 'from-left'} ${a.image2 ? 'duo' : ''}`}>
                <img src={a.image} alt={a.titre} loading="lazy" />
                {a.image2 && <img src={a.image2} alt={a.titre} loading="lazy" />}
                <span className="activity-num">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className={`activity-body reveal ${i % 2 ? 'from-left' : 'from-right'}`}>
                <div className="activity-icon"><Icon name={a.icon} size={26} /></div>
                <h3>{a.titre}</h3>
                {a.sousTitre && <p className="activity-sub">{a.sousTitre}</p>}
                <ul>
                  {a.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="encore reveal zoom">
          <div className="encore-head">
            <Icon name="Sparkles" size={28} />
            <h3>Encore plus !!!</h3>
          </div>
          <ul className="check-list two-cols">
            {encorePlus.map((e) => (
              <li key={e}><Icon name="CircleCheck" size={20} /> <span>{e}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
