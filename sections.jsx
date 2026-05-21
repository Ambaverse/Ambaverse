// Page sections for SpacioTemporality portfolio.
// Components rely on window.GENERATIVE registered by generative.jsx.

const { useState, useEffect: useFx, useRef: useR, useMemo } = React;

// ===== DATA =====
// All real works removed. The grid now shows placeholder slots waiting to be
// filled. Each slot keeps a `category` so the digital/physical split stays
// meaningful, and `algo: 'placeholder'` so the renderer draws an empty
// hatched tile instead of a live canvas.
const PH = (no, category) => ({
  id: `placeholder-${no}`,
  no,
  title: 'UNTITLED',
  algo: 'placeholder',
  year: '—',
  medium: 'work in progress',
  edition: '—',
  blurb: '',
  tags: [],
  category,
  isPlaceholder: true,
});

const WORKS = [
  PH('001', 'digital'),
  PH('002', 'digital'),
  PH('003', 'digital'),
  PH('004', 'digital'),
  PH('005', 'physical'),
  PH('006', 'physical'),
  PH('007', 'physical'),
  PH('008', 'physical'),
];

// ===== NAV =====
function Nav({ theme = 'light', setTheme = () => {} }) {
  const [time, setTime] = useState(() => new Date());
  useFx(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  const hhmm = time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'America/Los_Angeles' });
  const isDark = theme === 'dark';
  return (
    <nav className="top">
      <div className="brand">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          data-cursor="hover"
          data-cursor-label="HOME"
          aria-label="Back to top"
          style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <img
            src="logo.png"
            alt="ambaverse"
            style={{ height: 26, width: 'auto', display: 'block', borderRadius: 6 }}
          />
        </a>
        <span style={{ opacity: 0.55, marginLeft: 10 }}>@spatiotemporality</span>
      </div>
      <ul>
        <li><a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} data-cursor="text">Home</a></li>
        <li><a href="#gallery" data-cursor="text">Gallery</a></li>
        <li><a href="#about" data-cursor="text">About</a></li>
      </ul>
      <div className="clock">
        <button
          type="button"
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDark}
          data-cursor="hover"
          data-cursor-label={isDark ? 'LIGHT' : 'DARK'}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '1.5px solid var(--ink)',
            background: 'var(--bg)',
            color: 'var(--ink)',
            cursor: 'none',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background .2s ease, color .2s ease, transform .15s ease',
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={(e) => e.currentTarget.style.transform = ''}
          onMouseLeave={(e) => e.currentTarget.style.transform = ''}
        >
          {isDark ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <span style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '2px 8px' }}>OPEN FOR COLLABORATIONS</span>
      </div>
    </nav>
  );
}

// ===== HERO =====
function Hero({ palette }) {
  const [t, setT] = useState(0);
  useFx(() => {
    let raf, t0 = performance.now();
    const loop = (now) => {
      setT((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Random procedural texture inside the AMBAVERSE text mask.
  // Each entry is a feTurbulence recipe + a feColorMatrix tint. The matrix
  // is per-channel (last row forces full alpha). A fresh seed each mount
  // varies the noise pattern even within the same recipe.
  const tex = useMemo(() => {
    const recipes = [
      // VIOLET STONE — large soft swirls
      { freq: '0.010 0.018', oct: 3, type: 'fractalNoise',
        matrix: '0.45 0 0 0 0.04  0 0.25 0 0 0.02  0 0 0.85 0 0.18  0 0 0 0 1',
        bg: '#0d0a18' },
      // RUST — medium warm grain
      { freq: '0.025 0.08', oct: 3, type: 'fractalNoise',
        matrix: '1.00 0 0 0 0.06  0 0.55 0 0 0.04  0 0 0.20 0 0.00  0 0 0 0 1',
        bg: '#1a0a05' },
      // CONCRETE — fine neutral grain
      { freq: '0.08', oct: 2, type: 'fractalNoise',
        matrix: '0.55 0 0 0 0.10  0 0.55 0 0 0.10  0 0 0.55 0 0.10  0 0 0 0 1',
        bg: '#161616' },
      // CLOUDS — wide cool drifts
      { freq: '0.005', oct: 4, type: 'fractalNoise',
        matrix: '0.20 0 0 0 0.04  0 0.40 0 0 0.06  0 0 0.85 0 0.12  0 0 0 0 1',
        bg: '#070c1a' },
      // STATIC — fine high-contrast B&W
      { freq: '0.9', oct: 1, type: 'turbulence',
        matrix: '1.10 0 0 0 0  0 1.10 0 0 0  0 0 1.10 0 0  0 0 0 0 1',
        bg: '#000000' },
      // MOSS — green organic
      { freq: '0.03 0.05', oct: 3, type: 'fractalNoise',
        matrix: '0.25 0 0 0 0.02  0 0.80 0 0 0.05  0 0 0.30 0 0.02  0 0 0 0 1',
        bg: '#08160a' },
      // PLASMA — psychedelic
      { freq: '0.012', oct: 4, type: 'fractalNoise',
        matrix: '1.00 0 0 0 0  0 0.30 0 0 0.05  0 0 0.95 0 0.05  0 0 0 0 1',
        bg: '#1a061a' },
      // BONE — pale cream texture (reads well in dark mode)
      { freq: '0.08 0.15', oct: 2, type: 'fractalNoise',
        matrix: '0.92 0 0 0 0.06  0 0.90 0 0 0.05  0 0 0.82 0 0.04  0 0 0 0 1',
        bg: '#3a3326' },
      // OXIDE — copper/teal mineral
      { freq: '0.018 0.04', oct: 3, type: 'fractalNoise',
        matrix: '0.55 0 0 0 0.05  0 0.85 0 0 0.05  0 0 0.65 0 0.05  0 0 0 0 1',
        bg: '#0a1a18' },
    ];
    const pick = recipes[Math.floor(Math.random() * recipes.length)];
    const seed = Math.floor(Math.random() * 100);
    return { ...pick, seed };
  }, []);

  return (
    <section style={{ position: 'relative', height: 'calc(100vh - 48px)', minHeight: 672, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <window.HeroField palette={palette} />
      </div>

      {/* Top-right counter */}
      <div style={{ position: 'absolute', top: 96, right: 28, textAlign: 'right', zIndex: 5 }}>
        <div className="micro">EST. 2024 · SACRAMENTO, CA</div>
        <div className="mono" style={{ fontSize: 11, marginTop: 6, letterSpacing: '0.1em' }}>
          UPTIME / {Math.floor(t)}.{String(Math.floor((t % 1) * 1000)).padStart(3, '0')}s
        </div>
      </div>

      {/* Bottom-anchored stack: featured cards → @spatio strip → AMBAVERSE title */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 60,
        padding: '0 28px',
        zIndex: 5,
        pointerEvents: 'none',
      }}>
        {/* Featured cards row */}
        <div style={{ pointerEvents: 'auto', marginBottom: 24 }}>
          <div className="micro" style={{ marginBottom: 10, opacity: 0.75 }}>// FEATURED · 03 SLOTS</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            maxWidth: 980,
          }}>
            {[
              { id: 'ft1', no: 'FT.01', title: 'UNTITLED', medium: 'Generative · forthcoming', year: '2026' },
              { id: 'ft2', no: 'FT.02', title: 'UNTITLED', medium: 'Print · forthcoming',       year: '2026' },
              { id: 'ft3', no: 'FT.03', title: 'UNTITLED', medium: 'Object · forthcoming',      year: '2026' },
            ].map((p) => {
              const Algo = window.GENERATIVE && window.GENERATIVE.placeholder;
              return (
                <a
                  key={p.id}
                  href="#gallery"
                  className="feature-card"
                  data-cursor="hover"
                  data-cursor-label={`VIEW · ${p.no}`}
                  style={{
                    background: 'var(--paper)',
                    border: '2px solid var(--ink)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    cursor: 'none',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    aspectRatio: '16 / 9',
                    borderBottom: '2px solid var(--ink)',
                    background: 'var(--paper)',
                    overflow: 'hidden',
                  }}>
                    {Algo && <div style={{ position: 'absolute', inset: 0 }}><Algo palette={palette} /></div>}
                    <div style={{
                      position: 'absolute',
                      top: 6, left: 6,
                      background: 'var(--ink)', color: 'var(--bg)',
                      padding: '3px 6px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                      zIndex: 2,
                    }}>
                      FEATURED · {p.no}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 12px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 10,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1 }}>{p.title}</div>
                      <div className="mono" style={{ fontSize: 9.5, color: 'var(--muted)', marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.medium}
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 9.5, letterSpacing: '0.1em', flex: '0 0 auto' }}>{p.year}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '4px 10px' }}>@spatiotemporality</span>
          <span className="serif" style={{ fontStyle: 'italic', textTransform: 'none', fontSize: 18, letterSpacing: 0 }}>— a computational art project by Shashank</span>
        </div>
        <svg
          viewBox="0 0 1200 240"
          preserveAspectRatio="xMidYMid meet"
          aria-label="AMBAVERSE"
          style={{ width: '100%', height: 'auto', maxHeight: '32vh', display: 'block', overflow: 'visible' }}
        >
          <defs>
            {/* Text mask — white inside the letters, black outside */}
            <mask id="amba-text-mask">
              <rect width="1200" height="240" fill="black" />
              <text
                x="600" y="180"
                textAnchor="middle"
                fontFamily="Space Grotesk, system-ui, sans-serif"
                fontWeight="800"
                fontSize="220"
                letterSpacing="-10"
                fill="white"
              >
                AMBAVERSE
              </text>
            </mask>

            {/* Procedural texture filter — feTurbulence noise tinted per recipe */}
            <filter id="amba-tex" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type={tex.type}
                baseFrequency={tex.freq}
                numOctaves={tex.oct}
                seed={tex.seed}
                stitchTiles="stitch"
              />
              <feColorMatrix type="matrix" values={tex.matrix} />
            </filter>
          </defs>

          {/* Everything inside this group is clipped to the AMBAVERSE letterforms */}
          <g mask="url(#amba-text-mask)">
            {/* Background tint colour for the recipe */}
            <rect width="1200" height="240" fill={tex.bg} />
            {/* The tinted noise texture itself */}
            <rect width="1200" height="240" filter="url(#amba-tex)" />
          </g>
        </svg>
      </div>

    </section>
  );
}

// ===== MARQUEE =====
function Marquee() {
  const items = [
    'CONSTRUCTION IN PROGRESS. LAUNCHING ON JUNE 15TH 2026',
  ];
  return (
    <div className="marquee">
      <div className="marquee-inner">
        {[0, 1].map(k => (
          <span key={k}>
            {items.map((it, i) => (
              <span key={i}>
                <span>{it}</span>
                <span>✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ===== GALLERY (uniform grid view, grouped by category) =====
function Gallery({ palette, onOpen }) {
  const [filter, setFilter] = useState('all'); // all | digital | physical
  const groups = [
    { key: 'digital',  label: 'Digital Works',  sub: 'screen-native · live · generative', accent: 'var(--cyan)' },
    { key: 'physical', label: 'Physical Works', sub: 'print · plotter · object',          accent: 'var(--magenta)' },
  ];

  const visibleGroups = filter === 'all' ? groups : groups.filter(g => g.key === filter);

  function renderCell(w, i, total) {
    const Algo = window.GENERATIVE[w.algo];
    const isPH = w.isPlaceholder;
    return (
      <div
        key={w.id}
        data-cursor={isPH ? undefined : "hover"}
        data-cursor-label={isPH ? undefined : "OPEN →"}
        onClick={() => { if (!isPH) onOpen(w); }}
        style={{
          position: 'relative',
          aspectRatio: '1 / 1',
          borderRight: (i + 1) % 6 === 0 ? 'none' : '1px solid var(--ink)',
          borderTop: '1px solid var(--ink)',
          background: 'var(--paper)',
          overflow: 'hidden',
          cursor: 'none',
        }}
        className="gallery-cell"
      >
        <div style={{ position: 'absolute', inset: 0 }}>
          <Algo palette={palette} />
        </div>

        <div className="gallery-overlay" style={{
          position: 'absolute', inset: 0,
          background: 'var(--ink)', color: 'var(--bg)',
          opacity: 0, transition: 'opacity .25s ease',
          padding: 20,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          zIndex: 2, pointerEvents: 'none',
        }}>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--acid)' }}>
            {w.no} · {w.category.toUpperCase()}
          </div>
          {isPH ? (
            <div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Awaiting<br/>upload
              </div>
              <div className="serif" style={{ fontStyle: 'italic', fontSize: 15, opacity: 0.7, marginTop: 8 }}>
                slot reserved · {w.category}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1 }}>{w.title}</div>
              <div className="serif" style={{ fontStyle: 'italic', fontSize: 15, opacity: 0.8, marginTop: 6 }}>{w.medium}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                {w.tags.map(t => (
                  <span key={t} className="mono" style={{ fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid var(--bg)', padding: '2px 6px' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>{w.year}</span>
            <span style={{ color: isPH ? 'var(--muted)' : 'var(--acid)' }}>
              {isPH ? '— PENDING —' : 'OPEN →'}
            </span>
          </div>
        </div>

        <div className="gallery-strip" style={{
          position: 'absolute', left: 0, right: 0, bottom: 0,
          padding: '8px 12px',
          background: 'var(--bg)',
          borderTop: '1px solid var(--ink)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
          zIndex: 1, transition: 'opacity .25s ease',
        }}>
          <span>{w.no} · {isPH ? 'placeholder' : w.title}</span>
          <span>{w.year}</span>
        </div>
      </div>
    );
  }

  return (
    <section id="gallery">
      <div className="section-head">
        <div>
          <div className="num">// SECTION 01 — GALLERY</div>
          <h2>Gallery <span className="serif" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>/ live renders</span></h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: 'column' }}>
          <div className="micro">{WORKS.length} WORKS · {WORKS.filter(w=>w.category==='digital').length} DIGITAL · {WORKS.filter(w=>w.category==='physical').length} PHYSICAL</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { k: 'all', label: 'ALL' },
              { k: 'digital', label: 'DIGITAL' },
              { k: 'physical', label: 'PHYSICAL' },
            ].map(opt => (
              <button
                key={opt.k}
                onClick={() => setFilter(opt.k)}
                data-cursor="hover"
                style={{
                  padding: '6px 12px',
                  border: '1.5px solid var(--ink)',
                  background: filter === opt.k ? 'var(--ink)' : 'var(--bg)',
                  color: filter === opt.k ? 'var(--bg)' : 'var(--ink)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  cursor: 'none',
                  borderRadius: 0,
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleGroups.map((g) => {
        const items = WORKS.filter(w => w.category === g.key);
        return (
          <div key={g.key}>
            {/* Category divider */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              padding: '36px 28px 18px',
              borderBottom: '1px dashed var(--ink)',
              gap: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{
                  background: g.accent,
                  color: 'var(--ink)',
                  border: '1.5px solid var(--ink)',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                  padding: '4px 10px',
                }}>
                  {g.key === 'digital' ? '◐' : '◼'} {g.key}
                </span>
                <h3 style={{
                  fontSize: 'clamp(28px, 4vw, 56px)',
                  margin: 0, fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {g.label} <span className="serif" style={{ fontStyle: 'italic', color: 'var(--muted)', fontWeight: 400 }}>— {g.sub}</span>
                </h3>
              </div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {String(items.length).padStart(2, '0')} works
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: 0,
              borderBottom: '2px solid var(--ink)',
            }}>
              {items.map((w, i) => renderCell(w, i, items.length))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Archive({ palette, onOpen }) {
  const plotRef = useR(null);
  const [size, setSize] = useState({ w: 1400, h: 900 });
  const [cursor, setCursor] = useState({ x: 0.5, y: 0.5 });

  useFx(() => {
    function measure() {
      if (plotRef.current) {
        const r = plotRef.current.getBoundingClientRect();
        setSize({ w: r.width, h: r.height });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  function onMove(e) {
    if (!plotRef.current) return;
    const r = plotRef.current.getBoundingClientRect();
    setCursor({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  }

  // axes labels
  return (
    <section id="work">
      <div className="section-head">
        <div>
          <div className="num">// SECTION 02 — INDEX OF WORKS</div>
          <h2>The Index <span className="serif" style={{ fontStyle: 'italic', color: 'var(--muted)' }}>/ plotted in space &amp; time</span></h2>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexDirection: 'column' }}>
          <div className="micro">{WORKS.length} WORKS · 2023 → 2025</div>
          <div className="mono" style={{ fontSize: 11 }}>X-AXIS: TIME &nbsp;·&nbsp; Y-AXIS: MATERIALITY</div>
        </div>
      </div>

      <div
        ref={plotRef}
        onMouseMove={onMove}
        style={{
          position: 'relative',
          height: 780,
          background:
            `repeating-linear-gradient(to right, transparent 0 calc(10% - 1px), rgba(11,11,14,0.06) calc(10% - 1px) 10%),
             repeating-linear-gradient(to bottom, transparent 0 calc(10% - 1px), rgba(11,11,14,0.06) calc(10% - 1px) 10%),
             var(--bg)`,
          overflow: 'hidden',
          borderBottom: '2px solid var(--ink)',
        }}
      >
        {/* Axis lines */}
        <div style={{ position: 'absolute', left: 60, top: 30, bottom: 30, width: 1, background: 'var(--ink)' }} />
        <div style={{ position: 'absolute', left: 60, right: 30, bottom: 50, height: 1, background: 'var(--ink)' }} />

        {/* Axis tick labels */}
        {['2023', '2024', '2025', '2026'].map((y, i) => (
          <div key={y} className="mono" style={{
            position: 'absolute',
            left: `calc(60px + ${(i + 0.2) * 22}%)`,
            bottom: 26, fontSize: 10, letterSpacing: '0.1em'
          }}>{y}</div>
        ))}
        {['DIGITAL', 'HYBRID', 'PHYSICAL'].map((y, i) => (
          <div key={y} className="mono" style={{
            position: 'absolute',
            left: 14, top: `${15 + i * 30}%`, fontSize: 10, letterSpacing: '0.1em'
          }}>{y}</div>
        ))}
        <div className="mono" style={{ position: 'absolute', left: 60, bottom: 8, fontSize: 10 }}>TIME →</div>
        <div className="mono" style={{ position: 'absolute', top: 30, left: 8, fontSize: 10, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>↑ MATERIAL</div>

        {/* Cursor crosshair */}
        <div style={{
          position: 'absolute', top: 30, bottom: 50,
          left: `${cursor.x * 100}%`, width: 1, background: 'var(--magenta)', opacity: 0.35
        }} />
        <div style={{
          position: 'absolute', left: 60, right: 30,
          top: `${cursor.y * 100}%`, height: 1, background: 'var(--magenta)', opacity: 0.35
        }} />

        {/* Work tiles */}
        {WORKS.map((w, i) => {
          const Algo = window.GENERATIVE[w.algo];
          const left = 60 + (w.x * (size.w - 60 - 30 - w.w));
          const top = 30 + (w.y * (size.h - 30 - 50 - w.h));
          return (
            <div
              key={w.id}
              className="tile"
              data-cursor="hover"
              data-cursor-label="OPEN →"
              onClick={() => onOpen(w)}
              style={{
                left, top,
                width: w.w, height: w.h,
                zIndex: 10 + i,
              }}
            >
              <span className="tile-label">{w.no} · {w.title}</span>
              <span className="tile-meta">{w.year}</span>
              <div style={{ width: '100%', height: '100%' }}>
                <Algo palette={palette} />
              </div>
            </div>
          );
        })}

        {/* Legend tile bottom-right */}
        <div style={{
          position: 'absolute', right: 18, bottom: 60,
          background: 'var(--paper)',
          border: '1.5px solid var(--ink)',
          padding: '14px 16px',
          maxWidth: 280,
        }}>
          <div className="micro" style={{ marginBottom: 8 }}>HOW TO READ THIS</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.45 }}>
            Each tile is a live render of an actual work. Hover to magnify, click to open the full piece with notes and runtime.
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== DETAIL MODAL =====
function Detail({ work, palette, onClose }) {
  useFx(() => {
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  if (!work) return null;
  const Algo = window.GENERATIVE[work.algo];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="canvas-pane">
          <Algo palette={palette} />
          <button className="close" onClick={onClose} data-cursor="hover" data-cursor-label="CLOSE">×</button>
        </div>
        <div className="meta-pane">
          <div className="micro" style={{ marginBottom: 14 }}>{work.no} · WORK ENTRY</div>
          <h3>{work.title}</h3>
          <div className="serif" style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 18, fontStyle: 'italic' }}>{work.year} — {work.medium}</div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {work.tags.map(t => <span key={t} className="tag">{t}</span>)}
            <span className="tag solid">{work.edition}</span>
          </div>

          <p style={{ fontSize: 15.5, lineHeight: 1.55 }}>{work.blurb}</p>

          <div style={{ marginTop: 20, padding: '14px 0', borderTop: '1px solid var(--ink)' }}>
            <div className="micro" style={{ marginBottom: 8 }}>RUNTIME PARAMETERS</div>
            <table className="mono" style={{ fontSize: 11.5, width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '4px 0', opacity: 0.6 }}>algorithm</td><td>{work.algo}</td></tr>
                <tr><td style={{ padding: '4px 0', opacity: 0.6 }}>seed</td><td>0x{(work.id.charCodeAt(0) * 17).toString(16)}…</td></tr>
                <tr><td style={{ padding: '4px 0', opacity: 0.6 }}>edition</td><td>{work.edition}</td></tr>
                <tr><td style={{ padding: '4px 0', opacity: 0.6 }}>medium</td><td>{work.medium}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <a className="btn mag" href="#contact" onClick={onClose} data-cursor="hover" data-cursor-label="INQUIRE">Inquire</a>
            <button className="btn" data-cursor="hover" data-cursor-label="RESEED" style={{ cursor: 'none' }} onClick={() => { /* reseed = remount */ }}>↻ Reseed</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== PROCESS =====
function Process() {
  const steps = [
    { n: '01', name: 'Read', desc: 'A question pulled from physics, biology, or daily walking. Notebook fills before any code is opened.', tools: 'PAPER / GRAPH / INK' },
    { n: '02', name: 'Sketch', desc: 'Twenty bad versions, fast. Most are static; a few suggest a generator.', tools: 'p5 / OBSERVABLE' },
    { n: '03', name: 'System', desc: 'The chosen sketch becomes a system — parameters, ranges, edges. The work is the system.', tools: 'TYPESCRIPT / GLSL' },
    { n: '04', name: 'Tune', desc: 'Iteration on parameter space. The system performs hundreds of times; one performance is selected, or all are kept.', tools: 'CUSTOM TOOLING' },
    { n: '05', name: 'Render', desc: 'The output lives on a screen, in print, on a plotter, or as a live runtime. Material is a late decision.', tools: 'AXIDRAW / RISO / WEBGL' },
  ];
  return (
    <section id="process">
      <div className="section-head">
        <div>
          <div className="num">// SECTION 02 — METHOD</div>
          <h2>How the work is made</h2>
        </div>
        <div className="serif" style={{ fontSize: 22, fontStyle: 'italic', textAlign: 'right', maxWidth: 380, lineHeight: 1.2 }}>
          a five-step practice, repeated until something refuses to be improved.
        </div>
      </div>
      <div>
        {steps.map(s => (
          <div className="step" key={s.n} data-cursor="hover" data-cursor-label={s.name.toUpperCase()}>
            <div className="step-num">{s.n} /</div>
            <h3 className="step-name">{s.name}</h3>
            <div className="step-desc">{s.desc}</div>
            <div className="step-tools">{s.tools}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== ABOUT =====
// ===== ABOUT + CONTACT (merged into a single page) =====
function AboutContact({ palette }) {
  const [hover, setHover] = useState(false);
  return (
    <section id="about">
      <div className="section-head">
        <div>
          <div className="num">// SECTION 02 — PROFILE & CONTACT</div>
          <h2>About the practice</h2>
        </div>
        <div className="micro">EST. 2024</div>
      </div>

      <div className="about-grid">
        <div>
          <div className="serif" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)', lineHeight: 1.15, fontStyle: 'italic', marginBottom: 24 }}>
            <span>Ambaverse</span> is the computational art project of <span style={{ background: 'var(--acid)', color: '#0b0b0e', padding: '0 8px' }}>Shashank</span>, an engineer-artist based in Greater Sacramento, CA.
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 560 }}>
            Practicing print, plotter drawings, interactive installations and audio-reactive performances. The constant is a refusal to treat code as a tool — it is the medium itself, with its own affordances and refusals.
          </p>
        </div>

        <div style={{ background: '#0b0b0e', color: '#f3efe4' }}>
          <div className="micro" style={{ color: 'var(--cyan)', marginBottom: 12 }}>// STACK</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['TypeScript', 'GLSL', 'p5.js', 'Three.js', 'Canvas2D', 'AxiDraw', 'Risograph', 'Houdini', 'Max/MSP', 'Figma', 'Vim', 'TouchDesigner'].map(t => (
              <span key={t} className="tag" style={{ background: 'transparent', color: '#f3efe4', borderColor: 'rgba(243,239,228,0.4)' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Contact content — flows on the same background as the about section */}
      <div style={{ padding: '40px 28px 28px', borderTop: '1px solid var(--ink)' }}>
        <h2 className="contact-headline" style={{ color: 'var(--ink)' }}>
          Let's make <span className="serif" style={{ color: 'var(--magenta)' }}>something</span><br/>
          that doesn't <span style={{ background: 'var(--acid)', color: '#0b0b0e', padding: '0 8px' }}>repeat.</span>
        </h2>

        <div style={{ marginTop: 48 }}>
          <div className="micro" style={{ color: 'var(--muted)', marginBottom: 14 }}>FIND ME ON INSTAGRAM</div>
          <a
            href="https://www.instagram.com/spaciotemporality"
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 'clamp(32px, 5vw, 64px)', display: 'inline-block', position: 'relative', color: 'var(--ink)', textDecoration: 'none' }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            data-cursor="hover" data-cursor-label="OPEN →"
          >
            @spaciotemporality
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: -4, height: hover ? 6 : 1,
              background: 'var(--acid)', transition: 'height .2s ease'
            }}></span>
          </a>
        </div>

        <div style={{ marginTop: 64, padding: '20px 24px', border: '1.5px solid var(--ink)', background: 'rgba(11,11,14,0.03)' }}>
          <div className="micro" style={{ color: 'var(--muted)', marginBottom: 10 }}>// LEGAL NOTICE</div>
          <div className="serif" style={{ fontSize: 20, lineHeight: 1.3, fontStyle: 'italic', maxWidth: 880, marginBottom: 12, color: 'var(--ink)' }}>
            All works on this site are <span style={{ background: 'var(--acid)', color: '#0b0b0e', padding: '0 6px' }}>© Shashank / Ambaverse</span>. All rights reserved.
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.55, maxWidth: 780, color: 'var(--muted)', margin: 0 }}>
            No portion of these works — including images, source code, generative outputs, video captures, prints, and derivative renderings — may be reproduced, distributed, displayed, transmitted, modified, or used to train any machine-learning model without explicit prior written permission from the artist. Quotation for criticism or journalism is welcome with attribution; everything else requires a license. Inquiries via Instagram DM.
          </p>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ink)', display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          <span>© 2024–2026 SHASHANK / AMBAVERSE · ALL RIGHTS RESERVED</span>
          <span>SITE COMPILED {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} · BUILD f3a91d</span>
          <span>NO TRACKERS · NO COOKIES</span>
        </div>
        <div style={{ marginTop: 14, fontSize: 10.5, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Custom theme with Claude Design and Claude Code
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  Nav, Hero, Marquee, Gallery, Archive, Detail, Process, AboutContact,
  WORKS,
});
