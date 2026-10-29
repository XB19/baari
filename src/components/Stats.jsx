import { useEffect, useRef, useState } from 'react'
import { objectifs, groupesCibles, valeurs, realisations } from '../data'

const stats = [
  { value: valeurs.length, label: 'Valeurs fondatrices' },
  { value: objectifs.length, label: 'Objectifs stratégiques' },
  { value: groupesCibles.length, label: 'Groupes cibles' },
  { value: realisations[0].lieux.length, label: 'Localités sensibilisées' },
]

function Counter({ value }) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (t) => {
        const p = Math.min((t - start) / 1200, 1)
        setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [value])
  return <strong ref={ref}>{n}</strong>
}

export default function Stats() {
  return (
    <section className="stats">
      <div className="container stats-grid">
        {stats.map((s, i) => (
          <div className="stat reveal" key={s.label} style={{ transitionDelay: `${i * 120}ms` }}>
            <Counter value={s.value} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
