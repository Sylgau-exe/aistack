// POST /api/visit  { token, lang }
// Records a return visit for a known visitor. Returns {ok:false} if the token is unknown
// so the page can show the registration gate again.
const { ensureSchema, json, readBody } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  try {
    const b = await readBody(req);
    const token = String(b.token || '').slice(0, 80);
    const lang = ['en', 'fr'].includes(b.lang) ? b.lang : 'en';
    if (!token) return json(res, 200, { ok: false });
    const q = await ensureSchema();
    const rows = await q`
      UPDATE visitors SET last_seen = now(), visits = visits + 1, lang = ${lang}
      WHERE token = ${token} RETURNING id, name`;
    if (!rows.length) return json(res, 200, { ok: false });
    await q`INSERT INTO visits (visitor_id, lang, path) VALUES (${rows[0].id}, ${lang}, ${'/'})`;
    return json(res, 200, { ok: true, name: rows[0].name });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server' });
  }
};
