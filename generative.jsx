// Real generative algorithms. Each export is a React component that mounts a <canvas>
// and runs an animation loop. They share a small base hook.

const { useEffect, useRef } = React;

function useAnimatedCanvas(draw, deps = []) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let mounted = true;
    let state = {};
    let t0 = performance.now();

    function resize() {
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state = draw.init ? draw.init(ctx, r.width, r.height) || {} : {};
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function loop(now) {
      if (!mounted) return;
      const t = (now - t0) / 1000;
      const r = canvas.getBoundingClientRect();
      draw.frame(ctx, r.width, r.height, t, state);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => { mounted = false; cancelAnimationFrame(raf); ro.disconnect(); };
  }, deps);

  return ref;
}

// Simplified 2D noise via sin-cos blend (fast, no external lib).
function pseudoNoise(x, y, t) {
  return (
    Math.sin(x * 0.6 + t * 0.5) * 0.4 +
    Math.cos(y * 0.5 - t * 0.3) * 0.4 +
    Math.sin((x + y) * 0.3 + t) * 0.2
  );
}

// ============ 1. FLOW FIELD (particles) ============
function FlowField({ palette }) {
  const ref = useAnimatedCanvas({
    init(ctx, w, h) {
      const n = Math.min(420, Math.floor(w * h / 220));
      const particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          c: i % 4,
        });
      }
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      return { particles };
    },
    frame(ctx, w, h, t, s) {
      ctx.fillStyle = palette.bg + 'cc';
      ctx.fillRect(0, 0, w, h);
      const cols = [palette.acid, palette.magenta, palette.cyan, palette.ink];
      for (const p of s.particles) {
        const a = pseudoNoise(p.x * 0.012, p.y * 0.012, t * 0.4) * Math.PI * 2;
        p.x += Math.cos(a) * 0.9;
        p.y += Math.sin(a) * 0.9;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
          p.x = Math.random() * w; p.y = Math.random() * h;
        }
        ctx.fillStyle = cols[p.c];
        ctx.fillRect(p.x, p.y, 1.4, 1.4);
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 2. STRANGE ATTRACTOR (Clifford) ============
function Attractor({ palette }) {
  const ref = useAnimatedCanvas({
    init(ctx, w, h) {
      ctx.fillStyle = palette.ink;
      ctx.fillRect(0, 0, w, h);
      return { x: 0.1, y: 0.1, a: -1.4, b: 1.6, c: 1.0, d: 0.7, count: 0 };
    },
    frame(ctx, w, h, t, s) {
      // mild parameter drift = "spaciotemporal"
      s.a = -1.4 + Math.sin(t * 0.1) * 0.2;
      s.b = 1.6 + Math.cos(t * 0.07) * 0.2;
      ctx.fillStyle = palette.ink + '10';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, sc = Math.min(w, h) / 5;
      for (let i = 0; i < 4000; i++) {
        const nx = Math.sin(s.a * s.y) + s.c * Math.cos(s.a * s.x);
        const ny = Math.sin(s.b * s.x) + s.d * Math.cos(s.b * s.y);
        s.x = nx; s.y = ny;
        const px = cx + s.x * sc;
        const py = cy + s.y * sc;
        const hue = (s.x + s.y + 4) / 8;
        ctx.fillStyle = hue > 0.5 ? palette.acid + 'aa' : palette.magenta + 'aa';
        ctx.fillRect(px, py, 0.9, 0.9);
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block', background: palette.ink }} />;
}

// ============ 3. MOIRÉ / PHASE SHIFT ============
function Moire({ palette }) {
  const ref = useAnimatedCanvas({
    init() { return {}; },
    frame(ctx, w, h, t) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      ctx.lineWidth = 1;
      ctx.strokeStyle = palette.ink;
      for (let r = 4; r < Math.max(w, h); r += 6) {
        ctx.beginPath();
        ctx.arc(cx + Math.sin(t * 0.6) * 12, cy + Math.cos(t * 0.7) * 12, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = palette.magenta;
      for (let r = 4; r < Math.max(w, h); r += 6) {
        ctx.beginPath();
        ctx.arc(cx - Math.sin(t * 0.6) * 12, cy - Math.cos(t * 0.7) * 12, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 4. VORONOI (cell tessellation, slow drift) ============
function Voronoi({ palette }) {
  const ref = useAnimatedCanvas({
    init(ctx, w, h) {
      const pts = [];
      const n = 14;
      for (let i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, c: i % 5 });
      }
      return { pts };
    },
    frame(ctx, w, h, t, s) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      for (const p of s.pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
      }
      const cols = [palette.acid, palette.magenta, palette.cyan, palette.bg, palette.ink];
      const step = 6;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          let best = 0, bd = Infinity;
          for (let i = 0; i < s.pts.length; i++) {
            const dx = s.pts[i].x - x, dy = s.pts[i].y - y;
            const d = dx * dx + dy * dy;
            if (d < bd) { bd = d; best = i; }
          }
          ctx.fillStyle = cols[s.pts[best].c];
          ctx.fillRect(x, y, step, step);
        }
      }
      // cell points
      ctx.fillStyle = palette.ink;
      for (const p of s.pts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 5. WAVE INTERFERENCE ============
function Waves({ palette }) {
  const ref = useAnimatedCanvas({
    init() { return {}; },
    frame(ctx, w, h, t) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      const lines = 26;
      for (let i = 0; i < lines; i++) {
        const yy = (i + 0.5) * h / lines;
        ctx.beginPath();
        const amp = 14 + i * 0.6;
        for (let x = 0; x <= w; x += 4) {
          const y = yy + Math.sin(x * 0.02 + t * 1.3 + i * 0.4) * amp
                        + Math.cos(x * 0.011 - t * 0.7 + i * 0.2) * amp * 0.5;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = i % 3 === 0 ? palette.magenta : palette.ink;
        ctx.lineWidth = i % 3 === 0 ? 2 : 1;
        ctx.stroke();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 6. RECURSIVE / FRACTAL TREE ============
function FractalTree({ palette }) {
  const ref = useAnimatedCanvas({
    init() { return {}; },
    frame(ctx, w, h, t) {
      ctx.fillStyle = palette.ink;
      ctx.fillRect(0, 0, w, h);
      const baseAngle = -Math.PI / 2 + Math.sin(t * 0.3) * 0.1;
      const branchAngle = 0.4 + Math.sin(t * 0.4) * 0.18;

      function branch(x, y, len, ang, depth) {
        if (depth === 0 || len < 2) return;
        const x2 = x + Math.cos(ang) * len;
        const y2 = y + Math.sin(ang) * len;
        ctx.strokeStyle = depth > 6 ? palette.bg : (depth > 3 ? palette.acid : palette.magenta);
        ctx.lineWidth = depth * 0.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
        branch(x2, y2, len * 0.74, ang - branchAngle, depth - 1);
        branch(x2, y2, len * 0.74, ang + branchAngle, depth - 1);
      }
      branch(w / 2, h * 0.95, Math.min(w, h) * 0.22, baseAngle, 10);
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 7. 3D WIREFRAME MESH ============
function Mesh3D({ palette }) {
  const ref = useAnimatedCanvas({
    init() {
      const pts = [];
      const N = 14;
      for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
          pts.push({ u: i / N - 0.5, v: j / N - 0.5 });
        }
      }
      return { pts, N };
    },
    frame(ctx, w, h, t, s) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const cosY = Math.cos(t * 0.5), sinY = Math.sin(t * 0.5);
      const cosX = Math.cos(0.55 + Math.sin(t * 0.2) * 0.1), sinX = Math.sin(0.55 + Math.sin(t * 0.2) * 0.1);
      const sc = Math.min(w, h) * 0.7;
      const project = (u, v) => {
        const z = Math.sin(u * 4 + t * 1.2) * 0.12 + Math.cos(v * 4 - t) * 0.12;
        let x = u, y = v, zz = z;
        // rotate Y
        let nx = x * cosY - zz * sinY;
        let nz = x * sinY + zz * cosY;
        x = nx; zz = nz;
        // rotate X
        let ny = y * cosX - zz * sinX;
        nz = y * sinX + zz * cosX;
        y = ny; zz = nz;
        const persp = 2 / (2 + zz);
        return [cx + x * sc * persp, cy + y * sc * persp, zz];
      };
      const N = s.N;
      const idx = (i, j) => i * (N + 1) + j;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1;
      for (let i = 0; i <= N; i++) {
        ctx.beginPath();
        for (let j = 0; j <= N; j++) {
          const p = s.pts[idx(i, j)];
          const [x, y] = project(p.u, p.v);
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.strokeStyle = palette.cyan;
      for (let j = 0; j <= N; j++) {
        ctx.beginPath();
        for (let i = 0; i <= N; i++) {
          const p = s.pts[idx(i, j)];
          const [x, y] = project(p.u, p.v);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 8. CHROMA / GRADIENT FIELD ============
function Chroma({ palette }) {
  const ref = useAnimatedCanvas({
    init() { return {}; },
    frame(ctx, w, h, t) {
      const tile = 14;
      for (let y = 0; y < h; y += tile) {
        for (let x = 0; x < w; x += tile) {
          const n = pseudoNoise(x * 0.02, y * 0.02, t * 0.6);
          let col;
          if (n > 0.5) col = palette.acid;
          else if (n > 0.1) col = palette.cyan;
          else if (n > -0.3) col = palette.magenta;
          else col = palette.ink;
          ctx.fillStyle = col;
          ctx.fillRect(x, y, tile, tile);
        }
      }
      // overlay grid
      ctx.strokeStyle = palette.bg + '40';
      for (let x = 0; x < w; x += tile) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ 9. CIRCLE PACKING (animated radius) ============
function Packing({ palette }) {
  const ref = useAnimatedCanvas({
    init(ctx, w, h) {
      const circles = [];
      const tries = 1200;
      let attempts = 0;
      while (circles.length < 80 && attempts++ < tries * 6) {
        const r = 4 + Math.random() * 40;
        const x = r + Math.random() * (w - 2 * r);
        const y = r + Math.random() * (h - 2 * r);
        let ok = true;
        for (const c of circles) {
          const dx = c.x - x, dy = c.y - y;
          if (Math.sqrt(dx * dx + dy * dy) < c.r + r + 2) { ok = false; break; }
        }
        if (ok) circles.push({ x, y, r, c: Math.floor(Math.random() * 4), ph: Math.random() * Math.PI * 2 });
      }
      return { circles };
    },
    frame(ctx, w, h, t, s) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      const cols = [palette.magenta, palette.acid, palette.cyan, palette.ink];
      for (const c of s.circles) {
        const r = c.r * (0.7 + 0.3 * Math.sin(t * 1.3 + c.ph));
        ctx.fillStyle = cols[c.c];
        ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = palette.ink;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ HERO BIG FIELD ============
function HeroField({ palette, intensity = 1 }) {
  const ref = useAnimatedCanvas({
    init(ctx, w, h) {
      const n = Math.min(900, Math.floor(w * h / 1400));
      const particles = [];
      for (let i = 0; i < n; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          px: 0, py: 0,
          c: i % 5,
        });
      }
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      return { particles, mouse: { x: w / 2, y: h / 2 } };
    },
    frame(ctx, w, h, t, s) {
      ctx.fillStyle = palette.bg + 'a0';
      ctx.fillRect(0, 0, w, h);
      const cols = [palette.magenta, palette.cyan, palette.acid, palette.ink, palette.violet];
      const mx = window.__heroMouseX != null ? window.__heroMouseX : w / 2;
      const my = window.__heroMouseY != null ? window.__heroMouseY : h / 2;
      for (const p of s.particles) {
        const dx = mx - p.x, dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        const repel = d2 < 30000 ? 60 / (Math.sqrt(d2) + 5) : 0;
        const a = pseudoNoise(p.x * 0.006, p.y * 0.006, t * 0.3) * Math.PI * 2;
        p.px = p.x; p.py = p.y;
        p.x += Math.cos(a) * 1.1 * intensity - (dx / Math.sqrt(d2 + 0.1)) * repel;
        p.y += Math.sin(a) * 1.1 * intensity - (dy / Math.sqrt(d2 + 0.1)) * repel;
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          p.x = Math.random() * w; p.y = Math.random() * h;
          p.px = p.x; p.py = p.y;
        }
        ctx.strokeStyle = cols[p.c];
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    }
  }, [palette, intensity]);

  useEffect(() => {
    const onMove = (e) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      window.__heroMouseX = e.clientX - r.left;
      window.__heroMouseY = e.clientY - r.top;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// ============ PLACEHOLDER (empty slot, diagonal hatch) ============
function Placeholder({ palette }) {
  // Static, no animation — keeps a slow drift so the page doesn't feel dead.
  const ref = useAnimatedCanvas({
    init() { return {}; },
    frame(ctx, w, h, t) {
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);

      // diagonal hatch
      ctx.strokeStyle = palette.ink + '22';
      ctx.lineWidth = 1;
      const step = 14;
      const offset = (t * 6) % step;
      for (let i = -h; i < w + h; i += step) {
        ctx.beginPath();
        ctx.moveTo(i + offset, 0);
        ctx.lineTo(i + offset - h, h);
        ctx.stroke();
      }

      // center cross-mark + ring
      const cx = w / 2, cy = h / 2;
      const r = Math.min(w, h) * 0.18;
      ctx.strokeStyle = palette.ink;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // small + tick at center
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy); ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8); ctx.lineTo(cx, cy + 8);
      ctx.stroke();

      // corner ticks
      const m = 12, tk = 14;
      ctx.beginPath();
      ctx.moveTo(m, m); ctx.lineTo(m + tk, m); ctx.moveTo(m, m); ctx.lineTo(m, m + tk);
      ctx.moveTo(w - m, m); ctx.lineTo(w - m - tk, m); ctx.moveTo(w - m, m); ctx.lineTo(w - m, m + tk);
      ctx.moveTo(m, h - m); ctx.lineTo(m + tk, h - m); ctx.moveTo(m, h - m); ctx.lineTo(m, h - m - tk);
      ctx.moveTo(w - m, h - m); ctx.lineTo(w - m - tk, h - m); ctx.moveTo(w - m, h - m); ctx.lineTo(w - m, h - m - tk);
      ctx.stroke();
    }
  }, [palette]);
  return <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

// Register lookup
const GENERATIVE = {
  flowfield: FlowField,
  attractor: Attractor,
  moire: Moire,
  voronoi: Voronoi,
  waves: Waves,
  fractal: FractalTree,
  mesh: Mesh3D,
  chroma: Chroma,
  packing: Packing,
  hero: HeroField,
  placeholder: Placeholder,
};

Object.assign(window, {
  GENERATIVE,
  HeroField,
  FlowField, Attractor, Moire, Voronoi, Waves, FractalTree, Mesh3D, Chroma, Packing,
});
