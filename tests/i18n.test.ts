import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { tr, deepTr, localePath, stripLang, langFromPath } from '../src/i18n';
import { en } from '../src/i18n/en';
import { wiki } from '../src/data/wiki';
import { guide, tags, distros, desktops, displayServers } from '../src/data/distros';
import { questions } from '../src/data/quiz';
import { JOURNEY, JOURNEY_TEXTS } from '../src/data/journey';
import { portuguese, strings } from './helpers';

describe('funções de idioma', () => {
  it('tr: português é identidade; inglês traduz; sem tradução cai no original', () => {
    expect(tr('pt', 'Abrir tudo')).toBe('Abrir tudo');
    expect(tr('en', 'Abrir tudo')).toBe('Expand all');
    expect(tr('en', 'Debian')).toBe('Debian');
  });

  it('deepTr traduz textos e preserva ids, ligações e endereços', () => {
    const n = { id: 'iniciante', parent: 'unix', site: 'https://x', seenIn: ['mint'], name: 'Independentes', list: ['Sim', 'Não'] };
    const out = deepTr('en', n);
    expect(out).toEqual({ id: 'iniciante', parent: 'unix', site: 'https://x', seenIn: ['mint'], name: 'Independent', list: ['Yes', 'No'] });
    expect(deepTr('pt', n)).toBe(n);
  });

  it('caminhos por idioma', () => {
    expect(localePath('en', '/')).toBe('/en/');
    expect(localePath('en', '/wiki')).toBe('/en/wiki');
    expect(localePath('pt', '/wiki')).toBe('/wiki');
    expect(stripLang('/en/wiki')).toBe('/wiki');
    expect(stripLang('/en/')).toBe('/');
    expect(stripLang('/en')).toBe('/');
    expect(stripLang('/english')).toBe('/english');
    expect(langFromPath('/en/quiz')).toBe('en');
    expect(langFromPath('/quiz')).toBe('pt');
  });
});

describe('dicionário em inglês', () => {
  it('nenhuma tradução vazia ou idêntica a um texto em português', () => {
    for (const [pt, value] of Object.entries(en)) {
      expect(value.trim(), pt).not.toBe('');
      expect(portuguese(value), `"${value}"`).toBeNull();
    }
  });

  it('marcadores {n} iguais na chave e na tradução', () => {
    const marks = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const [pt, value] of Object.entries(en)) expect(marks(value), pt).toBe(marks(pt));
  });

  it('tags <b> preservadas nas dicas', () => {
    for (const [pt, value] of Object.entries(en)) {
      expect((value.match(/<b>/g) ?? []).length, pt).toBe((pt.match(/<b>/g) ?? []).length);
    }
  });
});

describe('cobertura da tradução', () => {
  it('jornada (navbar e "Próximo passo")', () => {
    expect(JOURNEY[0].href).toBe('/');
    expect(new Set(JOURNEY.map((s) => s.href)).size).toBe(JOURNEY.length);
    for (const s of JOURNEY_TEXTS) if (portuguese(s)) expect(en[s], s).toBeDefined();
    // nomes que não parecem português (Wiki, Windows vs Linux) também precisam existir ou ser iguais nos dois idiomas
    for (const s of JOURNEY) expect(tr('en', s.label)).toBeTruthy();
  });

  const check = (label: string, data: unknown) => {
    const leftovers = strings(deepTr('en', data)).filter(([, s]) => portuguese(s));
    expect(leftovers.map(([p, s]) => `${label}.${p}: ${s}`)).toEqual([]);
  };

  it('dados da Wiki', () => check('wiki', wiki));
  it('guia de distros', () => {
    check('guide', guide);
    check('tags', tags);
    check('distros', distros);
    check('desktops', desktops);
    check('displayServers', displayServers);
  });

  it('perguntas, opções e explicações do quiz', () => {
    for (const q of questions) {
      for (const s of [q.text, q.help ?? '', ...q.options.map((o) => o.text)]) {
        expect(portuguese(tr('en', s)), s).toBeNull();
      }
    }
  });

  it('motivos do quiz (a favor / contra)', () => {
    const src = readFileSync('src/data/quiz.ts', 'utf8');
    const texts = [...src.matchAll(/r\(([^\n]*)\)/g)].flatMap((m) => [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((x) => x[1]));
    const shown = texts.filter((s) => s.length > 3 && portuguese(s));
    expect(shown.length).toBeGreaterThan(50);
    for (const s of shown) expect(en[s], s).toBeDefined();
  });

  it('todo t("…") das páginas, componentes e scripts tem tradução', () => {
    const dirs = ['src/views', 'src/components', 'src/layouts', 'src/scripts'];
    const missing: string[] = [];
    for (const d of dirs) {
      for (const f of readdirSync(d)) {
        const src = readFileSync(join(d, f), 'utf8');
        for (const m of src.matchAll(/\btf?\(\s*'((?:[^'\\]|\\.)*)'/g)) {
          if (portuguese(m[1]) && !en[m[1]]) missing.push(`${d}/${f}: ${m[1]}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('dicas do mascote da Wiki', () => {
  it('todas têm tradução', () => {
    const src = readFileSync('src/views/Wiki.astro', 'utf8');
    const tips = [...src.matchAll(/'((?:[^'\\\n]|\\.)*<b>(?:[^'\\\n]|\\.)*)'/g)].map((m) => m[1]);
    expect(tips.length).toBeGreaterThanOrEqual(7);
    for (const s of tips) expect(en[s], s).toBeDefined();
  });
});

describe('textos soltos no JavaScript das páginas', () => {
  // todo texto em português dentro de <script> precisa passar por t()/tf(), senão aparece sem tradução
  it('nenhum texto em português fora de t()', () => {
    const problems: string[] = [];
    for (const f of readdirSync('src/views')) {
      const src = readFileSync(join('src/views', f), 'utf8');
      for (const block of src.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
        block[1].split('\n').forEach((line, i) => {
          if (/^\s*(\/\/|\/\*|\*)/.test(line)) return; // comentários
          if (line.includes('<b>')) return; // dicas do mascote: traduzidas com .map(t)
          for (const m of line.matchAll(/'((?:[^'\\]|\\.)*)'/g)) {
            if (!portuguese(m[1])) continue;
            if (/^[.#]?[\w-]+$/.test(m[1])) continue; // identificadores (classes CSS, ids)
            const before = line.slice(0, m.index).trimEnd();
            if (!/\btf?\($/.test(before)) problems.push(`${f}:${i + 1}: ${m[1]}`);
          }
        });
      }
    }
    expect(problems).toEqual([]);
  });
});
