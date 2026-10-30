import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2 } from 'lucide-react'
import Icon, { iconNames } from '../components/Icon'
import ImageField from './ImageField'
import { api } from './api'

const move = (list, from, to) => {
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

function ItemActions({ index, count, onMove, onRemove, label }) {
  return (
    <div className="adm-item-actions">
      <button type="button" className="adm-icon-btn" aria-label={`Monter ${label}`} disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp size={17} />
      </button>
      <button type="button" className="adm-icon-btn" aria-label={`Descendre ${label}`} disabled={index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown size={17} />
      </button>
      <button type="button" className="adm-icon-btn danger" aria-label={`Supprimer ${label}`} onClick={onRemove}>
        <Trash2 size={17} />
      </button>
    </div>
  )
}

function StringsField({ value = [], onChange, multiline, addLabel = 'Ajouter' }) {
  return (
    <div className="adm-strings">
      {value.map((text, i) => (
        <div className="adm-string-row" key={i}>
          {multiline ? (
            <textarea rows={3} value={text} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
          ) : (
            <input value={text} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
          )}
          <ItemActions
            index={i}
            count={value.length}
            label={`la ligne ${i + 1}`}
            onMove={(from, to) => onChange(move(value, from, to))}
            onRemove={() => onChange(value.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      <button type="button" className="adm-btn ghost" onClick={() => onChange([...value, ''])}>
        <Plus size={17} /> {addLabel}
      </button>
    </div>
  )
}

function Field({ field, value, onChange }) {
  const { type = 'text', label, required } = field
  if (type === 'strings') {
    return (
      <div className="adm-field">
        <span>{label}</span>
        <StringsField value={value} onChange={onChange} multiline={field.multiline} addLabel={field.addLabel} />
      </div>
    )
  }
  if (type === 'image') {
    return (
      <div className="adm-field">
        <span>{label}</span>
        <ImageField value={value} onChange={onChange} />
      </div>
    )
  }
  return (
    <label className="adm-field">
      <span>{label}</span>
      {type === 'textarea' && <textarea rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} />}
      {type === 'text' && <input value={value || ''} required={required} onChange={(e) => onChange(e.target.value)} />}
      {type === 'icon' && (
        <div className="adm-icon-select">
          <Icon name={value} size={22} />
          <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {iconNames.map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
      )}
    </label>
  )
}

function Fields({ fields, value, onChange }) {
  return fields.map((f) => (
    <Field key={f.name} field={f} value={value[f.name]} onChange={(v) => onChange({ ...value, [f.name]: v })} />
  ))
}

function ListEditor({ section, value, onChange }) {
  return (
    <>
      {value.map((item, i) => {
        const title = item[section.itemLabel] || 'Sans titre'
        return (
          <details className="adm-card adm-item" key={item.id || i}>
            <summary>
              <span>{title}</span>
              <ItemActions
                index={i}
                count={value.length}
                label={title}
                onMove={(from, to) => onChange(move(value, from, to))}
                onRemove={() => window.confirm(`Supprimer « ${title} » ?`) && onChange(value.filter((_, j) => j !== i))}
              />
            </summary>
            <div className="adm-item-body">
              <Fields fields={section.fields} value={item} onChange={(v) => onChange(value.map((it, j) => (j === i ? v : it)))} />
            </div>
          </details>
        )
      })}
      <button type="button" className="adm-btn" onClick={() => onChange([...value, section.empty()])}>
        <Plus size={17} /> {section.addLabel}
      </button>
    </>
  )
}

export default function SectionEditor({ section, saved, onSaved, onDirtyChange }) {
  const [draft, setDraft] = useState(saved)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange])

  const run = async (request, text) => {
    setBusy(true)
    setNotice(null)
    try {
      const { value } = await request()
      setDraft(value)
      onSaved(section.key, value)
      setNotice({ ok: true, text })
    } catch (err) {
      setNotice({ ok: false, text: err.message })
    } finally {
      setBusy(false)
    }
  }

  const save = (e) => {
    e.preventDefault()
    // Les lignes laissées vides ne sont pas publiées.
    const clean = (v) => {
      if (Array.isArray(v)) return v.filter((x) => x !== '').map(clean)
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clean(x)]))
      return v
    }
    run(() => api(`/content/${section.key}`, { method: 'PUT', body: { value: clean(draft) } }), 'Modifications publiées sur le site.')
  }

  const reset = () => {
    if (window.confirm(`Remettre « ${section.label} » au contenu d'origine ? Vos modifications de cette section seront perdues.`)) {
      run(() => api(`/content/${section.key}/reset`, { method: 'POST' }), "Contenu d'origine restauré.")
    }
  }

  return (
    <form onSubmit={save}>
      <div className="adm-page-head">
        <div>
          <h1>{section.label}</h1>
          <p>{section.hint}</p>
        </div>
        <div className="adm-row">
          <button type="button" className="adm-btn ghost" disabled={busy} onClick={reset}>
            <RotateCcw size={17} /> Contenu d'origine
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !dirty}>
            <Save size={18} /> {busy ? 'Publication…' : 'Publier'}
          </button>
        </div>
      </div>

      {notice && <p className={`adm-alert ${notice.ok ? 'ok' : 'error'}`} role="status">{notice.text}</p>}
      {dirty && !notice && <p className="adm-alert warn">Modifications non publiées.</p>}

      {section.kind === 'object' && (
        <div className="adm-card adm-stack">
          <Fields fields={section.fields} value={draft} onChange={setDraft} />
        </div>
      )}
      {section.kind === 'string' && (
        <div className="adm-card adm-stack">
          <Field field={{ ...section.field, type: 'textarea' }} value={draft} onChange={setDraft} />
        </div>
      )}
      {section.kind === 'strings' && (
        <div className="adm-card">
          <StringsField value={draft} onChange={setDraft} multiline addLabel={section.addLabel} />
        </div>
      )}
      {section.kind === 'list' && <ListEditor section={section} value={draft} onChange={setDraft} />}
    </form>
  )
}
