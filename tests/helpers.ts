// Detector de texto em português, usado para garantir que nada escapou da tradução.
// Acentos típicos ou palavras que só existem em português (evita "do", "no", "a", "os", que também são inglês).
const PT_WORDS = [
  'de', 'da', 'das', 'dos', 'para', 'pra', 'com', 'sem', 'que', 'não', 'mais', 'muito', 'muita', 'uma', 'você',
  'ou', 'também', 'já', 'é', 'ao', 'aos', 'pelo', 'pela', 'seu', 'sua', 'nas', 'nos', 'quem', 'tudo', 'cada',
  'são', 'está', 'isso', 'esta', 'este', 'onde', 'quando', 'como', 'mas', 'ver', 'clique', 'gota', 'padrão',
];
const PT_RE = new RegExp(`[ãõçáéíóúâêôà]|\\b(${PT_WORDS.join('|')})\\b`, 'i');

// nomes próprios e termos que aparecem iguais nas duas línguas
export const ALLOWED = [
  'Português', 'pt-BR', 'r/linuxbrasil', 'gov.br', 'Per Lidén', 'Marko Maček', 'Kristian Høgsberg', 'Dr460nized',
];

export function portuguese(text: string): string | null {
  let t = text;
  for (const a of ALLOWED) t = t.split(a).join(' ');
  t = t.replace(/\b[\w.-]+\.(com|org|net|io|br|gg|us|land)(\/\S*)?/gi, ' '); // domínios (github.com…)
  for (const m of t.matchAll(new RegExp(PT_RE.source, 'gi'))) {
    // siglas em maiúsculas (DE, WM) não são palavras em português
    if (m[0].length > 1 && m[0] === m[0].toUpperCase() && /^[A-Z]+$/.test(m[0])) continue;
    return m[0];
  }
  return null;
}

// todas as strings de um objeto, com o caminho até elas (ignora campos que não são texto exibido)
const NOT_TEXT = new Set(['id', 'parent', 'tag', 'kind', 'site', 'download', 'seenIn', 'path', 'src', 'color', 'icon', 'profile', 'logo']);
export function strings(v: unknown, path = ''): [string, string][] {
  if (typeof v === 'string') return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${path}[${i}]`));
  if (v && typeof v === 'object') {
    return Object.entries(v).flatMap(([k, x]) => (NOT_TEXT.has(k) ? [] : strings(x, path ? `${path}.${k}` : k)));
  }
  return [];
}
