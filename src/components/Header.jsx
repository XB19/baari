import { useEffect, useState } from 'react'
import Icon from './Icon'
import { contact, nav } from '../data'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('accueil')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      let current = 'accueil'
      for (const item of nav) {
        const el = document.getElementById(item.id)
        if (el && el.getBoundingClientRect().top <= 140) current = item.id
      }
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <span><Icon name="MapPin" size={15} /> {contact.adresse} – Lomé, Togo</span>
          <span className="topbar-right">
            <a href={`tel:${contact.telLiens[0]}`}><Icon name="Phone" size={15} /> {contact.tel[0]}</a>
            <a href={`mailto:${contact.email}`}><Icon name="Mail" size={15} /> {contact.email}</a>
          </span>
        </div>
      </div>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <a href="#accueil" className="brand" onClick={() => setOpen(false)}>
            <img src="images/logo-baari.png" alt="Logo BAARI – La Barre des Arides" />
            <span>
              <strong>BAARI</strong>
              <em>La Barre des Arides</em>
            </span>
          </a>
          <nav className={`nav ${open ? 'open' : ''}`} aria-label="Navigation principale">
            {nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'active' : ''}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a href="#contact" className="btn btn-primary nav-cta" onClick={() => setOpen(false)}>
              <Icon name="Heart" size={18} /> Nous soutenir
            </a>
          </nav>
          <button
            className="burger"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <Icon name={open ? 'X' : 'Menu'} size={26} />
          </button>
        </div>
      </header>
    </>
  )
}
