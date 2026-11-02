// Idiomas do site. O texto em português é a própria chave da tradução: o código continua legível
// e um texto sem tradução cai de volta no português (os testes pegam esses casos).
import { en } from './en';

export type Lang = 'pt' | 'en';
export const LANGS: Lang[] = ['pt', 'en'];
export const htmlLang: Record<Lang, string> = { pt: 'pt-BR', en: 'en-US' };
export const ogLocale: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };

export function tr(lang: Lang, s: string): string {
  return lang === 'en' ? (en[s] ?? s) : s;
}

// campos que nunca são traduzidos (ids, ligações entre nós, endereços)
const SKIP = new Set(['id', 'parent', 'tag', 'kind', 'site', 'download', 'seenIn', 'cls', 'art', 'src', 'path', 'color', 'profile', 'logo']);

// traduz todos os textos de um objeto (dados da Wiki, do guia, do quiz…)
export function deepTr<T>(lang: Lang, v: T): T {
  if (lang === 'pt') return v;
  if (typeof v === 'string') return tr(lang, v) as T;
  if (Array.isArray(v)) return v.map((x) => deepTr(lang, x)) as T;
  if (v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, SKIP.has(k) ? x : deepTr(lang, x)])) as T;
  }
  return v;
}

// "/wiki" -> "/en/wiki" ; "/" -> "/en/"
export const localePath = (lang: Lang, path: string) => (lang === 'en' ? (path === '/' ? '/en/' : `/en${path}`) : path);
// "/en/wiki" -> "/wiki"
export const stripLang = (path: string) => path.replace(/^\/en(?=\/|$)/, '') || '/';
export const langFromPath = (path: string): Lang => (/^\/en(\/|$)/.test(path) ? 'en' : 'pt');
