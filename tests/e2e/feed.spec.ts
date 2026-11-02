// Página inicial no celular: uma tela por vez, como stories (ver src/scripts/feed.ts).
import { test, expect } from '@playwright/test';
import { open, swipe, settle, isMobile } from './helpers';

for (const path of ['/', '/en/']) {
  test.describe(`feed ${path}`, () => {
    test.skip(() => !isMobile(), 'só no celular');

    test.beforeEach(async ({ page }) => {
      await open(page, path);
    });

    test('quem rola é a área de conteúdo, não a página (a barra do navegador não pula)', async ({ page }) => {
      const r = await page.evaluate(() => ({
        main: getComputedStyle(document.querySelector('main')!).overflowY,
        snap: getComputedStyle(document.querySelector('main')!).scrollSnapType,
        body: getComputedStyle(document.body).overflow,
      }));
      expect(r.main).toBe('auto');
      expect(r.snap).toContain('mandatory');
      expect(r.body).toBe('hidden');
    });

    test('cada tela ocupa exatamente a altura visível e o conteúdo cabe nela', async ({ page }) => {
      const r = await page.evaluate(() => {
        const h = document.querySelector('main')!.clientHeight;
        return [...document.querySelectorAll<HTMLElement>('[data-screen]')].map((s) => ({ name: s.className, h: s.offsetHeight, view: h }));
      });
      expect(r.length).toBe(9);
      for (const s of r) expect(s.h, s.name).toBe(s.view);
    });

    test('nenhum conteúdo de tela fica escondido atrás da barra do topo', async ({ page }) => {
      const screens = await page.locator('[data-screen]').count();
      for (let i = 0; i < screens; i++) {
        const clash = await page.evaluate((i) => {
          const s = document.querySelectorAll<HTMLElement>('[data-screen]')[i];
          s.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
          const navBottom = document.querySelector('.nav-wrap')!.getBoundingClientRect().bottom;
          const top = s.getBoundingClientRect().top;
          // o primeiro elemento com texto da tela, medido a partir do topo da tela
          const first = [...s.querySelectorAll<HTMLElement>('h1, h2, h3, p, .os-card, .screen, .tile')].find((e) => e.offsetParent);
          return first ? first.getBoundingClientRect().top - top < navBottom : false;
        }, i);
        expect(clash, `tela ${i}`).toBe(false);
      }
    });

    test('um gesto avança exatamente uma tela (encaixe)', async ({ page }) => {
      // posição de cada tela dentro da área que rola
      const tops = await page.evaluate(() => {
        const m = document.querySelector('main')!;
        return [...document.querySelectorAll<HTMLElement>('[data-screen]')].map((s) => Math.round(s.getBoundingClientRect().top - m.getBoundingClientRect().top + m.scrollTop));
      });
      await swipe(page, 0.6);
      expect(await page.evaluate(() => document.querySelector('main')!.scrollTop)).toBe(tops[1]);
      await swipe(page, 0.6);
      expect(await page.evaluate(() => document.querySelector('main')!.scrollTop)).toBe(tops[2]);
      // soltar o dedo a 20% do caminho não muda de tela: volta para a mais próxima
      // (scrollBy tem direção e sempre avança; a posição absoluta simula o dedo parado no meio)
      await page.evaluate((top) => { const m = document.querySelector('main')!; m.scrollTo({ top: top + m.clientHeight * 0.2 }); }, tops[2]);
      await settle(page);
      expect(await page.evaluate(() => document.querySelector('main')!.scrollTop)).toBe(tops[2]);
    });

    test('pontinhos de progresso: um por tela, acompanhando a tela atual', async ({ page }) => {
      const n = await page.locator('[data-screen]').count();
      await expect(page.locator('.feed-dots i')).toHaveCount(n);
      await expect(page.locator('.feed-dots i').nth(0)).toHaveClass(/on/);
      await swipe(page);
      await expect(page.locator('.feed-dots i').nth(1)).toHaveClass(/on/);
      await expect(page.locator('.feed-dots i.on')).toHaveCount(1);
    });

    test('"deslize para cima" aparece na primeira tela e some depois de rolar', async ({ page }) => {
      const hint = page.locator('.feed-hint');
      await expect(hint).toBeVisible();
      await expect(hint).toContainText(path.startsWith('/en') ? 'Swipe up' : 'Deslize para cima');
      await swipe(page);
      await expect(hint).toHaveClass(/gone/);
    });

    test('o conteúdo de cada tela aparece quando ela fica ativa', async ({ page }) => {
      const n = await page.locator('[data-screen]').count();
      for (let i = 0; i < n; i++) {
        const screen = page.locator('[data-screen]').nth(i);
        await expect(screen).toHaveClass(/\bon\b/);
        const reveals = screen.locator('[data-reveal]');
        for (const r of await reveals.all()) await expect(r).toHaveCSS('opacity', '1');
        if (i < n - 1) await swipe(page);
      }
    });

    test('a tela das atualizações roda o terminal até o fim', async ({ page }) => {
      await page.evaluate(() => document.getElementById('updates')!.scrollIntoView({ behavior: 'instant' as ScrollBehavior }));
      await settle(page);
      await expect(page.locator('#term')).toContainText(path.startsWith('/en') ? 'Done.' : 'Pronto.', { timeout: 6000 });
    });

    test('o rodapé é alcançável no fim do feed', async ({ page }) => {
      await page.evaluate(() => { const m = document.querySelector('main')!; m.scrollTop = m.scrollHeight; });
      await settle(page);
      await expect(page.locator('main > footer')).toBeInViewport();
    });

    test('links internos (#) rolam até a tela certa', async ({ page }) => {
      // "Continuar" dos marcos de conhecimento desce exatamente para o painel seguinte
      for (const [from, to] of [['#inicio', '#sistema'], ['#vantagens', '#tudo'], ['#distros', '#updates']]) {
        await page.evaluate((id) => document.querySelector(id)!.scrollIntoView({ behavior: 'instant' as ScrollBehavior }), from);
        await settle(page);
        await page.locator(`${from} a.btn-primary[href="${to}"]`).click();
        await settle(page);
        await expect(page.locator(to)).toBeInViewport({ ratio: 0.9 });
      }
    });
  });
}

test.describe('feed com movimento reduzido', () => {
  test.skip(() => !isMobile(), 'só no celular');
  test.use({ reducedMotion: 'reduce' });

  test('tudo já aparece, sem esperar animação', async ({ page }) => {
    await open(page, '/');
    for (const r of await page.locator('[data-screen] [data-reveal]').all()) await expect(r).toHaveCSS('opacity', '1');
  });
});

test.describe('computador', () => {
  test.skip(() => isMobile(), 'só no computador');

  test('a página inicial rola normalmente, sem feed', async ({ page }) => {
    await open(page, '/');
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('main')!).overflowY)).toBe('visible');
    await expect(page.locator('.feed-dots')).toBeHidden();
    await expect(page.locator('.feed-hint')).toBeHidden();
    await expect(page.locator('footer')).toHaveCount(1);
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('footer')).toBeInViewport();
  });
});
