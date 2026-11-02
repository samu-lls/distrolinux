import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { wiki, wikiIdFor, inQuiz, isDistro, CATS } from '../src/data/wiki';
import { guide, distros, desktops } from '../src/data/distros';
import { traits } from '../src/data/quiz';
import { logos } from '../src/data/logos';

const byId = new Map(wiki.map((n) => [n.id, n]));
const kids = (id: string) => wiki.filter((n) => n.parent === id);
const subtree = (id: string): string[] => [id, ...kids(id).flatMap((k) => subtree(k.id))];

describe('árvore da Wiki', () => {
  it('ids únicos', () => {
    expect(new Set(wiki.map((n) => n.id)).size).toBe(wiki.length);
  });

  it('uma raiz só, SISTEMA, com Linux, Desktop Environments e Protocolos gráficos', () => {
    expect(wiki.filter((n) => n.kind === 'root').map((n) => n.id)).toEqual(['sistema']);
    expect(kids('sistema').map((n) => n.id)).toEqual(['linux', 'de', 'display']);
  });

  it('Linux → GNU → famílias; os sistemas sem GNU saem direto do Linux', () => {
    for (const id of ['debian', 'arch', 'gentoo', 'slackware', 'redhat', 'suse', 'indep']) expect(byId.get(id)!.parent, id).toBe('gnu');
    for (const id of ['gnu', 'android', 'alpine', 'tinycore', 'openwrt', 'azuresphere', 'rtlinux']) expect(byId.get(id)!.parent, id).toBe('linux');
  });

  it('toda gota tem mãe existente (exceto raízes) e não há ciclos', () => {
    for (const n of wiki) {
      if (n.kind === 'root') continue;
      expect(byId.has(n.parent!), `${n.id} → ${n.parent}`).toBe(true);
      const seen = new Set<string>();
      for (let p: string | undefined = n.id; p; p = byId.get(p)!.parent) {
        expect(seen.has(p), `ciclo em ${n.id}`).toBe(false);
        seen.add(p);
      }
    }
  });

  it('todas as gotas são alcançáveis a partir de uma raiz', () => {
    const reach = new Set(subtree('sistema'));
    expect(wiki.filter((n) => !reach.has(n.id)).map((n) => n.id)).toEqual([]);
  });

  it('todo "Padrão em" aponta para uma distro existente', () => {
    for (const n of wiki) for (const id of n.seenIn ?? []) expect(byId.has(id), `${n.id}.seenIn: ${id}`).toBe(true);
  });

  it('notas de 1 a 5 e links com https/http', () => {
    for (const n of wiki) {
      for (const k of ['ease', 'config', 'terminal'] as const) {
        if (n[k] != null) expect(n[k]! >= 1 && n[k]! <= 5, `${n.id}.${k}`).toBe(true);
      }
      for (const k of ['site', 'download'] as const) if (n[k]) expect(n[k]!, `${n.id}.${k}`).toMatch(/^https?:\/\//);
    }
  });

  it('ligações secundárias (tracejadas) apontam para gotas existentes e têm motivo', () => {
    for (const n of wiki) for (const [id, why] of n.also ?? []) {
      expect(byId.has(id), `${n.id}.also: ${id}`).toBe(true);
      expect(why.length, `${n.id}.also: ${id}`).toBeGreaterThan(5);
      expect(id, `${n.id}.also repete a mãe`).not.toBe(n.parent);
    }
  });

  it('categorias válidas; toda distro tem pelo menos uma', () => {
    for (const n of wiki) for (const c of n.cats ?? []) expect(CATS, `${n.id}: ${c}`).toContain(c);
    const inTree = subtree('linux').map((id) => byId.get(id)!).filter((n) => !n.kind);
    for (const n of inTree) expect(n.cats?.length, `${n.id}: falta cats`).toBeGreaterThan(0);
  });

  it('descontinuadas têm ano de fim depois do de lançamento', () => {
    for (const n of wiki.filter((x) => x.discontinued)) {
      expect(n.discontinued! >= (n.year ?? 0), n.id).toBe(true);
      expect(n.discontinued! <= new Date().getFullYear(), n.id).toBe(true);
    }
  });

  it('descrição em toda gota', () => {
    for (const n of wiki) expect(n.desc.length, n.id).toBeGreaterThan(20);
  });
});

describe('logos', () => {
  it('todo arquivo de logo existe em public/', () => {
    for (const [id, l] of Object.entries(logos)) if (l.src) expect(existsSync(`public${l.src}`), id).toBe(true);
  });

  it('todo logo vetorial tem desenho', () => {
    for (const [id, l] of Object.entries(logos)) if (!l.src) expect(l.path?.length, id).toBeGreaterThan(10);
  });

  it('toda gota tem logo (inclusive SISTEMA, conceitos e grupos)', () => {
    expect(wiki.filter((n) => !logos[n.id]).map((n) => n.id)).toEqual([]);
  });
});

describe('perfis do quiz', () => {
  it('o Teste de Afinidade tem exatamente as distros de PC do dia a dia (com perfil, ativas)', () => {
    expect(Object.keys(traits).sort()).toEqual(wiki.filter(inQuiz).map((n) => n.id).sort());
    for (const id of ['rhel', 'rocky', 'alma', 'android', 'lineageos', 'openwrt', 'alpine', 'centos', 'mandriva', 'wsl', 'chromeos']) expect(traits[id], id).toBeUndefined();
  });

  it('toda distro de desktop ativa tem perfil (exceto as marcadas com quiz: false e o projeto openSUSE)', () => {
    const missing = wiki.filter((n) => n.cats?.includes('desktop') && !n.discontinued && n.quiz !== false && !n.profile && n.id !== 'opensuse');
    expect(missing.map((n) => n.id)).toEqual([]);
  });

  it('todo perfil corresponde a uma gota da Wiki', () => {
    for (const id of Object.keys(traits)) expect(byId.has(id), id).toBe(true);
  });
});

describe('wikiIdFor: nomes do site → gota da Wiki', () => {
  it('resolve variações de nome', () => {
    expect(wikiIdFor('Linux Mint (Cinnamon)')).toBe('mint');
    expect(wikiIdFor('Linux Mint MATE')).toBe('mint');
    expect(wikiIdFor('Fedora Sway')).toBe('fedora');
    expect(wikiIdFor('Gentoo Testing')).toBe('gentoo');
    expect(wikiIdFor('Debian (XFCE ou LXQt)')).toBe('debian');
    expect(wikiIdFor('LFS')).toBe('lfs');
    expect(wikiIdFor('KDE Plasma')).toBe('kde');
    expect(wikiIdFor('i3wm')).toBe('i3');
  });

  it('nomes fora da Wiki não viram link', () => {
    expect(wikiIdFor('Windows 11')).toBeUndefined();
    expect(wikiIdFor('macOS Sonoma')).toBeUndefined();
    expect(wikiIdFor('')).toBeUndefined();
  });

  it('todas as distros do guia e da tabela têm gota', () => {
    const names = [...guide.flatMap((g) => g.groups.flatMap((x) => x.distros)), ...distros.map((d) => d.name)];
    expect(names.filter((n) => !wikiIdFor(n))).toEqual([]);
  });

  it('todas as interfaces do passo 3 têm gota', () => {
    expect(desktops.filter((d) => !wikiIdFor(d.name)).map((d) => d.name)).toEqual([]);
  });
});

import { PIX_CODE, PIX_KEY, BMC_URL } from '../src/data/donate';

describe('doação por Pix', () => {
  // CRC16-CCITT (polinômio 0x1021, início 0xFFFF), o dígito verificador do BR Code
  const crc16 = (s: string) => {
    let crc = 0xffff;
    for (const b of new TextEncoder().encode(s)) {
      crc ^= b << 8;
      for (let i = 0; i < 8; i++) crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  it('código Pix com dígito verificador válido', () => {
    expect(PIX_CODE.endsWith(crc16(PIX_CODE.slice(0, -4)))).toBe(true);
  });

  it('código Pix é estático (sem valor fixo), em reais e com a chave aleatória', () => {
    expect(PIX_CODE.startsWith('000201')).toBe(true);
    expect(PIX_CODE).toContain('BR.GOV.BCB.PIX');
    expect(PIX_CODE).toContain(PIX_KEY);
    expect(PIX_CODE).toContain('5303986'); // moeda: real
    expect(PIX_CODE).not.toMatch(/54\d{2}\d+\.\d{2}/); // campo 54 (valor) ausente
    expect(PIX_KEY).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('QR Code existe e o link do Buy Me a Coffee é https', () => {
    expect(existsSync('public/pix-qr.svg')).toBe(true);
    expect(BMC_URL).toMatch(/^https:\/\/buymeacoffee\.com\//);
  });
});

describe('contrato para adicionar uma distro (ver README › Como adicionar uma distro)', () => {
  const distros = wiki.filter((n) => n.profile);
  it('toda distro com perfil está abaixo do Linux, com descrição, ano e público ideal', () => {
    for (const n of distros) {
      expect(subtree('linux'), `${n.id}: precisa ficar abaixo do Linux (campo parent)`).toContain(n.id);
      expect(n.desc, `${n.id}: falta desc`).toBeTruthy();
      expect(n.for, `${n.id}: falta "for" (ideal para)`).toBeTruthy();
      expect(n.ease && n.config && n.terminal, `${n.id}: faltam as notas ease/config/terminal`).toBeTruthy();
    }
  });

  it('toda distro com perfil tem logo (campo logo ou tabela em logos.ts), exceto CRUX', () => {
    for (const n of distros) if (n.id !== 'crux') expect(logos[n.id], `${n.id}: falta logo (ex.: logo: 'si:debian')`).toBeTruthy();
  });

  it('perfil completo em toda distro', () => {
    const keys = ['gaming', 'old', 'nvidia', 'look', 'release', 'systemd', 'nonfree', 'privacy', 'uses', 'custom', 'docs'];
    for (const n of distros) for (const k of keys) expect((n.profile as any)[k], `${n.id}.profile.${k}`).not.toBeUndefined();
  });
});
