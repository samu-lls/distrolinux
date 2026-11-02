// Motor da Wiki: plano infinito quadriculado com gotas d'água (metaballs) renderizadas em WebGL.
// As gotas refratam o quadriculado, afundam sob o "dedo" (mouse) e se dividem ao expandir.

import type { WikiNode } from '../data/wiki';

// tamanho da gota por profundidade: SISTEMA, Linux/interfaces/protocolos, GNU/Android…, famílias, derivadas…
const RADII = [120, 96, 78, 62, 52, 46, 42];
// distância mínima entre gotas, em múltiplos da soma dos raios (abaixo disso os campos se fundem)
const GAP = 1.35;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

// o shader é montado com o limite de gotas que a placa de vídeo aguenta (2 vec4 por gota)
const frag = (MAX: number) => `
precision highp float;
uniform vec2 uRes;
uniform vec3 uCam;      // x, y do centro no mundo, z = zoom
uniform float uTime, uDpr, uDent, uDark;
uniform vec4 uDrop[${MAX}];  // x, y, raio, escala
uniform vec4 uWob[${MAX}];   // balanço, apagada (0..1), -, selecionada
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

  float f = 0.0, fs = 0.0, kw = 0.0, rw = 0.0, sel = 0.0, dim = 0.0;
  vec2 G = vec2(0.0);
  for (int i = 0; i < ${MAX}; i++) {
    if (i >= uCount) break;
    vec4 d = uDrop[i];
    vec4 w = uWob[i];
    float r = d.z * d.w;
    if (r < 0.5) continue;
    vec2 q = p - d.xy;
    float d2 = dot(q, q);
    // sombra (alcance maior que a gota)
    vec2 qs = q - vec2(r * 0.12, r * 0.22);
    float Rs2 = r * r * 3.6;
    float ds2 = dot(qs, qs);
    if (ds2 < Rs2) { float ts = 1.0 - ds2 / Rs2; fs += ts * ts * (1.0 - w.y * 0.85); }
    // longe da gota (com folga para a ondulação): nada mais a calcular
    float Rb = r * 1.3 * (1.0 + w.x * 0.1);
    if (d2 >= Rb * Rb) continue;
    float rr = r;
    // borda ondulando quando a gota é mexida (ângulo e senos só aqui, perto da borda e com balanço)
    if (w.x > 0.003) {
      float fi = float(i);
      float ang = atan(q.y, q.x);
      rr = r * (1.0 + w.x * (0.06 * sin(3.0 * ang + uTime * 6.0 + fi) + 0.04 * sin(5.0 * ang - uTime * 8.0 + fi * 2.0)));
    }
    float R2 = rr * rr * 1.69;
    if (d2 < R2) {
      float t = 1.0 - d2 / R2;
      float k = t * t;
      f += k;
      G += -4.0 * t * q / R2;
      kw += k;
      rw += k * r;
      sel += k * w.w;
      dim += k * w.y;
    }
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
    // destaque (selecionada ou da categoria filtrada): borda azul e um leve tom azul no corpo
    float hl = clamp(sel / max(kw, 1e-4), 0.0, 1.0);
    c = mix(c, uAccent, hl * (fres * 0.7 + 0.18));

    float inside = clamp((f - T) / max(length(G) / uCam.z * 1.2, 1e-4), 0.0, 1.0);
    // gotas apagadas (descontinuadas ou fora do filtro) ficam quase transparentes
    inside *= 1.0 - 0.88 * clamp(dim / max(kw, 1e-4), 0.0, 1.0);
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
  dim: number; dimT: number; // apagada: 0 = normal, 1 = fora do filtro (descontinuadas ficam em 0,5)
  shown: boolean;            // rótulo visível na tela (evita mexer no DOM à toa)
  label: HTMLElement;
  link?: SVGLineElement;     // linha até a gota mãe
  also: SVGLineElement[];    // ligações secundárias (tracejadas)
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
  // três gotas raiz: UNIX no centro, as outras ao lado (empilhadas na vertical em telas em pé)
  const roots = nodes.filter((n) => n.kind === 'root');
  const isRoot = (n: WikiNode) => n.kind === 'root';

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
  // limite de gotas pelo número de uniforms do aparelho (celulares costumam ter 224; PCs, 1024+)
  const MAX = Math.max(32, Math.min(160, Math.floor((gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS) - 16) / 2)));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag(MAX)));
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
  new MutationObserver(() => { applyTheme(); dirty = true; }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- Estado ---------- */
  const drops = new Map<string, Drop>();
  const cam = { x: 0, y: 0, z: 1 };
  const camT = { ...cam };
  const mouse = { x: 1e9, y: 1e9, sx: 0, sy: 0, inside: false };
  let hovered: Drop | null = null;
  let selected: Drop | null = null;
  let dent = 0;
  let W = 0, H = 0, dpr = 1;
  let dirty = true;      // algo mudou fora da física (tema, tamanho, filtro): redesenhar
  let scale = 1;         // resolução adaptativa: cai se os quadros ficarem lentos
  let crowd = 1;         // com muitas gotas na tela (árvore aberta, zoom longe), desenha em resolução menor
  let filter: string | null = null;

  // linhas de parentesco ficam atrás dos rótulos
  const SVGNS = 'http://www.w3.org/2000/svg';
  const links = document.createElementNS(SVGNS, 'svg');
  links.setAttribute('class', 'links');
  labels.prepend(links);

  const radius = (depth: number) => RADII[Math.min(depth, RADII.length - 1)];
  // no filtro, ficam acesas as gotas da categoria e o caminho até elas
  const matches = (n: WikiNode) => (filter === 'old' ? !!n.discontinued : !!n.cats?.includes(filter as never));
  const lit = new Set<string>();
  function computeLit() {
    lit.clear();
    if (!filter) return;
    for (const n of nodes) if (matches(n)) for (let p: WikiNode | undefined = n; p; p = p.parent ? byId.get(p.parent) : undefined) lit.add(p.id);
  }
  const dimOf = (n: WikiNode) => (filter ? (lit.has(n.id) ? (matches(n) ? 0 : 0.55) : 1) : n.discontinued ? 0.5 : 0);
  const depthOf = (n: WikiNode): number => (n.parent ? depthOf(byId.get(n.parent)!) + 1 : 0);

  function makeLabel(n: WikiNode, r: number) {
    const el = document.createElement('div');
    el.className = 'drop-label';
    el.style.width = `${r * 1.5}px`;
    el.style.fontSize = `${r * (isRoot(n) ? (n.name.length > 10 ? 0.22 : 0.3) : 0.24)}px`;
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
    if (n.discontinued) el.classList.add('old');
    labels.appendChild(el);
    return el;
  }

  function kill(d: Drop) {
    d.label.remove();
    d.link?.remove();
    d.also.forEach((l) => l.remove());
    drops.delete(d.node.id);
  }

  function spawn(n: WikiNode, x: number, y: number, s = 0.15): Drop {
    const depth = depthOf(n);
    const r = radius(depth);
    const d: Drop = {
      node: n, depth, r, x, y, vx: 0, vy: 0, tx: x, ty: y, s, ts: 1, wob: 0.6,
      px: 0, py: 0, tpx: 0, tpy: 0, expanded: false, dying: false, label: makeLabel(n, r),
      dim: 0, dimT: dimOf(n), shown: true, also: [],
    };
    d.dim = d.dimT;
    if (n.parent) {
      d.link = document.createElementNS(SVGNS, 'line');
      links.appendChild(d.link);
    }
    for (const _ of n.also ?? []) {
      const l = document.createElementNS(SVGNS, 'line');
      l.setAttribute('class', 'also');
      links.appendChild(l);
      d.also.push(l);
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
    if (!parent && Math.hypot(d.tx, d.ty) < 1) {
      A = Math.PI * 2; step = A / n; a0 = -Math.PI / 2;
    } else if (!parent) {
      // raiz lateral: abre para o lado de fora, longe da UNIX
      const dir = Math.atan2(d.ty, d.tx);
      A = Math.min(Math.PI, Math.max(1.2, n * 0.42)); // no máx. meia-volta, sem invadir o lado da UNIX
      step = n > 1 ? A / (n - 1) : 0;
      a0 = dir - A / 2;
    } else {
      const dir = Math.atan2(d.ty - parent.ty, d.tx - parent.tx);
      A = Math.min(2.4, Math.max(0.9, n * 0.45)); // leque de no máx. ~140°, voltado para fora
      step = n > 1 ? A / (n - 1) : 0;
      a0 = n > 1 ? dir - A / 2 : dir;
    }
    const R = Math.max((d.r + rc) * GAP + 50, step > 0 ? (2 * rc * GAP + 16) / step : 0);
    const fresh = list.map((child, i) => {
      const existing = drops.get(child.id);
      const c = existing && !existing.dying ? existing : (existing && kill(existing), spawn(child, d.tx, d.ty));
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

  // árvore completa: cada família ganha uma fatia do círculo proporcional ao número de folhas, e cada geração
  // fica num anel mais externo (sem cruzamento de linhas). O raio de cada anel cresce até caber a gota mais
  // apertada daquela geração com a folga GAP entre vizinhas.
  const RINGS = [0, 420, 900, 1450, 1980, 2460, 2900];
  const MIN_WEIGHT = [0, 4, 2.5, 1.5, 1];
  function radialLayout() {
    const leaves = (id: string, depth = 0): number => {
      const k = kids.get(id);
      const sum = k?.length ? k.reduce((acc, c) => acc + leaves(c.id, depth + 1), 0) : 0;
      return Math.max(sum, MIN_WEIGHT[Math.min(depth, MIN_WEIGHT.length - 1)]);
    };
    const slots: { id: string; depth: number; a0: number; a1: number }[] = [];
    const split = (id: string, a0: number, a1: number, depth: number) => {
      if (!drops.has(id)) return;
      slots.push({ id, depth, a0, a1 });
      const list = (kids.get(id) ?? []).filter((c) => drops.has(c.id));
      const total = list.reduce((sum, c) => sum + leaves(c.id, depth + 1), 0);
      let a = a0;
      list.forEach((c) => {
        const span = ((a1 - a0) * leaves(c.id, depth + 1)) / total;
        split(c.id, a, a + span, depth + 1);
        a += span;
      });
    };
    roots.forEach((r) => split(r.id, -Math.PI / 2, Math.PI * 1.5, 0));
    // raio de cada anel: o fixo ou o necessário para a fatia mais estreita caber a gota, o que for maior
    const R: number[] = [];
    for (const sl of slots) {
      const need = sl.depth ? (2 * radius(sl.depth) * GAP + 12) / Math.max(sl.a1 - sl.a0, 1e-3) : 0;
      R[sl.depth] = Math.max(R[sl.depth] ?? 0, RINGS[Math.min(sl.depth, RINGS.length - 1)], need);
    }
    for (let d = 1; d < R.length; d++) R[d] = Math.max(R[d], R[d - 1] + radius(d - 1) + radius(d) * 2); // anéis em ordem
    for (const sl of slots) {
      const d = drops.get(sl.id)!;
      const mid = (sl.a0 + sl.a1) / 2;
      d.tx = sl.depth ? Math.cos(mid) * R[sl.depth] : 0;
      d.ty = sl.depth ? Math.sin(mid) * R[sl.depth] : 0;
    }
  }

  // posição de repouso da raiz (SISTEMA, no centro)
  const homeOf = (_i: number) => ({ x: 0, y: 0 });

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
    dirty = true;
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
    // em tela em pé, o pinguim e o balão de dicas ocupam a parte de baixo
    // em pé, a busca e a faixa de filtros ocupam o topo; o pinguim e o balão de dicas, a parte de baixo
    const top = ph ? 130 : H > W ? 175 : 150, bottom = ph ? ph + 10 : H > W ? 250 : 190;
    const vw = W - pw, vh = H - top - bottom;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    list.forEach((d) => {
      x0 = Math.min(x0, d.tx - d.r); y0 = Math.min(y0, d.ty - d.r);
      x1 = Math.max(x1, d.tx + d.r); y1 = Math.max(y1, d.ty + d.r);
    });
    const z = zoomToFit ? Math.min(1.6, Math.max(0.05, Math.min(vw / (x1 - x0 + 60), vh / (y1 - y0 + 60)))) : Math.max(camT.z, 0.9);
    camT.z = z;
    camT.x = (x0 + x1) / 2 + pw / 2 / z;
    camT.y = (y0 + y1) / 2 + ((bottom - top) / 2) / z; // centro da área livre
    if (reduced) Object.assign(cam, camT);
  }

  const toWorld = (sx: number, sy: number) => ({ x: cam.x + (sx - W / 2) / cam.z, y: cam.y + (sy - H / 2) / cam.z });

  function zoomAt(sx: number, sy: number, factor: number) {
    const before = toWorld(sx, sy);
    const z = Math.min(4, Math.max(0.05, cam.z * factor));
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
    dpr = Math.min(devicePixelRatio || 1, 1.5) * scale * crowd;
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl!.viewport(0, 0, canvas.width, canvas.height);
    dirty = true;
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let last = performance.now();
  const t0 = last;
  const drawn = { x: NaN, y: NaN, z: NaN }; // câmera do último quadro desenhado
  let slow = 0, fast = 0, ema = 1;

  // ajusta um rótulo só quando o valor muda (escrever no DOM a cada quadro custa caro com 100+ gotas)
  const setOpacity = (el: Element & { style: CSSStyleDeclaration }, v: string) => { if (el.style.opacity !== v) el.style.opacity = v; };

  function frame(now: number) {
    // o Firefox pode entregar no 1º quadro um horário anterior ao do início: sem o piso em 0, o dt negativo
    // explodia as molas (Math.pow com expoente negativo) e as gotas sumiam por alguns segundos
    const dt = Math.max(0, Math.min((now - last) / 16.67, 3));
    last = Math.max(last, now);
    requestAnimationFrame(frame);

    const k = reduced ? 1 : 1 - Math.pow(0.88, dt);
    cam.x += (camT.x - cam.x) * k;
    cam.y += (camT.y - cam.y) * k;
    cam.z += (camT.z - cam.z) * k;
    const dentT = hovered ? 0.32 : 0;
    dent += (dentT - dent) * (1 - Math.pow(0.85, dt));

    // física das gotas; `active` = algo ainda se mexe (senão o quadro não precisa ser redesenhado)
    let active = dirty || Math.abs(dentT - dent) > 0.002
      || Math.abs(cam.x - drawn.x) * cam.z > 0.05 || Math.abs(cam.y - drawn.y) * cam.z > 0.05 || Math.abs(cam.z - drawn.z) > 1e-4;
    for (const [id, d] of drops) {
      d.vx = (d.vx + (d.tx - d.x) * 0.05 * dt) * Math.pow(0.8, dt);
      d.vy = (d.vy + (d.ty - d.y) * 0.05 * dt) * Math.pow(0.8, dt);
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.s += (d.ts - d.s) * (1 - Math.pow(0.9, dt));
      d.wob *= Math.pow(0.965, dt);
      d.dim += (d.dimT - d.dim) * (1 - Math.pow(0.85, dt));

      // a gota é empurrada levemente para longe do dedo
      if (d === hovered) {
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const len = Math.hypot(dx, dy) || 1;
        d.tpx = (dx / len) * d.r * 0.06;
        d.tpy = (dy / len) * d.r * 0.06;
      } else { d.tpx = d.tpy = 0; }
      d.px += (d.tpx - d.px) * (1 - Math.pow(0.85, dt));
      d.py += (d.tpy - d.py) * (1 - Math.pow(0.85, dt));

      if (d.dying && d.s < 0.04) { kill(d); active = true; continue; }
      if (Math.abs(d.vx) + Math.abs(d.vy) > 0.01 || Math.abs(d.ts - d.s) > 0.002 || d.wob > 0.004
        || Math.abs(d.tpx - d.px) + Math.abs(d.tpy - d.py) > 0.01 || Math.abs(d.dimT - d.dim) > 0.004) active = true;
    }
    if (!active) return; // tudo parado: nada a desenhar (economiza bateria e não esquenta o celular)
    dirty = false;
    drawn.x = cam.x; drawn.y = cam.y; drawn.z = cam.z;

    // resolução adaptativa: quadros lentos seguidos baixam a resolução; folga longa sobe de volta
    ema = ema * 0.9 + dt * 0.1;
    if (ema > 1.5) { slow++; fast = 0; } else if (ema < 1.08) { fast++; slow = 0; }
    if (slow > 40 && scale > 0.6) { scale = Math.max(0.6, scale - 0.15); slow = 0; resize(); }
    if (fast > 240 && scale < 1) { scale = Math.min(1, scale + 0.1); fast = 0; resize(); }

    const sx = (x: number) => (x - cam.x) * cam.z + W / 2;
    const sy = (y: number) => (y - cam.y) * cam.z + H / 2;
    let i = 0;
    for (const d of drops.values()) {
      const x = d.x + d.px, y = d.y + d.py;
      const px = sx(x), py = sy(y);
      const size = d.r * d.s * cam.z;
      // fora da tela (com a sombra) ou pequena demais: nem vai para o shader nem mexe no rótulo
      const off = px + size * 1.9 < 0 || px - size * 1.9 > W || py + size * 1.9 < 0 || py - size * 1.9 > H || size < 1;
      if (off || i >= MAX) {
        if (d.shown) { d.label.style.visibility = 'hidden'; d.shown = false; }
        continue;
      }
      dropBuf.set([x, y, d.r, d.s], i * 4);
      // anel de destaque: a gota selecionada e, com filtro, as gotas da categoria
      const ring = d === selected ? 1 : filter && d.dimT === 0 ? 0.9 : 0;
      wobBuf.set([reduced ? d.wob * 0.3 : d.wob, d.dim, 0, ring], i * 4);
      i++;

      // rótulo HTML acompanha a gota
      if (!d.shown) { d.label.style.visibility = ''; d.shown = true; }
      d.label.style.transform = `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${cam.z * d.s})`;
      const vis = size < 13 || d.dying ? 0 : Math.min(1, (size - 13) / 12) * (1 - d.dim * 0.75);
      setOpacity(d.label, vis.toFixed(2));
    }

    // linha de borda a borda entre duas gotas (some se estiverem perto demais)
    const edge = (line: SVGLineElement, a: Drop, b: Drop, alpha: number) => {
      const ax = sx(a.x + a.px), ay = sy(a.y + a.py), bx = sx(b.x + b.px), by = sy(b.y + b.py);
      const len = Math.hypot(bx - ax, by - ay) || 1;
      const ra = a.r * a.s * cam.z + 6, rb = b.r * b.s * cam.z + 6;
      if (len < ra + rb || !(a.shown || b.shown)) return setOpacity(line, '0');
      const ux = (bx - ax) / len, uy = (by - ay) / len;
      line.setAttribute('x1', (ax + ux * ra).toFixed(1));
      line.setAttribute('y1', (ay + uy * ra).toFixed(1));
      line.setAttribute('x2', (bx - ux * rb).toFixed(1));
      line.setAttribute('y2', (by - uy * rb).toFixed(1));
      setOpacity(line, (Math.max(0, Math.min(1, (len - ra - rb) / 40)) * alpha).toFixed(2));
    };
    for (const d of drops.values()) {
      const fade = d.s * (1 - Math.max(d.dim, 0) * 0.7);
      if (d.link) {
        const p = drops.get(d.node.parent!);
        if (p) edge(d.link, p, d, fade); else setOpacity(d.link, '0');
      }
      // ligações secundárias só aparecem com uma das duas gotas selecionada (com a árvore aberta, viravam ruído)
      d.node.also?.forEach(([id], k) => {
        const o = drops.get(id);
        const on = o && !o.dying && !d.dying && (selected === d || selected === o);
        if (on) edge(d.also[k], d, o!, Math.min(1, o!.s)); else setOpacity(d.also[k], '0');
      });
    }

    // o custo do shader é pixels × gotas: com muitas gotas visíveis (e pequenas), menos pixels
    const want = i > 50 ? Math.max(0.6, 1 - (i - 50) / 150) : 1;
    if (Math.abs(want - crowd) > 0.08) { crowd = want; resize(); }

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
  }

  roots.forEach((r, i) => {
    const h = homeOf(i);
    expand(spawn(r, h.x, h.y, 0.2));
  });
  fitTo([...drops.values()]);
  Object.assign(cam, camT);
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
      const queue = roots.map((r) => r.id);
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
      // volta ao começo: SISTEMA aberto nas três partes
      roots.forEach((r, i) => {
        const d = drops.get(r.id)!;
        collapse(d);
        Object.assign(d, { tx: homeOf(i).x, ty: homeOf(i).y });
        expand(d);
      });
      select(null);
      fitTo([...drops.values()].filter((d) => !d.dying));
    },
    // filtro por categoria (null = todas; 'old' = descontinuadas): abre tudo e apaga o que não combina
    setFilter(cat: string | null) {
      filter = cat;
      computeLit();
      if (cat) this.expandAll();
      for (const d of drops.values()) d.dimT = dimOf(d.node);
      // a câmera enquadra só as gotas da categoria
      const hit = [...drops.values()].filter((d) => !d.dying && cat && matches(d.node));
      if (hit.length) fitTo(hit);
      dirty = true;
    },
    zoom(factor: number) {
      camT.z = Math.min(4, Math.max(0.05, camT.z * factor));
    },
    center() {
      fitTo([...drops.values()].filter((d) => !d.dying));
    },
    deselect() {
      select(null);
    },
  };
}
