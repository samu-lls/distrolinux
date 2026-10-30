// Motor da Wiki: plano infinito quadriculado com gotas d'água (metaballs) renderizadas em WebGL.
// As gotas refratam o quadriculado, afundam sob o "dedo" (mouse) e se dividem ao expandir.

import type { WikiNode } from '../data/wiki';

const MAX = 64;
const RADII = [110, 72, 54, 44];
// distância mínima entre gotas, em múltiplos da soma dos raios (abaixo disso os campos se fundem)
const GAP = 1.35;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec3 uCam;      // x, y do centro no mundo, z = zoom
uniform float uTime, uDpr, uDent, uDark;
uniform vec4 uDrop[${MAX}];  // x, y, raio, escala
uniform vec4 uWob[${MAX}];   // balanço, -, -, selecionada
uniform int uCount;
uniform vec2 uMouse;
uniform vec3 uBg, uLine, uMajor, uRim, uAccent;
// campo de cada gota alcança 1,3× o raio; T = (1 - 1/1.69)² põe a borda exatamente no raio
const float T = 0.1665;

float gridA(vec2 p, float s, float px) {
  vec2 g = abs(fract(p / s - 0.5) - 0.5) * s;
  return 1.0 - smoothstep(0.0, px, min(g.x, g.y));
}
vec3 bg(vec2 p) {
  float px = 1.0 / uCam.z;
  float minor = gridA(p, 40.0, px) * smoothstep(0.25, 0.6, uCam.z);
  float major = gridA(p, 200.0, px * 1.2);
  return mix(mix(uBg, uLine, minor), uMajor, major);
}

void main() {
  vec2 res = uRes / uDpr;
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 p = uCam.xy + (frag - res * 0.5) / uCam.z;

  float f = 0.0, fs = 0.0, kw = 0.0, rw = 0.0, sel = 0.0;
  vec2 G = vec2(0.0);
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec4 d = uDrop[i];
    vec4 w = uWob[i];
    float r = d.z * d.w;
    if (r < 0.5) continue;
    vec2 q = p - d.xy;
    float fi = float(i);
    float ang = atan(q.y, q.x);
    // borda ondulando quando a gota é mexida
    float rr = r * (1.0 + w.x * (0.06 * sin(3.0 * ang + uTime * 6.0 + fi) + 0.04 * sin(5.0 * ang - uTime * 8.0 + fi * 2.0)));
    float R2 = rr * rr * 1.69;
    float d2 = dot(q, q);
    if (d2 < R2) {
      float t = 1.0 - d2 / R2;
      float k = t * t;
      f += k;
      G += -4.0 * t * q / R2;
      kw += k;
      rw += k * r;
      sel += k * w.w;
    }
    vec2 qs = q - vec2(r * 0.12, r * 0.22);
    float Rs2 = r * r * 3.6;
    float ds2 = dot(qs, qs);
    if (ds2 < Rs2) { float ts = 1.0 - ds2 / Rs2; fs += ts * ts; }
  }

  vec3 col = bg(p) * (1.0 - smoothstep(0.1, 0.6, fs) * mix(0.07, 0.3, uDark));

  if (f > T * 0.6) {
    float rL = rw / max(kw, 1e-4);
    float h = sqrt(clamp((f - T) / (1.0 - T), 0.0, 1.0));
    vec2 gh = G / ((1.0 - T) * 2.0 * max(h, 0.08));

    // o "dedo": afunda a superfície perto do mouse
    vec2 dm = p - uMouse;
    float s2 = rL * rL * 0.12;
    float D = uDent * exp(-dot(dm, dm) / s2);
    float h2 = h * (1.0 - D);
    gh = gh * (1.0 - D) + h * (2.0 * dm / s2 * D);

    vec2 slope = gh * 0.5 * rL;
    float sl = length(slope);
    if (sl > 6.0) slope *= 6.0 / sl;
    vec3 n = normalize(vec3(-slope, 1.0));

    // refração: a gota funciona como lente e amplia o quadriculado
    vec3 c = bg(p - n.xy * h2 * rL * 0.55);
    c *= mix(vec3(0.985, 0.99, 1.0), vec3(1.04, 1.06, 1.09), uDark);
    // borda escura fina, mais forte do lado da luz (como a gota da foto)
    vec3 L = normalize(vec3(-0.45, -0.6, 0.75));
    float fres = pow(1.0 - n.z, 3.0);
    float side = 0.55 + 0.45 * dot(normalize(n.xy + 1e-4), L.xy);
    c = mix(c, uRim, clamp(fres * 1.1 * side, 0.0, 0.85));

    // reflexos: um ponto nítido e uma "janela" suave
    float nh = max(dot(n, normalize(L + vec3(0.0, 0.0, 1.0))), 0.0);
    c += vec3(pow(nh, 600.0) * 1.2 + pow(nh, 40.0) * 0.1);
    // reflexo de "janela": faixa curva e estreita perto da borda iluminada
    vec2 win = (n.xy - vec2(-0.42, -0.5)) * vec2(1.0, 2.2);
    c += smoothstep(0.02, 0.0, dot(win, win)) * 0.28;
    // cáustica: luz concentrada do lado oposto, dentro da gota
    float caus = smoothstep(0.1, 0.9, dot(normalize(n.xy + 1e-4), -L.xy)) * smoothstep(0.0, 0.35, h2) * (1.0 - h2) * length(n.xy) * 1.6;
    c += caus * mix(0.3, 0.16, uDark);
    c = mix(c, uAccent, clamp(sel / max(kw, 1e-4), 0.0, 1.0) * fres * 0.7);

    float inside = clamp((f - T) / max(length(G) / uCam.z * 1.2, 1e-4), 0.0, 1.0);
    col = mix(col, c, inside);
  }
  gl_FragColor = vec4(col, 1.0);
}`;

interface Drop {
  node: WikiNode;
  depth: number;
  r: number;
  x: number; y: number; vx: number; vy: number; tx: number; ty: number;
  s: number; ts: number;
  wob: number;
  px: number; py: number; tpx: number; tpy: number;
  expanded: boolean;
  dying: boolean;
  label: HTMLElement;
  link?: SVGLineElement; // linha até a gota mãe
}

const THEMES = {
  light: { bg: [0.957, 0.945, 0.918], line: [0.94, 0.927, 0.898], major: [0.925, 0.911, 0.88], rim: [0.45, 0.42, 0.38], accent: [0, 0.44, 0.89], dark: 0 },
  dark: { bg: [0.102, 0.094, 0.086], line: [0.12, 0.112, 0.104], major: [0.142, 0.133, 0.124], rim: [0.6, 0.57, 0.53], accent: [0.16, 0.59, 1], dark: 1 },
};

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  labels: HTMLElement;
  nodes: WikiNode[];
  logos: Record<string, { path?: string; color?: string; src?: string }>;
  onSelect: (node: WikiNode | null) => void;
  panelWidth: () => number; // largura do painel lateral aberto (para centralizar a câmera)
  panelHeight?: () => number; // altura do painel quando ele sobe de baixo (celular)
}

export function createEngine(opts: EngineOptions) {
  const { canvas, labels, nodes, onSelect } = opts;
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;

  const reduced = document.documentElement.classList.contains('reduced');
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const kids = new Map<string, WikiNode[]>();
  nodes.forEach((n) => n.parent && kids.set(n.parent, [...(kids.get(n.parent) ?? []), n]));
  const root = nodes.find((n) => n.kind === 'root')!;

  /* ---------- WebGL ---------- */
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const u = {
    res: U('uRes'), cam: U('uCam'), time: U('uTime'), dpr: U('uDpr'), dent: U('uDent'), dark: U('uDark'),
    drop: U('uDrop'), wob: U('uWob'), count: U('uCount'), mouse: U('uMouse'),
    bg: U('uBg'), line: U('uLine'), major: U('uMajor'), rim: U('uRim'), accent: U('uAccent'),
  };
  const dropBuf = new Float32Array(MAX * 4);
  const wobBuf = new Float32Array(MAX * 4);

  function applyTheme() {
    const t = THEMES[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
    gl!.uniform3fv(u.bg, t.bg);
    gl!.uniform3fv(u.line, t.line);
    gl!.uniform3fv(u.major, t.major);
    gl!.uniform3fv(u.rim, t.rim);
    gl!.uniform3fv(u.accent, t.accent);
    gl!.uniform1f(u.dark, t.dark);
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Estado ---------- */
  const drops = new Map<string, Drop>();
  const cam = { x: 0, y: 0, z: 1 };
  const camT = { ...cam };
  const mouse = { x: 1e9, y: 1e9, sx: 0, sy: 0, inside: false };
  let hovered: Drop | null = null;
  let selected: Drop | null = null;
  let dent = 0;
  let W = 0, H = 0, dpr = 1;

  // linhas de parentesco ficam atrás dos rótulos
  const SVGNS = 'http://www.w3.org/2000/svg';
  const links = document.createElementNS(SVGNS, 'svg');
  links.setAttribute('class', 'links');
  labels.prepend(links);

  const radius = (depth: number) => RADII[Math.min(depth, RADII.length - 1)];
  const depthOf = (n: WikiNode): number => (n.parent ? depthOf(byId.get(n.parent)!) + 1 : 0);

  function makeLabel(n: WikiNode, r: number) {
    const el = document.createElement('div');
    el.className = 'drop-label';
    el.style.width = `${r * 1.5}px`;
    el.style.fontSize = `${r * (n.kind === 'root' ? 0.3 : 0.24)}px`;
    const logo = opts.logos[n.id];
    if (logo?.path) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'logo');
      if (logo.color) svg.style.color = logo.color;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', logo.path);
      svg.appendChild(path);
      el.appendChild(svg);
    } else if (logo?.src) {
      const img = document.createElement('img');
      img.className = 'logo';
      img.src = logo.src;
      img.alt = '';
      img.draggable = false;
      el.appendChild(img);
    }
    const name = document.createElement('b');
    name.textContent = n.name;
    el.appendChild(name);
    labels.appendChild(el);
    return el;
  }

  function spawn(n: WikiNode, x: number, y: number, s = 0.15): Drop {
    const depth = depthOf(n);
    const r = radius(depth);
    const d: Drop = {
      node: n, depth, r, x, y, vx: 0, vy: 0, tx: x, ty: y, s, ts: 1, wob: 0.6,
      px: 0, py: 0, tpx: 0, tpy: 0, expanded: false, dying: false, label: makeLabel(n, r),
    };
    if (n.parent) {
      d.link = document.createElementNS(SVGNS, 'line');
      links.appendChild(d.link);
    }
    drops.set(n.id, d);
    return d;
  }

  /* ---------- Expandir / recolher ---------- */
  function expand(d: Drop) {
    const list = kids.get(d.node.id);
    if (!list?.length || d.expanded) return;
    d.expanded = true;
    d.wob = 1;
    const parent = d.node.parent ? drops.get(d.node.parent) : null;
    const n = list.length;
    const rc = radius(d.depth + 1);
    let A: number, a0: number, step: number;
    if (!parent) {
      A = Math.PI * 2; step = A / n; a0 = -Math.PI / 2;
    } else {
      const dir = Math.atan2(d.ty - parent.ty, d.tx - parent.tx);
      A = Math.min(2.4, Math.max(0.9, n * 0.45)); // leque de no máx. ~140°, voltado para fora
      step = n > 1 ? A / (n - 1) : 0;
      a0 = n > 1 ? dir - A / 2 : dir;
    }
    const R = Math.max((d.r + rc) * GAP + 50, step > 0 ? (2 * rc * GAP + 16) / step : 0);
    const fresh = list.map((child, i) => {
      const existing = drops.get(child.id);
      const c = existing && !existing.dying ? existing : (existing?.label.remove(), existing?.link?.remove(), spawn(child, d.tx, d.ty));
      c.dying = false;
      c.ts = 1;
      const a = a0 + step * i;
      c.tx = d.tx + Math.cos(a) * R;
      c.ty = d.ty + Math.sin(a) * R;
      return c;
    });
    relax(fresh);
  }

  // empurra as gotas novas para longe das que já existem, sem sobreposição
  function relax(fresh: Drop[]) {
    const ideal = fresh.map((d) => ({ x: d.tx, y: d.ty }));
    const all = [...drops.values()].filter((d) => !d.dying);
    for (let it = 0; it < 160; it++) {
      fresh.forEach((a, ai) => {
        for (const b of all) {
          if (a === b) continue;
          const dx = a.tx - b.tx, dy = a.ty - b.ty;
          const dist = Math.hypot(dx, dy) || 0.01;
          const min = (a.r + b.r) * GAP + 10;
          if (dist < min) {
            const push = (min - dist) * (fresh.includes(b) ? 0.5 : 1);
            a.tx += (dx / dist) * push * 0.5;
            a.ty += (dy / dist) * push * 0.5;
          }
        }
        a.tx += (ideal[ai].x - a.tx) * 0.02;
        a.ty += (ideal[ai].y - a.ty) * 0.02;
      });
    }
  }

  // árvore completa: cada família ganha uma fatia do círculo proporcional ao número de folhas,
  // e cada geração fica num anel mais externo (sem cruzamento de linhas)
  // anéis e pesos calculados para que vizinhas fiquem a pelo menos GAP × (soma dos raios)
  const RINGS = [0, 500, 1000, 1350];
  const MIN_WEIGHT = [0, 4, 1.5, 1];
  function radialLayout() {
    const leaves = (id: string, depth = 0): number => {
      const k = kids.get(id);
      const sum = k?.length ? k.reduce((acc, c) => acc + leaves(c.id, depth + 1), 0) : 0;
      return Math.max(sum, MIN_WEIGHT[Math.min(depth, MIN_WEIGHT.length - 1)]);
    };
    const place = (id: string, a0: number, a1: number, depth: number) => {
      const d = drops.get(id);
      if (!d) return;
      const mid = (a0 + a1) / 2;
      const R = RINGS[Math.min(depth, RINGS.length - 1)];
      d.tx = d.node === root ? 0 : Math.cos(mid) * R;
      d.ty = d.node === root ? 0 : Math.sin(mid) * R;
      const list = kids.get(id) ?? [];
      const total = list.reduce((sum, c) => sum + leaves(c.id, depth + 1), 0);
      let a = a0;
      list.forEach((c) => {
        const span = ((a1 - a0) * leaves(c.id, depth + 1)) / total;
        place(c.id, a, a + span, depth + 1);
        a += span;
      });
    };
    place(root.id, -Math.PI / 2, Math.PI * 1.5, 0);
  }

  function collapse(d: Drop) {
    d.expanded = false;
    d.wob = 1;
    for (const child of kids.get(d.node.id) ?? []) {
      const c = drops.get(child.id);
      if (!c || c.dying) continue;
      collapse(c);
      c.dying = true;
      c.ts = 0;
      c.tx = d.tx;
      c.ty = d.ty;
      if (selected === c) selected = null;
    }
  }

  function select(d: Drop | null) {
    selected = d;
    onSelect(d ? d.node : null);
  }

  function click(d: Drop) {
    if (selected === d && d.expanded) {
      collapse(d);
      fitTo([d]);
      return;
    }
    select(d);
    if (kids.get(d.node.id)?.length) {
      expand(d);
      fitTo([d, ...(kids.get(d.node.id) ?? []).map((k) => drops.get(k.id)!)]);
    } else {
      fitTo([d], false);
    }
  }

  /* ---------- Câmera ---------- */
  function fitTo(list: Drop[], zoomToFit = true) {
    const pw = opts.panelWidth();
    const ph = opts.panelHeight?.() ?? 0;
    // área livre: sem a navbar/busca no topo e sem os controles (ou o painel, no celular) embaixo
    const top = ph ? 130 : 110, bottom = ph ? ph + 10 : 110;
    const vw = W - pw, vh = H - top - bottom;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    list.forEach((d) => {
      x0 = Math.min(x0, d.tx - d.r); y0 = Math.min(y0, d.ty - d.r);
      x1 = Math.max(x1, d.tx + d.r); y1 = Math.max(y1, d.ty + d.r);
    });
    const z = zoomToFit ? Math.min(1.6, Math.max(0.18, Math.min(vw / (x1 - x0 + 60), vh / (y1 - y0 + 60)))) : Math.max(camT.z, 0.9);
    camT.z = z;
    camT.x = (x0 + x1) / 2 + pw / 2 / z;
    camT.y = (y0 + y1) / 2 + ((bottom - top) / 2) / z; // centro da área livre
    if (reduced) Object.assign(cam, camT);
  }

  const toWorld = (sx: number, sy: number) => ({ x: cam.x + (sx - W / 2) / cam.z, y: cam.y + (sy - H / 2) / cam.z });

  function zoomAt(sx: number, sy: number, factor: number) {
    const before = toWorld(sx, sy);
    const z = Math.min(4, Math.max(0.15, cam.z * factor));
    cam.z = camT.z = z;
    cam.x = camT.x = before.x - (sx - W / 2) / z;
    cam.y = camT.y = before.y - (sy - H / 2) / z;
  }

  /* ---------- Entrada (mouse, toque, roda) ---------- */
  const pointers = new Map<number, { x: number; y: number }>();
  let dragDist = 0;
  let pinch = 0;

  const local = (e: PointerEvent | WheelEvent) => {
    const b = canvas.getBoundingClientRect();
    return { x: e.clientX - b.left, y: e.clientY - b.top };
  };

  function pick(wx: number, wy: number) {
    let best: Drop | null = null;
    let bestD = Infinity;
    drops.forEach((d) => {
      if (d.dying || d.s < 0.5) return;
      const dist = Math.hypot(wx - (d.x + d.px), wy - (d.y + d.py));
      if (dist < d.r * d.s && dist < bestD) { best = d; bestD = dist; }
    });
    return best as Drop | null;
  }

  canvas.addEventListener('pointerdown', (e) => {
    try { canvas.setPointerCapture(e.pointerId); } catch {}
    pointers.set(e.pointerId, local(e));
    dragDist = 0;
    pinch = 0;
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    const prev = pointers.get(e.pointerId);
    const w = toWorld(p.x, p.y);
    const speed = Math.hypot(p.x - mouse.sx, p.y - mouse.sy);
    mouse.sx = p.x; mouse.sy = p.y; mouse.x = w.x; mouse.y = w.y; mouse.inside = true;

    if (prev && pointers.size === 1) {
      const dx = p.x - prev.x, dy = p.y - prev.y;
      dragDist += Math.abs(dx) + Math.abs(dy);
      if (dragDist > 5) {
        cam.x = camT.x = cam.x - dx / cam.z;
        cam.y = camT.y = cam.y - dy / cam.z;
      }
      pointers.set(e.pointerId, p);
    } else if (prev && pointers.size === 2) {
      pointers.set(e.pointerId, p);
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch) zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, dist / pinch);
      pinch = dist;
      dragDist = 99;
    }

    const h = pointers.size ? null : pick(w.x, w.y);
    if (h && h !== hovered) h.wob = Math.min(1, h.wob + 0.25);
    if (h) h.wob = Math.min(0.8, h.wob + Math.min(speed * 0.003, 0.04) * (reduced ? 0.3 : 1));
    hovered = h;
    canvas.style.cursor = pointers.size && dragDist > 5 ? 'grabbing' : h ? 'pointer' : 'grab';
  });

  const end = (e: PointerEvent) => {
    const wasClick = pointers.size === 1 && dragDist <= 5;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = 0;
    if (wasClick) {
      const p = local(e);
      const w = toWorld(p.x, p.y);
      const d = pick(w.x, w.y);
      if (d) click(d);
    }
  };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', (e) => pointers.delete(e.pointerId));
  canvas.addEventListener('pointerleave', () => { mouse.inside = false; hovered = null; });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const p = local(e);
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomAt(p.x, p.y, Math.exp(-delta * 0.0015));
  }, { passive: false });

  /* ---------- Loop ---------- */
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let last = performance.now();
  const t0 = last;
  function frame(now: number) {
    const dt = Math.min((now - last) / 16.67, 3);
    last = now;

    const k = reduced ? 1 : 1 - Math.pow(0.88, dt);
    cam.x += (camT.x - cam.x) * k;
    cam.y += (camT.y - cam.y) * k;
    cam.z += (camT.z - cam.z) * k;

    dent += ((hovered ? 0.32 : 0) - dent) * (1 - Math.pow(0.85, dt));

    let i = 0;
    for (const [id, d] of drops) {
      // mola até o alvo
      d.vx = (d.vx + (d.tx - d.x) * 0.05 * dt) * Math.pow(0.8, dt);
      d.vy = (d.vy + (d.ty - d.y) * 0.05 * dt) * Math.pow(0.8, dt);
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.s += (d.ts - d.s) * (1 - Math.pow(0.9, dt));
      d.wob *= Math.pow(0.965, dt);

      // a gota é empurrada levemente para longe do dedo
      if (d === hovered) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const len = Math.hypot(dx, dy) || 1;
        d.tpx = (dx / len) * d.r * 0.06;
        d.tpy = (dy / len) * d.r * 0.06;
      } else { d.tpx = d.tpy = 0; }
      d.px += (d.tpx - d.px) * (1 - Math.pow(0.85, dt));
      d.py += (d.tpy - d.py) * (1 - Math.pow(0.85, dt));

      if (d.dying && d.s < 0.04) {
        d.label.remove();
        d.link?.remove();
        drops.delete(id);
        continue;
      }
      if (i >= MAX) continue;

      const x = d.x + d.px, y = d.y + d.py;
      dropBuf.set([x, y, d.r, d.s], i * 4);
      wobBuf.set([reduced ? d.wob * 0.3 : d.wob, 0, 0, d === selected ? 1 : 0], i * 4);
      i++;

      // rótulo HTML acompanha a gota
      const sx = (x - cam.x) * cam.z + W / 2;
      const sy = (y - cam.y) * cam.z + H / 2;
      const size = d.r * d.s * cam.z;
      d.label.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%) scale(${cam.z * d.s})`;
      d.label.style.opacity = size < 13 || d.dying ? '0' : String(Math.min(1, (size - 13) / 12));
    }

    // linhas de borda a borda entre mãe e filha
    for (const d of drops.values()) {
      if (!d.link) continue;
      const p = drops.get(d.node.parent!);
      if (!p) { d.link.style.opacity = '0'; continue; }
      const ax = (p.x + p.px - cam.x) * cam.z + W / 2, ay = (p.y + p.py - cam.y) * cam.z + H / 2;
      const bx = (d.x + d.px - cam.x) * cam.z + W / 2, by = (d.y + d.py - cam.y) * cam.z + H / 2;
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const ra = p.r * p.s * cam.z + 6, rb = d.r * d.s * cam.z + 6;
      if (len < ra + rb) { d.link.style.opacity = '0'; continue; }
      const ux = (bx - ax) / len, uy = (by - ay) / len;
      d.link.setAttribute('x1', String(ax + ux * ra));
      d.link.setAttribute('y1', String(ay + uy * ra));
      d.link.setAttribute('x2', String(bx - ux * rb));
      d.link.setAttribute('y2', String(by - uy * rb));
      d.link.style.opacity = String(Math.max(0, Math.min(1, (len - ra - rb) / 40)) * d.s);
    }

    gl!.uniform2f(u.res, canvas.width, canvas.height);
    gl!.uniform3f(u.cam, cam.x, cam.y, cam.z);
    gl!.uniform1f(u.time, (now - t0) / 1000);
    gl!.uniform1f(u.dpr, dpr);
    gl!.uniform1f(u.dent, dent);
    gl!.uniform2f(u.mouse, mouse.x, mouse.y);
    gl!.uniform1i(u.count, i);
    gl!.uniform4fv(u.drop, dropBuf);
    gl!.uniform4fv(u.wob, wobBuf);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }

  spawn(root, 0, 0, 0.2);
  requestAnimationFrame(frame);

  /* ---------- API pública ---------- */
  return {
    // abre o caminho até a distro, seleciona e centraliza
    reveal(id: string) {
      const path: WikiNode[] = [];
      for (let n = byId.get(id); n; n = n.parent ? byId.get(n.parent) : undefined) path.unshift(n);
      path.slice(0, -1).forEach((n) => expand(drops.get(n.id)!));
      const d = drops.get(id);
      if (!d) return;
      select(d);
      if (kids.get(id)?.length) {
        expand(d);
        fitTo([d, ...(kids.get(id) ?? []).map((k) => drops.get(k.id)!)]);
      } else fitTo([d], false);
    },
    expandAll() {
      const queue = [root.id];
      while (queue.length) {
        const id = queue.shift()!;
        const d = drops.get(id);
        if (d) expand(d);
        queue.push(...(kids.get(id) ?? []).map((k) => k.id));
      }
      radialLayout();
      fitTo([...drops.values()].filter((d) => !d.dying));
    },
    collapseAll() {
      const r = drops.get(root.id)!;
      collapse(r);
      select(null);
      fitTo([r]);
      camT.z = 1;
    },
    zoom(factor: number) {
      camT.z = Math.min(4, Math.max(0.15, camT.z * factor));
    },
    center() {
      fitTo([...drops.values()].filter((d) => !d.dying));
    },
    deselect() {
      select(null);
    },
  };
}
