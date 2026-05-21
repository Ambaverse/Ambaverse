# Ambaverse — @spaciotemporality

A portfolio site for **Shashank** / `@spaciotemporality`. A computational art
project: live generative canvases, pixel arrow cursor, a bone+acid+magenta
palette, and a Tweaks panel for swapping the theme.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page shell — fonts, CSS, custom cursor, loads the four scripts below. |
| `app.jsx` | React root. Mounts sections, wires the Tweaks panel, owns palette state. |
| `sections.jsx` | All page sections — Nav, Hero, Marquee, Gallery, About, Contact footer + Detail modal. Also the `WORKS` array (currently 8 placeholder slots). |
| `generative.jsx` | The live algorithms: flow field, attractor, Voronoi, moiré, waves, fractal tree, 3D mesh, circle packing, plus the placeholder hatch. |
| `tweaks-panel.jsx` | Floating Tweaks panel (palette / grain / hero drift). |
| `README.md` | This file. |

## Run locally

The site is **fully static** — no build step, no backend. Just serve the folder
over HTTP (file:// won't work because of how the browser loads `<script src>`).

```bash
# pick any one
npx serve .
python3 -m http.server 8000
php -S localhost:8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages

1. Push these files to the **root of a public repo**.
2. **Settings → Pages →** Source: `main` branch, folder: `/ (root)`. Save.
3. After ~1 minute the site is live at
   `https://<username>.github.io/<repo>/`.

For a custom domain (e.g. `ambaverse.com`):
- Add a single-line file called `CNAME` to the repo root containing your
  domain (no `https://`, no trailing slash).
- Point DNS to GitHub Pages
  ([docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).

## How to add a real work

Open `sections.jsx`. Find the `WORKS` array near the top — replace one of the
`PH('001', 'digital')` entries with a full work object:

```js
{
  id: 'my-first-work',
  no: '001',
  title: 'MY WORK',
  algo: 'flowfield',         // see generative.jsx for the list
  year: '2026',
  medium: 'WebGL + custom shader',
  edition: '∞ / generative',
  category: 'digital',       // 'digital' or 'physical'
  blurb: 'One or two sentences about the piece.',
  tags: ['flow', 'noise'],
},
```

Available `algo` values: `flowfield`, `attractor`, `moire`, `voronoi`, `waves`,
`fractal`, `mesh`, `chroma`, `packing`. Add your own by writing a new component
in `generative.jsx` and registering it in the `GENERATIVE` map at the bottom.

## Notes

- **In-browser Babel.** JSX files are transpiled live by `@babel/standalone`.
  This is great for editing but adds ~300–500ms to first paint. If you ever
  want to ship a production build, compile the four `.jsx` files once with
  Babel CLI or esbuild and load them as plain `.js`.
- **Tweaks persistence.** The Tweaks panel posts to a parent host that, on
  GitHub Pages, doesn't exist. The panel still functions in-page — it just
  forgets your choices on reload. Swap the `postMessage` line for
  `localStorage` if you want persistence.
- **Cursor.** The custom pixel-arrow cursor is set up in `index.html` (bottom
  `<script>` block). The native cursor is hidden via `body.has-no-cursor`.

## License

All works © Shashank / Ambaverse. All rights reserved. See the legal notice in
the footer of `index.html`.
