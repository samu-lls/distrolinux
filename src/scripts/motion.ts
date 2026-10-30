import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = root.classList.contains('reduced');

/* ---------- Tema claro/escuro (círculo que se espalha a partir do botão) ---------- */
const toggle = document.getElementById('theme-toggle');
toggle?.addEventListener('click', (e) => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
  };
  if (!document.startViewTransition || reduced) return apply();

  const { clientX: x, clientY: y } = e as MouseEvent;
  const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => {
    root.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
      { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});

/* ---------- Reflexo do vidro acompanhando o mouse ---------- */
document.addEventListener('pointermove', (e) => {
  for (const el of document.querySelectorAll<HTMLElement>('.glass')) {
    const b = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - b.left}px`);
    el.style.setProperty('--my', `${e.clientY - b.top}px`);
  }
});

/* ---------- Terminal do Linux ---------- */
const termLines = [
  '<span class="prompt">~ $</span> sudo pacman -Syu',
  '<span class="dim">:: Sincronizando bancos de dados…</span>',
  '<span class="dim">:: Iniciando atualização completa…</span>',
  'resolvendo dependências… <span class="ok">ok</span>',
  '(42/42) atualizando pacotes  <span class="ok">[################] 100%</span>',
  '<span class="ok">✓ Pronto.</span> Sem reiniciar. Sem pedir licença.',
  '<span class="prompt">~ $</span> ',
];
const term = document.getElementById('term');
const winPct = document.getElementById('win-pct');

function renderUpdates(p: number) {
  if (term) term.innerHTML = termLines.slice(0, Math.ceil(p * 1.6 * termLines.length)).join('\n');
  // o Windows anda rápido no começo e trava perto do fim. Como na vida real.
  if (winPct) winPct.textContent = String(Math.min(99, Math.floor(100 * (1 - Math.pow(1 - p, 0.35)) * 0.99)));
}

if (document.body.classList.contains('fullscreen')) {
  // páginas em tela cheia (Wiki) cuidam da própria interação; sem Lenis nem reveals
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => (el.style.opacity = '1', el.style.transform = 'none'));
} else if (reduced) {
  renderUpdates(1);
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => (el.textContent = el.dataset.count!));
} else {
  /* ---------- Rolagem suave ---------- */
  const lenis = new Lenis({ duration: 1.2 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const target = a.getAttribute('href')!;
      if (target.length > 1) { e.preventDefault(); lenis.scrollTo(target, { offset: -40 }); }
    }),
  );

  /* ---------- Título do hero (página 1) ---------- */
  if (document.querySelector('.hero-title')) gsap.from('.hero-title .word', {
    yPercent: 110,
    opacity: 0,
    rotateX: -60,
    filter: 'blur(12px)',
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.12,
    delay: 0.1,
  });

  /* ---------- Reveal genérico ---------- */
  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.1,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
    });
  });

  /* ---------- Parallax do líquido no hero (página 1) ---------- */
  if (document.querySelector('.hero')) gsap.to('.hero .liquid', {
    yPercent: 25,
    scale: 1.2,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  if (document.querySelector('.hero-cards')) gsap.to('.hero-cards', {
    y: -80,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });

  /* ---------- Seção de atualizações presa no scroll ---------- */
  if (term) {
    renderUpdates(0);
    ScrollTrigger.create({
      trigger: '#updates',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => renderUpdates(self.progress),
    });
    if (matchMedia('(max-width: 760px)').matches) {
      ScrollTrigger.create({
        trigger: '#updates',
        start: 'top 60%',
        onEnter: () => gsap.to({ p: 0 }, { p: 1, duration: 3, onUpdate() { renderUpdates(this.targets()[0].p); } }),
      });
    }
  }

  /* ---------- Contadores ---------- */
  document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { v: end === 0 ? 999 : 0 }; // zeros contam pra baixo, fica mais engraçado
    // reserva a largura do maior número pra seção não pular durante a contagem
    el.style.minWidth = `${String(Math.max(end, obj.v)).length * 0.62}em`;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(obj, { v: end, duration: 2, ease: 'power3.out', onUpdate: () => (el.textContent = String(Math.round(obj.v))) }),
    });
  });

  /* ---------- Tilt 3D nos cards ---------- */
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5;
      const y = (e.clientY - b.top) / b.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  });
}
