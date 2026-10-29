import { useEffect, useState } from 'react'
import Icon from './Icon'

const R = 24
const CIRC = 2 * Math.PI * R

// Barre de progression de lecture + bouton flèche « retour en haut ».
export default function ScrollUI() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        setProgress(max > 0 ? window.scrollY / max : 0)
        setVisible(window.scrollY > 500)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <>
      <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      <button
        type="button"
        className={`back-to-top ${visible ? 'show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Revenir en haut de la page"
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r={R} className="ring-track" />
          <circle
            cx="28"
            cy="28"
            r={R}
            className="ring-progress"
            style={{ strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - progress) }}
          />
        </svg>
        <Icon name="ArrowUp" size={22} />
      </button>
    </>
  )
}
