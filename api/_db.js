// Shared Neon helper. Creates the tables on first use so no manual SQL is needed.
const { neon } = require('@neondatabase/serverless');

let ready = null;
function sql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  return neon(process.env.DATABASE_URL);
}
async function ensureSchema() {
  if (!ready) {
    ready = (async () => {
      const q = sql();
      await q`CREATE TABLE IF NOT EXISTS visitors (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        organization TEXT,
        lang TEXT,
        consent BOOLEAN DEFAULT TRUE,
        token TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        last_seen TIMESTAMPTZ DEFAULT now(),
        visits INTEGER DEFAULT 1,
        user_agent TEXT,
        referrer TEXT
      )`;
      await q`CREATE TABLE IF NOT EXISTS visits (
        id SERIAL PRIMARY KEY,
        visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE,
        seen_at TIMESTAMPTZ DEFAULT now(),
        lang TEXT,
        path TEXT
      )`;
    })();
  }
  await ready;
  return sql();
}
function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 1e5) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } });
  });
}
module.exports = { ensureSchema, json, readBody };
