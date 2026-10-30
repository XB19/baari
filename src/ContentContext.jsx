import { createContext, useContext, useEffect, useState } from 'react'
import * as defaults from './data'

const ContentContext = createContext(defaults)

export const useContent = () => useContext(ContentContext)

// "(00228) 90 82 80 08" -> "+22890828008"
export const telHref = (tel) => `tel:${tel.replace(/[^\d+]/g, '').replace(/^00/, '+')}`

// Le contenu est chargé avant le rendu pour que les animations démarrent sur le texte final.
// Sans serveur disponible, le site reste complet grâce au contenu de data.js.
export function ContentProvider({ children }) {
  const [content, setContent] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 2000)
    fetch('/api/content', { signal: controller.signal })
      .then((res) => {
        if (!res.ok || !res.headers.get('content-type')?.includes('json')) throw new Error('indisponible')
        return res.json()
      })
      .then((data) => setContent({ ...defaults, ...data }))
      .catch(() => setContent(defaults))
      .finally(() => clearTimeout(timeout))
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [])

  if (!content) return <div className="page-loader" aria-label="Chargement" />
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
