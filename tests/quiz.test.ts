import { describe, it, expect } from 'vitest';
import { questions, rank, candidates, type Answer } from '../src/data/quiz';

// ordem das perguntas: experiência, terminal, uso, computador, NVIDIA, visual,
// atualizações, personalização, software livre, privacidade, bancos, systemd
const ans = (opts: (number | null)[], important: number[] = []): (Answer | null)[] =>
  opts.map((o, i) => (o == null ? null : { option: o, important: important.includes(i) }));
const top = (opts: (number | null)[], n = 3) => rank(ans(opts)).slice(0, n).map((m) => m.c.node.id);

describe('estrutura do quiz', () => {
  it('12 perguntas, todas com opções', () => {
    expect(questions).toHaveLength(12);
    for (const q of questions) expect(q.options.length, q.text).toBeGreaterThanOrEqual(2);
  });

  it('toda regra devolve null ou um valor entre -1 e 1 com texto', () => {
    for (const q of questions) {
      for (const o of q.options) {
        for (const rule of o.rules) {
          for (const c of candidates) {
            const r = rule(c);
            if (!r) continue;
            expect(r.v, `${q.text} / ${o.text} / ${c.node.id}`).toBeGreaterThanOrEqual(-1);
            expect(r.v).toBeLessThanOrEqual(1);
            expect(typeof r.text).toBe('string');
          }
        }
      }
    }
  });
});

describe('rank: pontuação', () => {
  it('pular tudo deixa todas as distros empatadas em 50%', () => {
    const r = rank(questions.map(() => null));
    expect(r).toHaveLength(candidates.length);
    expect(new Set(r.map((m) => m.pct))).toEqual(new Set([50]));
  });

  it('porcentagens sempre entre 0 e 100 e em ordem decrescente (200 combinações aleatórias)', () => {
    let seed = 7;
    const rnd = (n: number) => ((seed = (seed * 9301 + 49297) % 233280) / 233280) * n;
    for (let k = 0; k < 200; k++) {
      const opts = questions.map((q) => (rnd(5) < 1 ? null : Math.floor(rnd(q.options.length))));
      const r = rank(ans(opts, [Math.floor(rnd(12))]));
      for (let i = 0; i < r.length; i++) {
        expect(r[i].pct).toBeGreaterThanOrEqual(0);
        expect(r[i].pct).toBeLessThanOrEqual(100);
        if (i) expect(r[i - 1].pct).toBeGreaterThanOrEqual(r[i].pct);
      }
    }
  });

  it('"muito importante" aumenta o peso da resposta', () => {
    // resposta "jogos" importante deve favorecer ainda mais as distros de jogos
    const opts = [0, 0, 1, 2, null, null, null, null, null, null, null, null];
    const normal = rank(ans(opts)).find((m) => m.c.node.id === 'bazzite')!.pct;
    const imp = rank(ans(opts, [2])).find((m) => m.c.node.id === 'bazzite')!.pct;
    expect(imp).toBeGreaterThan(normal);
  });

  it('cada resultado traz motivos a favor e contra coerentes', () => {
    const r = rank(ans([0, 0, 0, 3, 1, 0, 0, 0, 0, 1, 2, 0]));
    const best = r[0], worst = r[r.length - 1];
    expect(best.pros.length).toBeGreaterThan(0);
    expect(worst.cons.length).toBeGreaterThan(0);
    for (const m of r) for (const x of [...m.pros, ...m.cons]) expect(x.weight).toBeGreaterThan(0);
  });
});

describe('perfis típicos', () => {
  it('gamer com NVIDIA → distros de jogos no topo', () => {
    const t = top([1, 1, 1, 0, 0, 3, 2, 0, 0, 0, 2, 0]);
    expect(t.some((id) => ['bazzite', 'nobara', 'popos', 'regata', 'cachyos'].includes(id))).toBe(true);
  });

  it('PC muito antigo, iniciante → distros leves no topo', () => {
    expect(top([0, 0, 0, 3, 1, 0, 0, 0, 0, 0, 2, 0]).some((id) => ['mx', 'lubuntu', 'antix'].includes(id))).toBe(true);
  });

  it('dev avançado que quer novidade → Arch entre os 2 primeiros', () => {
    expect(top([3, 2, 2, 0, 1, 3, 1, 2, 1, 1, 2, 0], 2)).toContain('arch');
  });

  it('hacker ético → Kali em primeiro', () => {
    expect(top([2, 2, 5, 1, 1, 3, 3, 1, 0, 1, 2, 0], 1)).toEqual(['kali']);
  });

  it('anonimato total → Tails em primeiro', () => {
    expect(top([1, 1, 0, 1, 1, 3, 3, 0, 2, 2, 2, 0], 1)).toEqual(['tails']);
  });

  it('quem usa bancos brasileiros → BigLinux ou Regata OS no topo', () => {
    expect(top([0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0]).some((id) => ['biglinux', 'regata'].includes(id))).toBe(true);
  });

  it('prefere sem systemd → só distros sem systemd no top 3', () => {
    const r = rank(ans([3, 2, 0, 1, 1, 3, 0, 2, 2, 1, 2, 1])).slice(0, 3);
    for (const m of r) expect(m.c.t.systemd, m.c.node.id).not.toBe(true);
  });
});
