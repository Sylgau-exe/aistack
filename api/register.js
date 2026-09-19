// POST /api/register  { name, email, organization?, lang, consent }
// Creates or updates a visitor and returns a token the page keeps in localStorage.
const crypto = require('crypto');
const { ensureSchema, json, readBody } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  try {
    const b = await readBody(req);
    const name = String(b.name || '').trim().slice(0, 120);
    const email = String(b.email || '').trim().toLowerCase().slice(0, 200);
    const organization = String(b.organization || '').trim().slice(0, 160) || null;
    const lang = ['en', 'fr'].includes(b.lang) ? b.lang : 'en';
    const consent = b.consent !== false;
    if (name.length < 2) return json(res, 400, { error: 'name' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(res, 400, { error: 'email' });

    const q = await ensureSchema();
    const token = crypto.randomBytes(24).toString('hex');
    const ua = String(req.headers['user-agent'] || '').slice(0, 300);
    const ref = String(req.headers['referer'] || '').slice(0, 300);
    const rows = await q`
      INSERT INTO visitors (email, name, organization, lang, consent, token, user_agent, referrer)
      VALUES (${email}, ${name}, ${organization}, ${lang}, ${consent}, ${token}, ${ua}, ${ref})
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        organization = COALESCE(EXCLUDED.organization, visitors.organization),
        lang = EXCLUDED.lang,
        last_seen = now(),
        visits = visitors.visits + 1
      RETURNING id, token`;
    const v = rows[0];
    await q`INSERT INTO visits (visitor_id, lang, path) VALUES (${v.id}, ${lang}, ${'/'})`;
    return json(res, 200, { ok: true, token: v.token });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server', detail: String(e.message || e) });
  }
};
