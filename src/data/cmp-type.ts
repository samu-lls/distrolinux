// Tipos do Comparador (Desktop, Servidor, Celular, Embarcados) e o link "Comparar" das outras páginas.
// Sem importar a base da Wiki: a página da Wiki usa isto com os dados que já recebe prontos.
import type { WikiNode } from './wiki';

export type CmpType = 'desktop' | 'server' | 'mobile' | 'embedded';
export const CMP_TYPES: { id: CmpType; label: string }[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'server', label: 'Servidor' },
  { id: 'mobile', label: 'Celular' },
  { id: 'embedded', label: 'Embarcados' },
];

// a distro "é" do tipo escolhido? (segurança, jogos e Chromebook contam como desktop)
export const fitsType = (n: Pick<WikiNode, 'cats'>, type: CmpType) =>
  !!n.cats?.some((c) => c === type || (type === 'desktop' && ['security', 'gaming', 'chromebook'].includes(c)));

// tipo em que a distro faz mais sentido no Comparador
export const typeFor = (n: Pick<WikiNode, 'cats'>): CmpType => CMP_TYPES.map((t) => t.id).find((t) => fitsType(n, t)) ?? 'desktop';

// link para o Comparador já com a distro na primeira coluna (as outras ficam vazias)
export const compareHref = (n: Pick<WikiNode, 'id' | 'cats'>, base: string) => {
  const t = typeFor(n);
  return `${base}?${t === 'desktop' ? '' : `t=${t}&`}d=${n.id}`;
};
