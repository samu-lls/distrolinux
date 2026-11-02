import { describe, it, expect } from 'vitest';
import { compareTable, parseIds, parseType, comparable, COMPARE_TEXTS, MAX_COMPARE, DEFAULT_COMPARE, DEFAULTS, CMP_TYPES, fitsType } from '../src/data/compare';
import { tableHTML } from '../src/scripts/compare-render';
import { en } from '../src/i18n/en';
import { wiki, isDistro } from '../src/data/wiki';
import { portuguese } from './helpers';

const cellText = (c: any) => (c.kind === 'bars' ? `${c.value}/5` : c.kind === 'list' ? c.items.join(', ') : c.text);

describe('comparador: dados', () => {
  it('toda distro ativa da Wiki é comparável, inclusive servidores e celulares; descontinuadas e conceitos ficam fora', () => {
    expect(comparable.map((n) => n.id).sort()).toEqual(wiki.filter((n) => isDistro(n) && !n.discontinued).map((n) => n.id).sort());
    for (const id of ['rhel', 'rocky', 'android', 'lineageos', 'openwrt', 'proxmox']) expect(comparable.some((n) => n.id === id), id).toBe(true);
    for (const id of ['sistema', 'linux', 'gnu', 'mandriva', 'centos', 'gnome', 'indep']) expect(comparable.some((n) => n.id === id), id).toBe(false);
    expect(comparable.length).toBeGreaterThanOrEqual(85);
  });

  it('cada tipo tem uma comparação padrão de distros daquele tipo', () => {
    expect(DEFAULT_COMPARE).toEqual(DEFAULTS.desktop);
    for (const { id: type } of CMP_TYPES) {
      expect(DEFAULTS[type].length, type).toBeLessThanOrEqual(MAX_COMPARE);
      for (const id of DEFAULTS[type]) {
        const n = comparable.find((x) => x.id === id);
        expect(n, `${type}: ${id}`).toBeTruthy();
        expect(fitsType(n!, type), `${type}: ${id}`).toBe(true);
      }
    }
  });

  it('tipo pela URL (?t=…): válido ou desktop', () => {
    expect(parseType('server')).toBe('server');
    expect(parseType('xyz')).toBe('desktop');
    expect(parseType(null)).toBe('desktop');
  });
});

describe('comparador: parseIds (link compartilhável ?d=…)', () => {
  it('aceita ids válidos na ordem', () => expect(parseIds('arch,ubuntu')).toEqual(['arch', 'ubuntu']));
  it('ignora ids inexistentes, vazios e repetidos', () => expect(parseIds('arch,xyz,,arch,mint')).toEqual(['arch', 'mint']));
  it('limita ao máximo de colunas', () => expect(parseIds('arch,ubuntu,mint,fedora,debian,void')).toHaveLength(MAX_COMPARE));
  it('não aceita gotas que não são distros (raízes, grupos, interfaces)', () => expect(parseIds('sistema,linux,gnu,indep,gnome,wayland,mandriva')).toEqual([]));
  it('sem parâmetro, lista vazia', () => expect(parseIds(null)).toEqual([]));
});

describe('comparador: tabela', () => {
  const t = compareTable(['ubuntu', 'arch', 'tails'], 'pt');

  it('uma célula por distro em todas as linhas, todas preenchidas (ou "-")', () => {
    expect(t.distros.map((d) => d.id)).toEqual(['ubuntu', 'arch', 'tails']);
    for (const s of t.sections) for (const r of s.rows) {
      expect(r.cells, `${s.title} / ${r.label}`).toHaveLength(3);
      for (const c of r.cells) expect(cellText(c).length, `${s.title} / ${r.label}`).toBeGreaterThan(0);
    }
  });

  it('família: derivadas mostram o ramo; o próprio ramo mostra o próprio nome; independentes, "Independente"', () => {
    const fam = compareTable(['ubuntu', 'arch', 'void', 'lineageos'], 'pt').sections[0].rows.find((r) => r.label === 'Família')!;
    expect(fam.cells.map(cellText)).toEqual(['Debian', 'Arch Linux', 'Independente', 'Android']);
  });

  it('linhas mudam com o tipo: desktop, servidor, celular e embarcados', () => {
    const titles = (type: any) => compareTable(['debian', 'rocky'], 'pt', type).sections.map((s) => s.title);
    expect(titles('desktop')).toContain('Uso no dia a dia');
    expect(titles('server')).toEqual(['Visão geral', 'Servidor']);
    expect(titles('mobile')).toEqual(['Visão geral', 'Celular']);
    expect(titles('embedded')).toEqual(['Visão geral', 'Embarcados']);
    const support = compareTable(['debian', 'rocky'], 'pt', 'server').sections[1].rows.find((r) => r.label === 'Suporte de cada versão')!;
    expect(support.cells.map(cellText).every((x) => x !== '-')).toBe(true);
  });

  it('selos de grupo: Debian é uso diário e servidor; Rocky só servidor (fora do tipo desktop)', () => {
    const g = compareTable(['debian', 'rocky'], 'pt', 'desktop').groups;
    expect(g[0]).toEqual({ fits: true, labels: ['Uso diário', 'Servidor'] });
    expect(g[1]).toEqual({ fits: false, labels: ['Servidor'] });
    expect(compareTable(['debian', 'rocky'], 'pt', 'server').groups.every((x) => x.fits)).toBe(true);
  });

  it('distro sem perfil (celular) no tipo desktop não quebra: linhas do perfil viram "-"', () => {
    const r = compareTable(['android', 'ubuntu'], 'pt', 'desktop').sections.flatMap((s) => s.rows).find((x) => x.label === 'Jogos')!;
    expect(cellText(r.cells[0])).toBe('-');
  });

  it('informação ausente vira "-"', () => {
    const tails = compareTable(['tails', 'ubuntu'], 'pt');
    const banks = tails.sections.find((s) => s.title === 'Brasil')!.rows[0];
    expect(banks.cells.map(cellText)).toEqual(['-', '-']);
    const big = compareTable(['biglinux', 'ubuntu'], 'pt').sections.find((s) => s.title === 'Brasil')!.rows[0];
    expect(big.cells.map(cellText)).toEqual(['Boa compatibilidade', '-']);
  });

  it('marca o melhor valor (facilidade: maior; terminal: menor)', () => {
    const rows = t.sections.flatMap((s) => s.rows);
    const ease = rows.find((r) => r.label === 'Facilidade de uso')!;
    const term = rows.find((r) => r.label === 'Uso de terminal')!;
    expect(ease.cells.map((c: any) => !!c.best)).toEqual([true, false, false]); // Ubuntu 4 > Tails 3 > Arch 1
    expect(term.cells.map((c: any) => !!c.best)).toEqual([false, false, true]); // Tails 1 < Ubuntu 2 < Arch 5
  });

  it('não destaca nada quando todas empatam e marca a linha como igual', () => {
    const same = compareTable(['kubuntu', 'xubuntu'], 'pt').sections.flatMap((s) => s.rows).find((r) => r.label === 'Usa systemd')!;
    expect(same.same).toBe(true);
    expect(same.cells.some((c: any) => c.best)).toBe(false);
  });

  it('em inglês, rótulos e valores traduzidos', () => {
    const e = compareTable(['ubuntu', 'arch'], 'en');
    expect(e.sections[0].title).toBe('Overview');
    const left = e.sections.flatMap((s) => [s.title, ...s.rows.flatMap((r) => [r.label, ...r.cells.map(cellText)])]).filter((x) => portuguese(x));
    expect(left).toEqual([]);
  });

  it('funciona com todas as distros em todos os tipos (nenhuma quebra a tabela)', () => {
    for (const { id: type } of CMP_TYPES) for (const n of comparable) {
      const tb = compareTable([n.id, 'debian'], 'en', type);
      for (const sec of tb.sections) for (const r of sec.rows) for (const c of r.cells) expect(cellText(c).length, `${type} ${n.id} ${r.label}`).toBeGreaterThan(0);
    }
  });

  it('funciona com todas as distros (nenhuma quebra a tabela)', () => {
    for (const n of comparable) {
      const r = compareTable([n.id, 'ubuntu'], 'en');
      expect(r.distros).toHaveLength(n.id === 'ubuntu' ? 2 : 2);
    }
  });

  it('todo rótulo e valor fixo do comparador tem tradução', () => {
    for (const s of COMPARE_TEXTS) if (portuguese(s)) expect(en[s], s).toBeDefined();
  });
});

describe('comparador: HTML', () => {
  const html = tableHTML(compareTable(['ubuntu', 'fedora'], 'pt'), {}, { wiki: 'Ver na Wiki', best: 'Melhor' }, '/wiki');

  it('tem cabeçalho com as distros e link para a Wiki', () => {
    expect(html).toContain('href="/wiki#ubuntu"');
    expect(html).toContain('href="/wiki#fedora"');
    expect(html.match(/<th scope="col">/g)).toHaveLength(2);
  });

  it('uma seção por grupo e linhas marcadas como iguais/diferentes', () => {
    expect(html.match(/class="cmp-section"/g)!.length).toBe(compareTable(['ubuntu', 'fedora'], 'pt').sections.length);
    expect(html).toMatch(/class="same"/);
    expect(html).toMatch(/class="diff"/);
  });

  it('escapa textos (sem HTML injetado pelos dados)', () => {
    expect(html).not.toMatch(/<script/i);
  });
});
