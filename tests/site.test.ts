// Testa o site já construído (dist/): páginas, idioma, links e textos.
import { describe, it, expect, beforeAll } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { wiki } from '../src/data/wiki';
import { portuguese } from './helpers';
import { JOURNEY, stepOf } from '../src/data/journey';

const PAGES = ['/', '/distros', '/comparar', '/wiki', '/quiz'];
const ROUTES = [...PAGES.map((p) => ({ lang: 'pt', path: p })), ...PAGES.map((p) => ({ lang: 'en', path: p === '/' ? '/en/' : `/en${p}` }))];
const file = (path: string) => `dist${path.endsWith('/') ? path : `${path}/`}index.html`;
const docs = new Map<string, Document>();

beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  for (const r of ROUTES) docs.set(r.path, parseHTML(readFileSync(file(r.path), 'utf8')).document);
});

// caminho interno → existe no build?
const resolves = (href: string) => {
  const path = href.split('#')[0].split('?')[0];
  if (!path) return true;
  return existsSync(`dist${path}`) && !path.endsWith('/') ? true : existsSync(file(path));
};

describe.each(ROUTES)('$path', ({ lang, path }) => {
  const doc = () => docs.get(path)!;

  it('existe e declara o idioma certo', () => {
    expect(doc().documentElement.getAttribute('lang')).toBe(lang === 'en' ? 'en-US' : 'pt-BR');
  });

  it('aponta as versões nos dois idiomas (hreflang) para páginas que existem', () => {
    const alts = [...doc().querySelectorAll('link[rel="alternate"][hreflang]')];
    expect(alts.map((l) => l.getAttribute('hreflang')).sort()).toEqual(['en-US', 'pt-BR', 'x-default']);
    for (const l of alts) expect(resolves(new URL(l.getAttribute('href')!).pathname), l.getAttribute('href')!).toBe(true);
  });

  it('prévia de link no idioma da página, com imagem existente', () => {
    const meta = (p: string) => doc().querySelector(`meta[property="${p}"]`)?.getAttribute('content');
    expect(meta('og:locale')).toBe(lang === 'en' ? 'en_US' : 'pt_BR');
    const img = new URL(meta('og:image')!);
    expect(img.origin).toBe('https://distrolinux.com.br');
    expect(img.pathname).toBe(lang === 'en' ? '/og-en.jpg' : '/og.jpg');
    expect(existsSync(`dist${img.pathname}`)).toBe(true);
  });

  it('todo link interno leva a uma página ou arquivo que existe', () => {
    const broken = [...doc().querySelectorAll('a[href^="/"], link[href^="/"], img[src^="/"], script[src^="/"]')]
      .map((el) => el.getAttribute('href') ?? el.getAttribute('src')!)
      .filter((h) => !resolves(h));
    expect(broken).toEqual([]);
  });

  it('links de navegação ficam no mesmo idioma (exceto o seletor de idioma)', () => {
    const pages = [...doc().querySelectorAll('a[href^="/"]:not([data-lang])')]
      .map((a) => a.getAttribute('href')!)
      .filter((h) => !/\.(svg|png|jpg|webp)$/.test(h));
    for (const h of pages) expect(h.startsWith('/en'), h).toBe(lang === 'en');
  });

  it('links para a Wiki apontam para gotas que existem', () => {
    const ids = new Set(wiki.map((n) => n.id));
    for (const a of doc().querySelectorAll('a[href*="/wiki#"]')) {
      const id = a.getAttribute('href')!.split('#')[1];
      expect(ids.has(id), a.getAttribute('href')!).toBe(true);
    }
  });

  it('seletor de idioma aponta para a mesma página no outro idioma', () => {
    const pt = doc().querySelector('.lang-switch.desktop a[data-lang="pt"]')!.getAttribute('href');
    const en = doc().querySelector('.lang-switch.desktop a[data-lang="en"]')!.getAttribute('href');
    const page = path.replace(/^\/en(?=\/|$)/, '') || '/';
    expect(pt).toBe(page);
    expect(en).toBe(page === '/' ? '/en/' : `/en${page}`);
  });

  it('botão de doação: link do Buy Me a Coffee e janela do Pix com QR e código', async () => {
    const { PIX_CODE, BMC_URL } = await import('../src/data/donate');
    expect(doc().querySelector('#donate')!.getAttribute('href')).toBe(BMC_URL);
    const dialog = doc().querySelector('dialog#pix-dialog')!;
    expect(dialog).toBeTruthy();
    expect(dialog.querySelector('img')!.getAttribute('src')).toBe('/pix-qr.svg');
    expect(dialog.querySelector('#pix-code')!.textContent).toBe(PIX_CODE);
    expect(dialog.querySelector('[data-copy]')!.getAttribute('data-copy')).toBe(PIX_CODE);
  });

  it('feed do celular (uma tela por vez) só na página inicial, com rodapé dentro da área que rola', () => {
    const home = path === '/' || path === '/en/';
    expect(doc().documentElement.classList.contains('feed')).toBe(home);
    if (home) {
      expect(doc().querySelectorAll('[data-screen]').length).toBeGreaterThanOrEqual(8);
      expect(doc().querySelector('main > footer')).not.toBeNull();
      expect(doc().querySelector('main')!.getAttribute('data-feed-hint')).toBe(lang === 'en' ? 'Swipe up' : 'Deslize para cima');
    } else {
      expect(doc().querySelector('main > footer')).toBeNull();
    }
  });

  it('navbar segue a ordem da jornada, no idioma da página', () => {
    const hrefs = [...doc().querySelectorAll('#nav-links a[href]:not([data-lang])')].map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(JOURNEY.map((s) => (lang === 'en' ? (s.href === '/' ? '/en/' : `/en${s.href}`) : s.href)));
  });

  it('"Próximo passo" aponta para a página seguinte da jornada (nenhum na página inicial, que já lista o caminho, nem no fim)', () => {
    const page = lang === 'en' ? path.replace(/^\/en/, '') || '/' : path;
    const { next } = stepOf(page === '' ? '/' : page);
    const box = doc().querySelector('section.next');
    if (page === '/' || !next) return expect(box).toBeNull();
    expect(box).not.toBeNull();
    const target = lang === 'en' ? `/en${next.href}` : next.href;
    expect(box!.querySelector('.btn-primary')!.getAttribute('href')).toBe(target);
    expect(box!.querySelectorAll('.trail li')).toHaveLength(JOURNEY.length);
  });

  if (path === '/' || path === '/en/') {
    it('página inicial: botões só nos marcos de conhecimento, com "Continuar" para o painel seguinte', () => {
      const panels = [...doc().querySelectorAll('[data-screen]')];
      expect(panels).toHaveLength(9);
      const ids = panels.map((p) => p.id);
      const withButtons = panels.filter((p) => p.querySelector('.p-cta')).map((p) => p.id);
      expect(withButtons).toEqual(['inicio', 'vantagens', 'distros', 'comecar']);
      panels.forEach((p, i) => {
        if (!p.querySelector('.p-cta')) return;
        expect(p.querySelectorAll('.p-cta a').length, p.id).toBe(2);
        const next = p.querySelector('.p-cta .btn-primary')!.getAttribute('href')!;
        if (i < panels.length - 1) expect(next, p.id).toBe(`#${ids[i + 1]}`);
      });
      // sem emoji: as ilustrações são vetores
      const text = doc().querySelector('main')!.textContent!;
      expect(text).not.toMatch(/\p{Emoji_Presentation}/u);
    });
  }

  it('SEO: canonical igual ao og:url, título e descrição com tamanho bom para o Google, JSON-LD válido', () => {
    const d = doc();
    const canonical = d.querySelector('link[rel="canonical"]')?.getAttribute('href');
    expect(canonical).toBe(d.querySelector('meta[property="og:url"]')!.getAttribute('content'));
    expect(d.title.length, d.title).toBeLessThanOrEqual(75);
    const desc = d.querySelector('meta[name="description"]')!.getAttribute('content')!;
    expect(desc.length, desc).toBeGreaterThan(70);
    expect(desc.length, desc).toBeLessThanOrEqual(170);
    const ld = JSON.parse(d.querySelector('script[type="application/ld+json"]')!.textContent!);
    const items = Array.isArray(ld) ? ld : [ld];
    expect(items[0]['@type']).toBe('WebSite');
    if (path.includes('comparar') || path.includes('quiz')) expect(items.some((x: any) => x['@type'] === 'WebApplication')).toBe(true);
  });

  it('script de detecção de idioma presente no <head>', () => {
    const s = [...doc().querySelectorAll('head script')].map((x) => x.textContent).join('\n');
    expect(s).toContain('decideLang');
    expect(s).toContain('/cdn-cgi/trace');
  });

  if (lang === 'pt') {
    // prova de que o detector funciona no HTML: na versão em português ele precisa encontrar português
    it('detector encontra português na versão em português', () => {
      const d = parseHTML(readFileSync(file(path), 'utf8')).document;
      d.querySelectorAll('script, style').forEach((el) => el.remove());
      const walker = d.createTreeWalker(d.body, 4);
      let found = 0;
      for (let n = walker.nextNode(); n; n = walker.nextNode()) if (portuguese(n.textContent!.trim())) found++;
      expect(found).toBeGreaterThan(5);
    });
  }

  if (lang === 'en') {
    it('nenhum texto visível em português', () => {
      const d = doc();
      // o código Pix tem a mensagem do banco em português e não pode ser alterado
      d.querySelectorAll('script, style, template, svg, .pix code').forEach((el) => el.remove());
      const leftovers: string[] = [];
      const walker = d.createTreeWalker(d.body, 4 /* SHOW_TEXT */);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const text = n.textContent!.trim();
        if (text && portuguese(text)) leftovers.push(text);
      }
      for (const el of d.querySelectorAll('[aria-label], [placeholder], [title], [alt], [data-feed-hint], meta[name="description"], meta[property^="og:"]')) {
        for (const attr of ['aria-label', 'placeholder', 'title', 'alt', 'content', 'data-feed-hint']) {
          const v = el.getAttribute(attr);
          if (v && !el.hasAttribute('hreflang') && portuguese(v)) leftovers.push(`[${attr}] ${v}`);
        }
      }
      expect(leftovers).toEqual([]);
    });

    it('dados da Wiki embutidos na página estão em inglês', () => {
      if (path !== '/en/wiki') return;
      const raw = readFileSync(file(path), 'utf8');
      const json = /<script type="application\/json" id="wiki-data">(.*?)<\/script>/s.exec(raw)![1];
      const nodes = JSON.parse(json) as { id: string; desc: string; name: string }[];
      const bad = nodes.filter((n) => portuguese(n.desc) || portuguese(n.name)).map((n) => n.id);
      expect(bad).toEqual([]);
    });
  }
});

describe('buscadores', () => {
  it('sitemap.xml lista todas as páginas nos dois idiomas, com hreflang', () => {
    const xml = readFileSync('dist/sitemap.xml', 'utf8');
    for (const r of ROUTES) expect(xml, r.path).toContain(`<loc>https://distrolinux.com.br${r.path.endsWith('/') ? r.path : `${r.path}/`}</loc>`);
    expect((xml.match(/<url>/g) ?? []).length).toBe(ROUTES.length);
    expect(xml).toContain('hreflang="en-US"');
  });

  it('robots.txt libera o site e aponta o sitemap', () => {
    const robots = readFileSync('dist/robots.txt', 'utf8');
    expect(robots).toMatch(/Allow: \//);
    expect(robots).toContain('Sitemap: https://distrolinux.com.br/sitemap.xml');
  });
});
