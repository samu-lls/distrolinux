// Comparador de distros: monta a tabela (seções → linhas → células) a partir da Wiki.
// Toda distro ativa da Wiki aparece aqui. O tipo escolhido no topo (Desktop, Servidor, Celular, Embarcados) define
// as linhas; cada distro mostra os grupos a que pertence. Informação ausente vira "-".
// Os rótulos e valores são escritos em português e traduzidos com tr() (src/i18n/en.ts).

import { wiki, isDistro, type WikiNode, type Profile, type Cat } from './wiki';
import { type Lang, tr, deepTr } from '../i18n';
import { CMP_TYPES, fitsType, type CmpType } from './cmp-type';
export { CMP_TYPES, fitsType, typeFor, compareHref, type CmpType } from './cmp-type';

export const MAX_COMPARE = 4;

// três distros diferentes como padrão em cada tipo (nenhuma se repete entre os tipos)
export const DEFAULTS: Record<CmpType, string[]> = {
  desktop: ['mint', 'fedora', 'arch'],
  server: ['rhel', 'rocky', 'alma'],
  mobile: ['android', 'lineageos', 'grapheneos'],
  embedded: ['openwrt', 'raspios', 'tinycore'],
};
export const DEFAULT_COMPARE = DEFAULTS.desktop;

// selo de grupo mostrado em cima de cada distro
export const GROUP_LABEL: Record<Cat, string> = {
  desktop: 'Uso diário', server: 'Servidor', mobile: 'Celular', embedded: 'Embarcados',
  security: 'Segurança', gaming: 'Jogos', chromebook: 'Chromebook',
};
export const parseType = (raw: string | null): CmpType => (CMP_TYPES.some((t) => t.id === raw) ? (raw as CmpType) : 'desktop');

export type Cell =
  | { kind: 'text'; text: string; best?: boolean }
  | { kind: 'link'; text: string; href: string }
  | { kind: 'bars'; value: number; best?: boolean }
  | { kind: 'list'; items: string[] };

export interface Row { label: string; hint?: string; cells: Cell[]; same: boolean }
export interface Section { title: string; rows: Row[] }

// distros sem perfil (servidores, celulares…) recebem um perfil vazio: as linhas que dependem dele viram "-"
type Getter = (n: WikiNode, p: Partial<Profile>) => Cell | null;
// `better` marca o melhor valor da linha (maior ou menor nota) quando as distros diferem
interface RowDef { label: string; hint?: string; get: Getter; score?: (n: WikiNode, p: Partial<Profile>) => number | null | undefined; better?: 'high' | 'low' }

const byId = new Map(wiki.map((n) => [n.id, n]));
export const comparable = wiki.filter((n) => isDistro(n) && !n.discontinued);

const text = (s: string | number | undefined | null): Cell | null => (s == null || s === '' ? null : { kind: 'text', text: String(s) });
const level = (labels: string[]) => (v: number | undefined): Cell | null => (v == null ? null : { kind: 'text', text: labels[v] });
const isHub = (id?: string) => { const k = id ? byId.get(id)?.kind : undefined; return k === 'root' || k === 'hub'; };

// família = ramo logo abaixo do Linux ou do GNU (Debian, Arch, Android…); quem está nesse nível é a própria família
function family(n: WikiNode) {
  let cur = n;
  while (cur.parent && !isHub(cur.parent)) cur = byId.get(cur.parent)!;
  return cur.parent ? cur : null;
}
const spec = (k: keyof NonNullable<WikiNode['specs']>) => (n: WikiNode) => text(n.specs?.[k]);

const RELEASE: Record<Profile['release'], string> = {
  fixed: 'Fixo (versões com data)', rolling: 'Rolling release (atualização contínua)', immutable: 'Imutável',
  source: 'Compilado do código-fonte', live: 'Live (roda do pendrive)',
};
const LOOK: Record<Profile['look'], string> = {
  windows: 'Parecido com o Windows', mac: 'Parecido com o macOS', own: 'Visual próprio',
  custom: 'Você monta do seu jeito', any: 'Varia conforme a edição',
};
const USES: Record<string, string> = {
  desktop: 'Uso pessoal', dev: 'Programação', server: 'Servidor', security: 'Segurança',
  creative: 'Criação de conteúdo', gaming: 'Jogos', learn: 'Aprendizado', privacy: 'Privacidade', portable: 'Portátil (pendrive)',
};

const COMMON = 1; // a primeira seção (Visão geral) vale para todos os tipos
const SECTIONS: { title: string; rows: RowDef[]; type?: CmpType }[] = [
  {
    title: 'Visão geral',
    rows: [
      { label: 'Família', get: (n) => {
        const f = family(n);
        return text(f?.kind === 'group' ? 'Independente' : f?.name);
      } },
      { label: 'Baseada em', get: (n) => {
        const p = n.parent ? byId.get(n.parent) : undefined;
        return text(!p || p.kind === 'root' || p.kind === 'hub' ? 'Base própria' : p.kind === 'group' ? 'Independente' : p.name);
      } },
      { label: 'Criada por', get: (n) => text(n.by) },
      { label: 'Primeiro lançamento', get: (n) => text(n.year) },
      { label: 'Derivadas na Wiki', get: (n) => text(wiki.filter((x) => x.parent === n.id).length || null) },
      { label: 'Site oficial', get: (n) => (n.site ? { kind: 'link', text: new URL(n.site).hostname.replace(/^www\./, ''), href: n.site } : null) },
      { label: 'Download', get: (n) => (n.download ? { kind: 'link', text: 'Baixar ISO', href: n.download } : null) },
    ],
  },
  {
    title: 'Sistema', type: 'desktop',
    rows: [
      { label: 'Modelo de atualização', get: (_, p) => text(p.release && RELEASE[p.release]) },
      { label: 'Detalhes do lançamento', get: (n) => text(n.model) },
      { label: 'Gerenciador de pacotes', get: (n) => text(n.pkg) },
      { label: 'Loja de apps', get: (n) => text(n.store) },
      { label: 'Sistema de init', get: (n) => text(n.init) },
      { label: 'Usa systemd', get: (_, p) => text(p.systemd == null ? null : p.systemd === 'both' ? 'Opcional' : p.systemd ? 'Sim' : 'Não') },
      { label: 'Sistema imutável', hint: 'O sistema base é somente leitura e as atualizações são atômicas', get: (_, p) => text(p.release == null ? null : p.release === 'immutable' ? 'Sim' : 'Não') },
    ],
  },
  {
    title: 'Interface', type: 'desktop',
    rows: [
      { label: 'Interface padrão', get: (n) => text(n.des?.[0]) },
      { label: 'Interfaces disponíveis', get: (n) => (n.des?.length ? { kind: 'list', items: n.des } : null) },
      { label: 'Visual', get: (_, p) => text(p.look && LOOK[p.look]) },
      { label: 'Personalização', get: (_, p) => level(['Pouca', 'Boa', 'Total'])(p.custom), score: (_, p) => p.custom, better: 'high' },
    ],
  },
  {
    title: 'Uso no dia a dia', type: 'desktop',
    rows: [
      { label: 'Facilidade de uso', hint: '5 = muito fácil', get: (n) => (n.ease ? { kind: 'bars', value: n.ease } : null), score: (n) => n.ease ?? null, better: 'high' },
      { label: 'Configuração necessária', hint: '5 = muita', get: (n) => (n.config ? { kind: 'bars', value: n.config } : null), score: (n) => n.config ?? null, better: 'low' },
      { label: 'Uso de terminal', hint: '5 = constante', get: (n) => (n.terminal ? { kind: 'bars', value: n.terminal } : null), score: (n) => n.terminal ?? null, better: 'low' },
      { label: 'Comunidade e documentação', get: (_, p) => level(['Pequena', 'Boa', 'Enorme'])(p.docs), score: (_, p) => p.docs, better: 'high' },
      { label: 'Ideal para', get: (n) => text(n.for) },
      { label: 'Indicada para', get: (_, p) => (p.uses ? { kind: 'list', items: p.uses.map((u) => USES[u]) } : null) },
    ],
  },
  {
    title: 'Hardware', type: 'desktop',
    rows: [
      { label: 'Computadores antigos', get: (_, p) => level(['Pede um PC atual', 'Roda em PC mediano', 'Ótima para PC antigo'])(p.old), score: (_, p) => p.old, better: 'high' },
      { label: 'Placas NVIDIA', get: (_, p) => level(['Pode dar trabalho', 'Driver instalado à parte', 'Driver pronto'])(p.nvidia), score: (_, p) => p.nvidia, better: 'high' },
    ],
  },
  {
    title: 'Jogos e software', type: 'desktop',
    rows: [
      { label: 'Jogos', get: (_, p) => level(['Não é o foco', 'Joga bem com ajustes', 'Feita para jogos'])(p.gaming), score: (_, p) => p.gaming, better: 'high' },
      { label: 'Drivers e codecs fechados', get: (_, p) => level(['Só software livre por padrão', 'Disponíveis nos repositórios', 'Já vêm prontos'])(p.nonfree) },
    ],
  },
  {
    title: 'Privacidade e segurança', type: 'desktop',
    rows: [
      { label: 'Coleta telemetria', get: (_, p) => text(p.privacy == null ? null : p.telemetry ? 'Sim (pode desativar)' : 'Não') },
      { label: 'Foco em privacidade', get: (_, p) => level(['Comum', 'Bom', 'Prioridade máxima'])(p.privacy), score: (_, p) => p.privacy, better: 'high' },
    ],
  },
  {
    title: 'Brasil', type: 'desktop',
    rows: [
      { label: 'Bancos brasileiros e gov.br', get: (_, p) => (p.br ? text('Boa compatibilidade') : null) },
    ],
  },
  {
    title: 'Servidor', type: 'server',
    rows: [
      { label: 'Modelo de atualização', get: (n) => text(n.model) },
      { label: 'Suporte de cada versão', get: spec('support') },
      { label: 'Suporte pago', get: spec('paid') },
      { label: 'Compatibilidade', get: spec('compat') },
      { label: 'Nuvens', get: spec('cloud') },
      { label: 'Gerenciador de pacotes', get: (n) => text(n.pkg) },
      { label: 'Sistema de init', get: (n) => text(n.init) },
    ],
  },
  {
    title: 'Celular', type: 'mobile',
    rows: [
      { label: 'Aparelhos', get: spec('devices') },
      { label: 'Apps', get: spec('apps') },
      { label: 'Serviços do Google', get: spec('google') },
      { label: 'Atualizações', get: (n) => text(n.model) },
      { label: 'Foco em segurança', get: (n) => text(n.cats?.includes('security') ? 'Prioridade máxima' : null) },
    ],
  },
  {
    title: 'Embarcados', type: 'embedded',
    rows: [
      { label: 'Hardware', get: spec('hardware') },
      { label: 'Tamanho e requisitos', get: spec('footprint') },
      { label: 'Ideal para', get: (n) => text(n.for) },
      { label: 'Gerenciador de pacotes', get: (n) => text(n.pkg) },
      { label: 'Sistema de init', get: (n) => text(n.init) },
      { label: 'Atualizações', get: (n) => text(n.model) },
    ],
  },
];

const cellKey = (c: Cell) => (c.kind === 'bars' ? `b${c.value}` : c.kind === 'list' ? c.items.join('|') : c.text);

// ids da URL (?d=ubuntu,fedora) → só os que existem, sem repetição, no máximo MAX_COMPARE
export function parseIds(raw: string | null): string[] {
  const ok = new Set(comparable.map((n) => n.id));
  const ids = (raw ?? '').split(',').map((s) => s.trim()).filter((id) => ok.has(id));
  return [...new Set(ids)].slice(0, MAX_COMPARE);
}

export function compareTable(ids: string[], lang: Lang, type: CmpType = 'desktop') {
  const t = (s: string) => tr(lang, s);
  const ok = new Set(comparable.map((n) => n.id));
  const nodes = ids.map((id) => byId.get(id)).filter((n): n is WikiNode => !!n && ok.has(n.id));
  const sections = SECTIONS.filter((sec, i) => i < COMMON || sec.type === type).map((sec) => ({
    title: t(sec.title),
    rows: sec.rows.map((def) => {
      const cells: Cell[] = nodes.map((n) => {
        const c = def.get(n, n.profile ?? {});
        if (!c) return { kind: 'text', text: '-' };
        if (c.kind === 'text') return { ...c, text: t(c.text) };
        if (c.kind === 'link') return { ...c, text: t(c.text) };
        if (c.kind === 'list') return { ...c, items: c.items.map(t) };
        return c;
      });
      // destaca o melhor valor quando há diferença entre as distros
      if (def.score && def.better && nodes.length > 1) {
        const scores = nodes.map((n) => def.score!(n, n.profile ?? {}));
        const valid = scores.filter((s): s is number => s != null);
        if (new Set(valid).size > 1) {
          const target = def.better === 'high' ? Math.max(...valid) : Math.min(...valid);
          scores.forEach((s, i) => {
            const c = cells[i];
            if (s === target && (c.kind === 'text' || c.kind === 'bars')) c.best = true;
          });
        }
      }
      return { label: t(def.label), hint: def.hint && t(def.hint), cells, same: new Set(cells.map(cellKey)).size <= 1 };
    }),
  }));
  // selos de grupo de cada distro; `fits` diz se ela é do tipo escolhido
  const groups = nodes.map((n) => ({ fits: fitsType(n, type), labels: (n.cats ?? []).map((c) => t(GROUP_LABEL[c])) }));
  return { distros: deepTr(lang, nodes), sections, groups };
}

// rótulos e valores fixos usados pela tabela (para os testes de tradução)
export const COMPARE_TEXTS = [
  ...SECTIONS.flatMap((s) => [s.title, ...s.rows.flatMap((r) => [r.label, r.hint ?? ''])]),
  ...Object.values(RELEASE), ...Object.values(LOOK), ...Object.values(USES),
  'Independente', 'Base própria', 'Baixar ISO', 'Opcional', 'Sim', 'Não', 'Pouca', 'Boa', 'Total', 'Pequena', 'Enorme',
  'Pede um PC atual', 'Roda em PC mediano', 'Ótima para PC antigo', 'Pode dar trabalho', 'Driver instalado à parte',
  'Driver pronto', 'Não é o foco', 'Joga bem com ajustes', 'Feita para jogos', 'Só software livre por padrão',
  'Disponíveis nos repositórios', 'Já vêm prontos', 'Sim (pode desativar)', 'Comum', 'Bom', 'Prioridade máxima',
  'Boa compatibilidade', 'Prioridade máxima',
  ...CMP_TYPES.map((x) => x.label), ...Object.values(GROUP_LABEL),
].filter(Boolean);
