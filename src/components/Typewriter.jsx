import { useEffect, useState } from 'react'

// Tape le texte caractère par caractère, ligne par ligne.
// lines = [[{ text, className }, ...], ...] : chaque ligne contient un ou plusieurs segments colorés.
// Le texte complet est toujours rendu (partie non tapée invisible) : la mise en page ne bouge pas.
export default function Typewriter({ lines, speed = 48, startDelay = 500, linePause = 320, onDone }) {
  const segments = []
  let pos = 0
  lines.forEach((line, li) =>
    line.forEach((seg) => {
      segments.push({ ...seg, line: li, start: pos, end: pos + seg.text.length })
      pos += seg.text.length
    })
  )
  const total = pos
  const lineEnds = lines.map((_, li) => Math.max(...segments.filter((s) => s.line === li).map((s) => s.end)))

  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [count, setCount] = useState(reduced ? total : 0)

  useEffect(() => {
    if (reduced) {
      onDone?.()
      return
    }
    let i = 0
    let timer
    const step = () => {
      i += 1
      setCount(i)
      if (i >= total) {
        onDone?.()
        return
      }
      const pause = lineEnds.includes(i) ? linePause : speed + Math.random() * 30
      timer = setTimeout(step, pause)
    }
    timer = setTimeout(step, startDelay)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Le curseur se place après le dernier caractère tapé.
  const caretSeg = count === 0 ? 0 : segments.findIndex((s) => count > s.start && count <= s.end)
  const done = count >= total

  return (
    <span className="typewriter" aria-hidden="true">
      {lines.map((_, li) => (
        <span key={li} className="tw-line">
          {segments.map((s, si) => {
            if (s.line !== li) return null
            const shown = Math.max(0, Math.min(s.text.length, count - s.start))
            return (
              <span key={si} className={s.className}>
                {s.text.slice(0, shown)}
                {si === caretSeg && <span className={`tw-caret ${done ? 'done' : ''}`} />}
                <span className="tw-hidden">{s.text.slice(shown)}</span>
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}
