import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import pg from 'pg'
import * as defaults from '../src/data.js'

const dir = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(dir, '.env'), quiet: true })

const database = process.env.PGDATABASE || 'baari'

// Clés de contenu modifiables, avec le type attendu pour chacune.
export const contentKeys = {
  hero: 'object',
  mission: 'string',
  contact: 'object',
  valeurs: 'array',
  objectifs: 'array',
  groupesCibles: 'array',
  activites: 'array',
  encorePlus: 'array',
  realisations: 'array',
  equipe: 'array',
}

export const defaultContent = Object.fromEntries(Object.keys(contentKeys).map((k) => [k, defaults[k]]))

export const pool = new pg.Pool({ database })

const schema = `
  CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL
  );
  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    sujet TEXT NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`

async function ensureDatabase() {
  const client = new pg.Client({ database: 'postgres' })
  await client.connect()
  try {
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database])
    if (!rowCount) await client.query(`CREATE DATABASE ${pg.escapeIdentifier(database)}`)
  } finally {
    await client.end()
  }
}

export async function initDatabase() {
  await ensureDatabase()
  await pool.query(schema)
  // N'ajoute que les clés absentes : les modifications de l'admin ne sont jamais écrasées.
  for (const [key, value] of Object.entries(defaultContent)) {
    await pool.query('INSERT INTO content (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [
      key,
      JSON.stringify(value),
    ])
  }
  await pool.query('DELETE FROM sessions WHERE expires_at < now()')
}
