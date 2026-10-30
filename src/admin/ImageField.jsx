import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, Upload, X } from 'lucide-react'
import { api, imgUrl } from './api'

export function UploadButton({ onUploaded, onError, label = 'Envoyer une image' }) {
  const input = useRef(null)
  const [busy, setBusy] = useState(false)

  const send = async (e) => {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setBusy(true)
    try {
      onUploaded(await api('/media', { method: 'POST', formData }))
    } catch (err) {
      onError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={send} />
      <button type="button" className="adm-btn" disabled={busy} onClick={() => input.current.click()}>
        <Upload size={17} /> {busy ? 'Envoi…' : label}
      </button>
    </>
  )
}

function MediaPicker({ onPick, onClose }) {
  const [media, setMedia] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/media').then(setMedia).catch((e) => setError(e.message))
  }, [])

  return (
    <div className="adm-modal" role="dialog" aria-modal="true" aria-label="Choisir une image" onClick={onClose}>
      <div className="adm-modal-box" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3>Choisir une image</h3>
          <button type="button" className="adm-icon-btn" aria-label="Fermer" onClick={onClose}><X size={20} /></button>
        </header>
        <UploadButton onUploaded={(m) => onPick(m.url)} onError={setError} />
        {error && <p className="adm-alert error">{error}</p>}
        {media?.length === 0 && <p className="adm-muted">Aucune image envoyée pour le moment.</p>}
        <div className="adm-media-grid">
          {media?.map((m) => (
            <button type="button" key={m.id} className="adm-media-pick" onClick={() => onPick(m.url)}>
              <img src={m.url} alt={m.original_name} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ImageField({ value, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="adm-image-field">
      {value ? <img src={imgUrl(value)} alt="" /> : <div className="adm-image-empty"><ImagePlus size={26} /></div>}
      <div className="adm-row">
        <button type="button" className="adm-btn" onClick={() => setOpen(true)}>
          <ImagePlus size={17} /> {value ? 'Changer' : 'Choisir'}
        </button>
        {value && (
          <button type="button" className="adm-btn ghost" onClick={() => onChange('')}>
            <Trash2 size={17} /> Retirer
          </button>
        )}
      </div>
      {open && (
        <MediaPicker
          onClose={() => setOpen(false)}
          onPick={(url) => {
            onChange(url)
            setOpen(false)
          }}
        />
      )}
    </div>
  )
}
