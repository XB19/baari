import Icon from './Icon'

const items = [
  { icon: 'Megaphone', titre: 'Sensibiliser', texte: "Former, éduquer et communiquer sur le problème de l'infertilité." },
  { icon: 'HeartHandshake', titre: 'Accompagner', texte: 'Prise en charge psycho sociale et médicale des personnes concernées.' },
  { icon: 'HandHeart', titre: 'Soutenir', texte: 'Soutenir moralement, matériellement et financièrement les familles.' },
]

export default function Highlights() {
  return (
    <div className="container highlights">
      {items.map((it, i) => (
        <div className="highlight reveal" style={{ transitionDelay: `${i * 100}ms` }} key={it.titre}>
          <div className="highlight-icon"><Icon name={it.icon} size={28} /></div>
          <div>
            <h3>{it.titre}</h3>
            <p>{it.texte}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
