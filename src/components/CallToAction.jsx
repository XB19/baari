import Icon from './Icon'

export default function CallToAction() {
  return (
    <section className="cta">
      <div className="cta-bg" style={{ backgroundImage: 'url(images/rentree-scolaire.jpg)' }} />
      <div className="container cta-inner reveal zoom">
        <h2>L'Association BAARI « La Barre des Arides » est là pour vous accueillir.</h2>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-primary btn-shine">
            <Icon name="Send" size={18} /> Nous contacter
          </a>
          <a href="#contact" className="btn btn-ghost">
            <Icon name="Heart" size={18} /> Faire un don
          </a>
        </div>
      </div>
    </section>
  )
}
