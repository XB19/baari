export default function SectionTitle({ kicker, title, children, light = false, center = true }) {
  return (
    <div className={`section-title reveal ${center ? 'center' : ''} ${light ? 'light' : ''}`}>
      {kicker && <span className="kicker">{kicker}</span>}
      <h2>{title}</h2>
      {children && <p className="lead">{children}</p>}
    </div>
  )
}
