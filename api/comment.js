// POST /api/comment  { token, text, about?, lang }
// Stores a comment under the registered visitor (token from localStorage).
const { ensureSchema, json, readBody } = require('./_db');

async function ensureComments(q) {
  await q`CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    visitor_id INTEGER REFERENCES visitors(id) ON DELETE CASCADE,
    about TEXT,
    text TEXT NOT NULL,
    lang TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )`;
}
module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  try {
    const b = await readBody(req);
    const token = String(b.token || '').slice(0, 80);
    const text = String(b.text || '').trim().slice(0, 4000);
    const about = String(b.about || '').trim().slice(0, 80) || null;
    const lang = ['en', 'fr'].includes(b.lang) ? b.lang : 'en';
    if (!token) return json(res, 401, { error: 'register' });
    if (text.length < 3) return json(res, 400, { error: 'text' });
    const q = await ensureSchema();
    await ensureComments(q);
    const v = await q`SELECT id FROM visitors WHERE token = ${token}`;
    if (!v.length) return json(res, 401, { error: 'register' });
    const r = await q`INSERT INTO comments (visitor_id, about, text, lang) VALUES (${v[0].id}, ${about}, ${text}, ${lang}) RETURNING id, created_at`;
    return json(res, 200, { ok: true, id: r[0].id });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server', detail: String(e.message || e) });
  }
};
module.exports.ensureComments = ensureComments;
