import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import Typewriter from './Typewriter'
import { useContent } from '../ContentContext'

export default function Hero() {
  const { contact, hero, mission } = useContent()
  const titre = [
    [{ text: hero.ligne1 }],
    [{ text: hero.ligne2, className: 'accent-blue' }],
    [{ text: `${hero.ligne3} ` }, { text: hero.ligne3Accent.replace(/ ([!?:;])/g, '\u00a0$1'), className: 'accent-orange' }],
  ]
  const [typed, setTyped] = useState(false)
  const bgRef = useRef(null)

  // Parallaxe douce de la photo de fond.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900)
        if (bgRef.current) bgRef.current.style.setProperty('--parallax', `${y * 0.35}px`)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <section id="accueil" className={`hero ${typed ? 'is-typed' : ''}`}>
      <div className="hero-bg-wrap" ref={bgRef}>
        <div className="hero-bg" style={{ backgroundImage: 'url(images/sorties-sensibilisation.jpg)' }} />
      </div>
      <div className="hero-overlay" />
      <span className="hero-blob blob-1" />
      <span className="hero-blob blob-2" />
      <span className="hero-blob blob-3" />

      <div className="container hero-inner">
        <div className="hero-content">
          <span className="hero-badge hero-in" style={{ '--d': '0s' }}>
            <Icon name="ShieldCheck" size={16} /> Domaine d'action : {contact.domaine}
          </span>
          <h1 aria-label={`${hero.ligne1} ${hero.ligne2} ${hero.ligne3} ${hero.ligne3Accent}`}>
            <Typewriter lines={titre} onDone={() => setTyped(true)} />
          </h1>
          <p className="hero-tag hero-after" style={{ '--d': '0s' }}>
            {hero.tag}
          </p>
          <p className="hero-text hero-after" style={{ '--d': '.2s' }}>
            L'Association BAARI « La Barre des Arides » œuvre pour la {mission.charAt(0).toLowerCase() + mission.slice(1)}
          </p>
          <div className="hero-actions hero-after" style={{ '--d': '.4s' }}>
            <a href="#apropos" className="btn btn-primary btn-shine">
              Découvrir <Icon name="ArrowRight" size={18} />
            </a>
            <a href="#contact" className="btn btn-ghost">
              <Icon name="Heart" size={18} /> Nous soutenir
            </a>
          </div>
        </div>
      </div>

      <p className="hero-slogan hero-after" style={{ '--d': '.7s' }}>{contact.slogan}</p>
      <a href="#apropos" className="scroll-hint hero-after" style={{ '--d': '.9s' }} aria-label="Défiler vers le contenu">
        <span />
      </a>
    </section>
  )
}
