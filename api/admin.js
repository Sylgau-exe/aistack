// GET /api/admin            -> visitors list (header x-admin-key or ?key=)
// GET /api/admin?format=csv -> CSV download
const { ensureSchema, json } = require('./_db');

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    const key = req.headers['x-admin-key'] || url.searchParams.get('key') || '';
    if (!process.env.ADMIN_KEY) return json(res, 500, { error: 'ADMIN_KEY is not set in Vercel environment variables' });
    if (key !== process.env.ADMIN_KEY) return json(res, 401, { error: 'unauthorized' });

    const q = await ensureSchema();
    const rows = await q`
      SELECT id, name, email, organization, lang, consent, visits, created_at, last_seen, referrer
      FROM visitors ORDER BY last_seen DESC LIMIT 5000`;
    const totals = await q`SELECT count(*)::int AS visitors, coalesce(sum(visits),0)::int AS visits,
      count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS new_7d FROM visitors`;

    if (url.searchParams.get('format') === 'csv') {
      const esc = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
      const head = ['id', 'name', 'email', 'organization', 'lang', 'consent', 'visits', 'created_at', 'last_seen', 'referrer'];
      const csv = [head.join(',')].concat(rows.map((r) => head.map((h) => esc(r[h])).join(','))).join('\r\n');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="ai-sovereign-stack-visitors.csv"');
      return res.end('﻿' + csv);
    }
    return json(res, 200, { ok: true, totals: totals[0], visitors: rows });
  } catch (e) {
    console.error(e);
    return json(res, 500, { error: 'server', detail: String(e.message || e) });
  }
};
