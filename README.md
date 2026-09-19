# AI Sovereign Stack

Where Canada can be sovereign in the AI stack — alone, and as an EU associate member.
An interactive map: click a layer to fly in, click any verdict for the reasoning, guided tour, Q&A, English and French.

**Author:** Sylvain Gauthier, with Claude (Anthropic). Draft for review — share with attribution.

## Publish

Static site, no build step. Two options:

- **GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / root. The site appears at `https://<user>.github.io/aistack/`.
- **Vercel:** Import the repo, framework *Other*, no build command, output directory `.` (root). Deploy.

## Files

- `index.html` — the whole interactive page (all text, both languages, in the `LAYERS`, `BASE`, `QA`, `TOUR` and `UI` objects)
- `og.png` — social preview image (the static chart)

## Edit

Each text field is `B("English","Français")`. A verdict is `{c, v, tm}`: colour (`ok | warn | part | bad`), label key, timing (`now | prog | none | gated`).
Author links live in the `AUTHOR` object near the top of the script.
