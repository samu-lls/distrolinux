// Interações de cada página no celular (toque) e no computador.
import { test, expect } from '@playwright/test';
import { open, offscreen, isMobile } from './helpers';
import type { Page } from '@playwright/test';

// escolhe uma distro num espaço do Comparador pela lista com busca
async function pick(page: Page, slot: number, query: string, name = query) {
  await page.locator(`.slot-pick[data-index="${slot}"]`).click();
  const menu = page.locator('.slot').nth(slot).locator('.slot-menu');
  await menu.locator('input').fill(query);
  await menu.getByRole('option', { name, exact: true }).click();
}

test.describe('Wiki', () => {
  test('SISTEMA e as três partes aparecem inteiras, sem ficar atrás da busca, dos filtros nem do balão do pinguim', async ({ page }) => {
    await open(page, '/wiki');
    await page.waitForTimeout(3500); // câmera assenta e o balão termina de digitar a primeira dica
    const r = await page.evaluate(() => {
      const rect = (el: Element) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
      const blockers = ['.search', '.filters button', '#bubble', '.controls', '.nav-wrap'].flatMap((s) => [...document.querySelectorAll(s)].map(rect));
      const roots = [...document.querySelectorAll('.drop-label')].slice(0, 4).map(rect);
      const hit = (a: any, b: any) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
      return { count: roots.length, inView: roots.every((x) => x.l >= 0 && x.r <= innerWidth && x.t >= 0 && x.b <= innerHeight), clashes: roots.filter((x) => blockers.some((b) => hit(x, b))).length };
    });
    expect(r.count).toBe(4);
    expect(r.inView).toBe(true);
    expect(r.clashes).toBe(0);
  });

  test('ficha mostra categorias, ligação secundária e selo de descontinuada', async ({ page }) => {
    await open(page, '/wiki#rocky');
    const panel = page.locator('#panel');
    await expect(panel).toContainText('Servidor', { timeout: 8000 });
    await expect(panel.locator('.also button')).toContainText('CentOS Linux');
    await panel.locator('.also button').first().click();
    await expect(panel.locator('h2')).toHaveText('CentOS Linux');
    await expect(panel.locator('.tags .dead')).toContainText('2024');
  });

  test('filtro por categoria marca o botão e mantém a página sem erros', async ({ page }) => {
    // abre a árvore inteira: nos navegadores de teste sem placa de vídeo (desenho por software) isso é lento
    test.slow();
    const errors = await open(page, '/wiki');
    await page.locator('[data-cat="mobile"]').click();
    await expect(page.locator('[data-cat="mobile"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-cat=""]')).toHaveAttribute('aria-pressed', 'false');
    await page.waitForTimeout(800);
    await page.locator('[data-cat=""]').click();
    await expect(page.locator('[data-cat=""]')).toHaveAttribute('aria-pressed', 'true', { timeout: 20000 });
    expect(errors).toEqual([]);
  });

  test('tocar numa distro abre a ficha dela', async ({ page }) => {
    await open(page, '/wiki#ubuntu');
    await expect(page.locator('#panel')).toBeVisible({ timeout: 8000 });
    await expect(page.locator('#panel')).toContainText('Ubuntu');
    expect(await offscreen(page)).toEqual([]);
  });
});

test.describe('Comparador', () => {
  test('trocar uma distro atualiza a tabela e o link', async ({ page }) => {
    await open(page, '/comparar');
    // o script da página está pronto quando grava a comparação no endereço
    await expect(page).toHaveURL(/\?d=/);
    await pick(page, 1, 'deb', 'Debian');
    await expect(page.locator('.cmp-table thead')).toContainText('Debian', { timeout: 10000 });
    await expect(page).toHaveURL(/d=mint,debian,arch/);
  });

  test('tipos: Servidor troca as linhas e carrega distros de servidor; o link guarda o tipo', async ({ page }) => {
    await open(page, '/comparar');
    await expect(page).toHaveURL(/\?d=/);
    await page.locator('[data-type="server"]').click();
    await expect(page.locator('[data-type="server"]')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.cmp-table')).toContainText('Suporte de cada versão');
    // cada tipo recomeça com as três distros padrão dele
    await expect(page).toHaveURL(/t=server&d=rhel,rocky,alma/);
    // a mesma tabela abre direto pelo link
    await open(page, '/comparar?t=mobile&d=android,grapheneos');
    await expect(page.locator('.cmp-table')).toContainText('Serviços do Google');
    await expect(page.locator('.cmp-table thead')).toContainText('GrapheneOS');
  });

  test('selos de grupo: distro fora do tipo escolhido fica marcada', async ({ page }) => {
    await open(page, '/comparar?d=arch,rocky');
    await expect(page.locator('.cmp-table thead th').nth(0).locator('.cmp-groups')).not.toHaveClass(/off/);
    await expect(page.locator('.cmp-table thead th').nth(1).locator('.cmp-groups')).toHaveClass(/off/);
  });

  test('lista de distros: busca, logos e só as distros da aba escolhida', async ({ page }) => {
    await open(page, '/comparar');
    await expect(page).toHaveURL(/\?d=/);
    await page.locator('.slot-pick[data-index="3"]').click();
    const menu = page.locator('.slot').nth(3).locator('.slot-menu');
    await expect(menu).toBeVisible();
    const desktopCount = await menu.getByRole('option').count();
    expect(desktopCount).toBeGreaterThan(40);
    await expect(menu.getByRole('option', { name: 'Rocky Linux' })).toHaveCount(0); // servidor não aparece em Desktop
    await expect(menu.locator('.opt-logo').first()).toBeVisible();
    await menu.locator('input').fill('linux mint');
    await expect(menu.getByRole('option')).toHaveCount(1);
    await expect(menu.getByRole('option', { name: 'Linux Mint' })).toBeDisabled(); // já está na comparação
    await menu.locator('input').fill('zzzz');
    await expect(menu).toContainText('Nenhuma distro encontrada');
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    // em Servidor, a lista muda
    await page.locator('[data-type="server"]').click();
    await page.locator('.slot-pick[data-index="3"]').click();
    await expect(menu.getByRole('option', { name: 'Rocky Linux' })).toHaveCount(1);
    await expect(menu.getByRole('option', { name: 'Linux Mint' })).toHaveCount(0);
  });

  test('"Comparar" da Wiki abre o Comparador com a distro na primeira coluna e o resto vazio', async ({ page }) => {
    await open(page, '/wiki#rocky');
    await page.locator('#panel a', { hasText: 'Comparar' }).click();
    await expect(page).toHaveURL(/\/comparar\/?\?t=server&d=rocky$/);
    await expect(page.locator('.slot').nth(0).locator('.slot-name')).toHaveText('Rocky Linux');
    await expect(page.locator('.slot.empty')).toHaveCount(3);
    await expect(page.locator('#cmp-empty')).toBeVisible();
  });

  test('remover e adicionar distros', async ({ page }) => {
    await open(page, '/comparar');
    await expect(page).toHaveURL(/\?d=/);
    await page.locator('[data-remove="2"]').click();
    await expect(page.locator('.cmp-table thead th')).toHaveCount(2);
    await pick(page, 2, 'arch', 'Arch Linux');
    await pick(page, 3, 'ubuntu', 'Ubuntu');
    await expect(page.locator('.cmp-table thead th')).toHaveCount(4);
  });

  test('"só as diferenças" esconde linhas iguais', async ({ page }) => {
    await open(page, '/comparar');
    const visible = () => page.locator('.cmp-table tbody tr:not(.cmp-section):visible').count();
    const before = await visible();
    await page.locator('label.switch').click();
    expect(await visible()).toBeLessThan(before);
  });

  test('no celular, a tabela rola de lado por dentro dela, e a coluna dos rótulos fica fixa', async ({ page }) => {
    test.skip(!isMobile(), 'só no celular');
    await open(page, '/comparar?d=ubuntu,fedora,arch,debian');
    // a tabela é redesenhada pelo script a partir do ?d=: espera a versão final antes de medir
    await expect(page.locator('.cmp-table thead th')).toHaveCount(4);
    const wrap = page.locator('#cmp-table');
    const label = page.locator('.cmp-table tbody th[scope=row]').first();
    const x0 = (await label.boundingBox())!.x;
    await wrap.evaluate((w) => (w.scrollLeft = 300));
    await page.waitForTimeout(100);
    expect(Math.abs((await label.boundingBox())!.x - x0)).toBeLessThan(2);
  });
});

test.describe('Teste de Afinidade', () => {
  test('dá pra responder tudo pelo toque e ver as cinco distros no fim', async ({ page }) => {
    await open(page, '/quiz');
    await page.locator('#start').click();
    for (let i = 0; i < 12; i++) {
      const before = await page.locator('#step').textContent();
      await page.locator('#options .opt').first().click();
      if (i < 11) await expect(page.locator('#step')).not.toHaveText(before!);
      await page.waitForTimeout(300);
    }
    await expect(page.locator('#matches > li')).toHaveCount(5, { timeout: 8000 });
    expect(await offscreen(page)).toEqual([]);

    // ir à Wiki e voltar mantém o resultado; F5 recomeça
    const first = await page.locator('#matches > li h3').first().textContent();
    await page.locator('#matches > li').first().locator('a.drop-btn').click();
    await expect(page).toHaveURL(/\/wiki/);
    await page.goBack();
    await expect(page.locator('#matches > li h3').first()).toHaveText(first!);
    await page.goto(page.url().replace(/#.*/, ''));
    await expect(page.locator('#matches > li h3').first()).toHaveText(first!);
    // o botão Comparar do resultado aponta para o Comparador com a distro
    await expect(page.locator('#matches > li').first().locator('a.cmp-btn')).toHaveAttribute('href', /\/comparar\?(t=\w+&)?d=[\w-]+$/);
    await page.reload();
    await expect(page.locator('#start')).toBeVisible();
  });
});

test.describe('Guia Inicial', () => {
  test('filtros e busca da tabela funcionam no toque', async ({ page }) => {
    await open(page, '/distros');
    const count = page.locator('#count');
    const total = await count.textContent();
    // a página não avisa quando o script fica pronto: repete o clique até o filtro responder
    await expect(async () => {
      await page.locator('.filter[data-tag]').nth(1).click();
      await expect(count).not.toHaveText(total!, { timeout: 1000 });
    }).toPass({ timeout: 15000 });
    await page.locator('#distro-search').fill('zzzz-nada');
    await expect(page.locator('#empty')).toBeVisible();
  });
});
