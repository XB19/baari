import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import express from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { contentKeys, defaultContent, initDatabase, pool } from './db.js'

const dir = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(dir, 'uploads')
const distDir = path.join(dir, '..', 'dist')
mkdirSync(uploadsDir, { recursive: true })

const COOKIE = 'baari_session'
const SESSION_MS = 8 * 60 * 60 * 1000
const MIN_PASSWORD = 10

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(uploadsDir, { setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff') }))

/* ====== Utilitaires ====== */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const isEmail = (v) => typeof v === 'string' && v.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const readCookie = (req) => {
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`))
  return match?.[1]
}

// À activer dès que le site est servi en HTTPS.
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: process.env.COOKIE_SECURE === 'true', path: '/' }

async function startSession(res, adminId) {
  const token = crypto.randomBytes(32).toString('hex')
  await pool.query('INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES ($1, $2, $3)', [
    hashToken(token),
    adminId,
    new Date(Date.now() + SESSION_MS),
  ])
  res.cookie(COOKIE, token, { ...cookieOptions, maxAge: SESSION_MS })
}

async function currentAdmin(req) {
  const token = readCookie(req)
  if (!token) return null
  const { rows } = await pool.query(
    `SELECT a.id, a.email, a.password_hash FROM sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [hashToken(token)]
  )
  return rows[0] || null
}

const requireAdmin = async (req, res, next) => {
  const admin = await currentAdmin(req)
  if (!admin) return res.status(401).json({ error: 'Session expirée, reconnectez-vous.' })
  req.admin = admin
  next()
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
})
const messageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de messages envoyés. Réessayez plus tard.' },
})

/* ====== Public ====== */
app.get('/api/content', async (_req, res) => {
  const { rows } = await pool.query('SELECT key, value FROM content')
  res.set('Cache-Control', 'no-store')
  res.json(Object.fromEntries(rows.filter((r) => r.key in contentKeys).map((r) => [r.key, r.value])))
})

app.post('/api/messages', messageLimiter, async (req, res) => {
  const { nom, email, sujet, message, site } = req.body || {}
  // Champ piège invisible : un humain le laisse vide.
  if (site) return res.status(201).json({ ok: true })
  const valid =
    typeof nom === 'string' && nom.trim() && nom.length <= 200 &&
    isEmail(email) &&
    typeof sujet === 'string' && sujet.trim() && sujet.length <= 200 &&
    typeof message === 'string' && message.trim() && message.length <= 5000
  if (!valid) return res.status(400).json({ error: 'Merci de vérifier les champs du formulaire.' })
  await pool.query('INSERT INTO messages (nom, email, sujet, message) VALUES ($1, $2, $3, $4)', [
    nom.trim(),
    email.trim(),
    sujet.trim(),
    message.trim(),
  ])
  res.status(201).json({ ok: true })
})

/* ====== Authentification ====== */
app.get('/api/admin/status', async (req, res) => {
  const admin = await currentAdmin(req)
  res.json({ email: admin?.email || null })
})

app.post('/api/admin/login', authLimiter, async (req, res) => {
  const { email, password } = req.body || {}
  const { rows } = await pool.query('SELECT id, email, password_hash FROM admins WHERE email = $1', [
    String(email || '').trim().toLowerCase(),
  ])
  const ok = rows[0] && (await bcrypt.compare(String(password || ''), rows[0].password_hash))
  if (!ok) return res.status(401).json({ error: 'E-mail ou mot de passe incorrect.' })
  await startSession(res, rows[0].id)
  res.json({ email: rows[0].email })
})

app.post('/api/admin/logout', async (req, res) => {
  const token = readCookie(req)
  if (token) await pool.query('DELETE FROM sessions WHERE token_hash = $1', [hashToken(token)])
  res.clearCookie(COOKIE, cookieOptions)
  res.json({ ok: true })
})

app.put('/api/admin/password', requireAdmin, authLimiter, async (req, res) => {
  const { current, next: nextPassword } = req.body || {}
  if (!(await bcrypt.compare(String(current || ''), req.admin.password_hash))) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect.' })
  }
  if (typeof nextPassword !== 'string' || nextPassword.length < MIN_PASSWORD) {
    return res.status(400).json({ error: `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.` })
  }
  await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(nextPassword, 12), req.admin.id])
  // Déconnecte les autres appareils.
  await pool.query('DELETE FROM sessions WHERE admin_id = $1 AND token_hash <> $2', [req.admin.id, hashToken(readCookie(req))])
  res.json({ ok: true })
})

/* ====== Contenu ====== */
const checkType = (key, value) => {
  const expected = contentKeys[key]
  if (expected === 'array') return Array.isArray(value)
  if (expected === 'string') return typeof value === 'string' && value.trim().length > 0
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

app.put('/api/admin/content/:key', requireAdmin, async (req, res) => {
  const { key } = req.params
  const value = req.body?.value
  if (!(key in contentKeys)) return res.status(404).json({ error: 'Section inconnue.' })
  if (!checkType(key, value)) return res.status(400).json({ error: 'Contenu invalide pour cette section.' })
  await pool.query(
    `INSERT INTO content (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  )
  res.json({ value })
})

app.post('/api/admin/content/:key/reset', requireAdmin, async (req, res) => {
  const { key } = req.params
  if (!(key in contentKeys)) return res.status(404).json({ error: 'Section inconnue.' })
  await pool.query('UPDATE content SET value = $1, updated_at = now() WHERE key = $2', [
    JSON.stringify(defaultContent[key]),
    key,
  ])
  res.json({ value: defaultContent[key] })
})

/* ====== Messages ====== */
app.get('/api/admin/messages', requireAdmin, async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC')
  res.json(rows)
})

app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  const { rows } = await pool.query('UPDATE messages SET lu = $1 WHERE id = $2 RETURNING *', [
    req.body?.lu === true,
    Number(req.params.id) || 0,
  ])
  if (!rows[0]) return res.status(404).json({ error: 'Message introuvable.' })
  res.json(rows[0])
})

app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [Number(req.params.id) || 0])
  res.json({ ok: true })
})

/* ====== Médiathèque ====== */
// Le type est déduit des premiers octets du fichier, pas de ce que déclare le navigateur.
const detectImage = (buf) => {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: 'image/jpeg', ext: 'jpg' }
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { mime: 'image/png', ext: 'png' }
  }
  if (buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } })

const withUrl = (m) => ({ ...m, url: `/uploads/${m.filename}` })

app.get('/api/admin/media', requireAdmin, async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM media ORDER BY created_at DESC')
  res.json(rows.map(withUrl))
})

app.post('/api/admin/media', requireAdmin, upload.single('file'), async (req, res) => {
  const type = req.file && detectImage(req.file.buffer)
  if (!type) return res.status(400).json({ error: 'Formats acceptés : JPG, PNG ou WebP.' })
  const filename = `${crypto.randomUUID()}.${type.ext}`
  await fs.writeFile(path.join(uploadsDir, filename), req.file.buffer)
  const { rows } = await pool.query(
    'INSERT INTO media (filename, original_name, mime, size) VALUES ($1, $2, $3, $4) RETURNING *',
    [filename, req.file.originalname.slice(0, 200), type.mime, req.file.size]
  )
  res.status(201).json(withUrl(rows[0]))
})

app.delete('/api/admin/media/:id', requireAdmin, async (req, res) => {
  const { rows } = await pool.query('DELETE FROM media WHERE id = $1 RETURNING filename', [Number(req.params.id) || 0])
  if (rows[0]) await fs.rm(path.join(uploadsDir, rows[0].filename), { force: true })
  res.json({ ok: true })
})

/* ====== Version compilée & erreurs ====== */
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.get(/^\/(?!api\/|uploads\/).*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.use('/api', (_req, res) => res.status(404).json({ error: 'Route inconnue.' }))

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const tooBig = err.code === 'LIMIT_FILE_SIZE'
    return res.status(400).json({ error: tooBig ? 'Image trop lourde (5 Mo maximum).' : 'Envoi du fichier impossible.' })
  }
  console.error(err)
  res.status(500).json({ error: 'Erreur du serveur.' })
})

await initDatabase()
const port = Number(process.env.PORT) || 4000
// Par défaut, écoute uniquement sur cette machine (HOST=0.0.0.0 dans le conteneur Docker).
const host = process.env.HOST || '127.0.0.1'
app.listen(port, host, () => console.log(`API BAARI : http://${host}:${port}`))
