// Todas as páginas, nos dois idiomas, em cada aparelho: nada vaza da tela, nada quebra, dá pra tocar.
import { test, expect } from '@playwright/test';
import { ROUTES, open, offscreen, tinyTargets, isMobile } from './helpers';

for (const path of ROUTES) {
  test.describe(path, () => {
    test('abre sem erros de JavaScript', async ({ page }) => {
      const errors = await open(page, path);
      await page.waitForTimeout(500);
      expect(errors).toEqual([]);
    });

    test('não rola para os lados e nada sai da tela', async ({ page }) => {
      await open(page, path);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
      expect(await offscreen(page)).toEqual([]);
    });

    test('botões e campos têm tamanho de toque', async ({ page }) => {
      test.skip(!isMobile(), 'só no celular');
      await open(page, path);
      expect(await tinyTargets(page)).toEqual([]);
    });

    test('a barra do topo é opaca o bastante para o texto de baixo não aparecer através dela', async ({ page }) => {
      await open(page, path);
      const alpha = await page.evaluate(() => {
        const bg = getComputedStyle(document.querySelector('.nav-wrap')!).backgroundColor;
        // "rgba(r, g, b, a)" ou "color(srgb r g b / a)"; sem alfa = opaco
        const hasAlpha = bg.startsWith('rgba') || bg.includes('/');
        return hasAlpha ? Number(bg.match(/([\d.]+)\s*\)$/)![1]) : 1;
      });
      expect(alpha).toBeGreaterThanOrEqual(0.85);
    });
  });
}

test.describe('menu do celular', () => {
  test.skip(() => !isMobile(), 'só no celular');

  test('abre, mostra as cinco páginas da jornada, navega e fecha com Esc', async ({ page }) => {
    await open(page, '/');
    const toggle = page.locator('#menu-toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const links = page.locator('#nav-links a[href]:not([data-lang])');
    await expect(links).toHaveCount(5);
    for (const l of await links.all()) await expect(l).toBeInViewport();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await page.locator('#nav-links a[href="/comparar"]').click();
    await expect(page).toHaveURL(/\/comparar\/?(\?|$)/);
  });
});

test.describe('navbar no computador', () => {
  test.skip(() => isMobile(), 'só no computador');

  test('os cinco links da jornada cabem, cada um numa linha só', async ({ page }) => {
    await open(page, '/');
    const links = page.locator('#nav-links a[href]:not([data-lang])');
    await expect(links).toHaveCount(5);
    for (const l of await links.all()) {
      await expect(l).toBeVisible();
      expect((await l.boundingBox())!.height).toBeLessThan(32);
    }
  });
});
