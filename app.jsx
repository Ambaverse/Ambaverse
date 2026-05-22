// Main app — wires sections + Tweaks panel.

const PALETTES = {
  acidpop: {
    bg: '#f3efe4', ink: '#0b0b0e', paper: '#ffffff',
    acid: '#d6ff2e', magenta: '#ff2d7e', cyan: '#00e0ff',
    violet: '#6a3cff', orange: '#ff5b1f',
  },
  ultra: {
    bg: '#0b0b0e', ink: '#f3efe4', paper: '#1a1a20',
    acid: '#39ff14', magenta: '#ff00aa', cyan: '#00f0ff',
    violet: '#7b3cff', orange: '#ff5500',
  },
  riso: {
    bg: '#fff8ec', ink: '#1d1410', paper: '#ffffff',
    acid: '#ffcc00', magenta: '#ff3c5f', cyan: '#1c8aff',
    violet: '#3b2cff', orange: '#ff7a2a',
  },
  zenith: {
    bg: '#eef0e8', ink: '#0a1612', paper: '#ffffff',
    acid: '#a8ff00', magenta: '#ff5773', cyan: '#3de1d6',
    violet: '#5a4cff', orange: '#ff8a2a',
  },
};

function applyPalette(p) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(p)) {
    root.style.setProperty('--' + k, v);
  }
}

// Dark-mode background/foreground overrides. Merged into the active palette
// when theme==='dark' so BOTH the CSS variables AND the JS-passed palette
// object (used by canvases like HeroField) reflect the dark theme.
const DARK_PATCH = { bg: '#0b0b0e', ink: '#f3efe4', paper: '#16161a' };

function readSavedTheme() {
  // Defaults to dark for first-time visitors; user's explicit choice persists.
  try {
    const saved = localStorage.getItem('ambaverse-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'dark';
  } catch (e) { return 'dark'; }
}

// Hash router — supports #/, #/digital, #/physical, #/project/<id>
// Also passes through legacy anchors like #gallery / #about (treated as home).
function parseHash(hash) {
  if (!hash) return { name: 'home' };
  const raw = hash.replace(/^#\/?/, '');
  if (raw === '' ) return { name: 'home' };
  if (raw === 'digital' || raw === 'physical') return { name: 'category', category: raw };
  if (raw.startsWith('project/')) return { name: 'project', id: raw.slice('project/'.length) };
  return { name: 'home', anchor: raw };
}

function App() {
  const [t, setTweak] = window.useTweaks(/*EDITMODE-BEGIN*/{
    "palette": "acidpop",
    "showGrain": true,
    "intensity": 1
  }/*EDITMODE-END*/);

  const [theme, setTheme] = React.useState(readSavedTheme);

  // Effective palette: base palette, with dark overrides applied when dark.
  // This single source drives both the CSS variables (via applyPalette) and
  // every component that reads palette.bg / palette.ink / palette.paper.
  const basePalette = PALETTES[t.palette] || PALETTES.acidpop;
  const palette = theme === 'dark' ? { ...basePalette, ...DARK_PATCH } : basePalette;

  React.useEffect(() => {
    applyPalette(palette);
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('ambaverse-theme', theme); } catch (e) {}
    const grain = document.querySelector('.grain');
    if (grain) grain.style.display = t.showGrain ? 'block' : 'none';
  }, [t.palette, t.showGrain, theme]);

  // Hash-based route
  const [route, setRoute] = React.useState(() => parseHash(window.location.hash));
  React.useEffect(() => {
    const onHash = () => {
      const next = parseHash(window.location.hash);
      setRoute(next);
      // Scroll to top on real route changes (not anchor-jumps within home)
      if (next.name === 'category' || next.name === 'project') {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Honour anchor jumps (e.g. #gallery, #about) after the home view mounts.
  // The browser's native anchor scroll runs before React renders the home
  // content when coming from a sub-page, so we re-scroll once the target
  // element actually exists in the DOM.
  React.useEffect(() => {
    if (route.name !== 'home' || !route.anchor) return;
    let cancelled = false;
    const attempt = (tries) => {
      if (cancelled) return;
      const el = document.getElementById(route.anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (tries > 0) {
        // Element not yet mounted — try again next frame.
        requestAnimationFrame(() => attempt(tries - 1));
      }
    };
    requestAnimationFrame(() => attempt(20));
    return () => { cancelled = true; };
  }, [route]);

  const [open, setOpen] = React.useState(null);

  const isSubpage = route.name === 'category' || route.name === 'project';

  return (
    <>
      <window.Nav theme={theme} setTheme={setTheme} />
      {!isSubpage && <>
        <window.Hero palette={palette} />
        <window.Marquee />
        <window.Gallery palette={palette} onOpen={setOpen} />
        <window.AboutContact palette={palette} />
      </>}
      {route.name === 'category' && (
        <window.CategoryPage category={route.category} palette={palette} />
      )}
      {route.name === 'project' && (
        <window.ProjectPage projectId={route.id} palette={palette} />
      )}

      {open && <window.Detail work={open} palette={palette} onClose={() => setOpen(null)} />}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label="Palette" />
        <window.TweakColor
          label="Theme"
          value={[palette.bg, palette.acid, palette.magenta, palette.cyan]}
          options={Object.values(PALETTES).map(p => [p.bg, p.acid, p.magenta, p.cyan])}
          onChange={(arr) => {
            const idx = Object.values(PALETTES).findIndex(p => p.bg === arr[0]);
            const name = Object.keys(PALETTES)[idx] || 'acidpop';
            setTweak('palette', name);
          }}
        />
        <window.TweakRadio
          label="Mood"
          value={t.palette}
          options={['acidpop', 'ultra', 'riso', 'zenith']}
          onChange={(v) => setTweak('palette', v)}
        />
        <window.TweakSection label="Texture" />
        <window.TweakToggle label="Film grain" value={t.showGrain} onChange={(v) => setTweak('showGrain', v)} />
        <window.TweakSection label="Hero field" />
        <window.TweakSlider
          label="Particle drift"
          min={0.2} max={2.5} step={0.1}
          value={t.intensity}
          onChange={(v) => setTweak('intensity', v)}
        />
      </window.TweaksPanel>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
