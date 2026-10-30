// Crée le compte administrateur, ou lui donne un nouveau mot de passe s'il existe déjà.
// Usage : npm run admin -- adresse@exemple.org
// Le mot de passe n'est stocké que sous forme de hash : il n'est affiché qu'une seule fois.
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { initDatabase, pool } from './db.js'

const email = (process.argv[2] || 'admin@ongbaari.com').trim().toLowerCase()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Adresse e-mail invalide.')
  process.exit(1)
}

// Sans caractères ambigus (0/O, 1/l/I) pour se recopier sans erreur.
const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const password = Array.from({ length: 16 }, () => alphabet[crypto.randomInt(alphabet.length)]).join('')

await initDatabase()
const { rows } = await pool.query(
  `INSERT INTO admins (email, password_hash) VALUES ($1, $2)
   ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
   RETURNING id`,
  [email, await bcrypt.hash(password, 12)]
)
// Un mot de passe réinitialisé déconnecte les sessions ouvertes.
await pool.query('DELETE FROM sessions WHERE admin_id = $1', [rows[0].id])
await pool.end()

console.log(`E-mail       : ${email}`)
console.log(`Mot de passe : ${password}`)
