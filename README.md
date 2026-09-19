# AI Sovereign Stack

Where Canada can be sovereign in the AI stack — alone, and as an EU associate member.
Interactive map by **Sylvain Gauthier, with Claude (Anthropic)**. Draft for review — share with attribution.

## What is in the repo

- `index.html` — the interactive page, gated by a name + email popup
- `admin.html` — visitor list, stats, CSV export (served at `/admin`)
- `api/register.js`, `api/visit.js`, `api/admin.js`, `api/_db.js` — Vercel serverless functions on Neon PostgreSQL
- `og.png` — social preview image
- `package.json`, `vercel.json`

## Vercel setup

1. Environment variables (Settings → Environment Variables, Production + Preview):
   - `DATABASE_URL` — the Neon connection string (the Neon integration sets this automatically)
   - `ADMIN_KEY` — a secret of your choice; this is what you type at `/admin`
2. Redeploy after adding variables. No SQL to run: tables are created on the first request.
3. Open `/` → register once → the page remembers you on that browser.
4. Open `/admin` → enter `ADMIN_KEY` → visitor list; *Download CSV* for the mailing list.

## Edit the content

All text is in `index.html`: `LAYERS`, `BASE`, `QA`, `TOUR`, `UI` (page) and `GATE_UI` (popup), each field as `B("English","Français")`.
A verdict is `{c, v, tm}`: colour (`ok | warn | part | bad`), label key, timing (`now | prog | none | gated`).
Author links are in the `AUTHOR` object near the top of the script.
