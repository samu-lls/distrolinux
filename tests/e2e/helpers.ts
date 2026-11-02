import { test, type Page } from '@playwright/test';

export const PAGES = ['/', '/wiki', '/distros', '/comparar', '/quiz'];
export const ROUTES = [...PAGES, ...PAGES.map((p) => (p === '/' ? '/en/' : `/en${p}`))];

export const isMobile = () => !test.info().project.name.startsWith('desktop');

// abre a página sem a detecção de idioma redirecionar (fixa a escolha) e coleta erros de JS
export async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript((en) => {
    try { localStorage.setItem('lang', en ? 'en' : 'pt'); } catch {}
  }, path.startsWith('/en'));
  await page.goto(path, { waitUntil: 'networkidle' });
  return errors;
}

// elementos visíveis que saem da tela pelos lados (fora de containers que rolam ou cortam o conteúdo)
export function offscreen(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('body *')) {
      if (el.closest('[aria-hidden="true"], dialog:not([open])')) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      let clipped = false;
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (/(auto|scroll|hidden|clip)/.test(getComputedStyle(a).overflowX)) { clipped = true; break; }
      }
      if (!clipped && (b.right > vw + 1 || b.left < -1)) out.push(`${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
    }
    return [...new Set(out)];
  });
}

// controles (botões, campos, seletores) menores que o mínimo de toque da WCAG 2.2 (24×24 px)
export function tinyTargets(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('button, select, input:not([type=checkbox]):not([type=radio]), [role=button]')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden], dialog:not([open])')) continue;
      // tamanho de layout (sem transform): uma animação de entrada encolhendo o botão não conta
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w) continue;
      if (w < 24 || h < 24) out.push(`${el.tagName.toLowerCase()}#${el.id}.${[...el.classList].join('.')} ${w}x${h}`);
    }
    return out;
  });
}

// no feed, quem rola é o <main>: rola um pouco e espera o encaixe (scroll-snap) assentar
export async function swipe(page: Page, fraction = 0.6) {
  await page.evaluate((f) => {
    const m = document.querySelector('main')!;
    m.scrollBy({ top: m.clientHeight * f });
  }, fraction);
  await settle(page);
}

export async function settle(page: Page) {
  await page.waitForFunction(() => {
    const m = document.querySelector('main')!;
    const w = window as unknown as { __last?: number; __still?: number };
    const still = w.__last === m.scrollTop;
    w.__last = m.scrollTop;
    w.__still = still ? (w.__still ?? 0) + 1 : 0;
    return w.__still >= 4;
  }, null, { polling: 100, timeout: 5000 });
}
