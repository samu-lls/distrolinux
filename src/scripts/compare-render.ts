// Desenha a tabela do comparador em HTML. Roda no build (comparação padrão já vem pronta)
// e no navegador (quando a pessoa troca as distros), com o mesmo resultado.

import type { Section, Cell } from '../data/compare';
import type { WikiNode } from '../data/wiki';

type Logo = { path?: string; color?: string; src?: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function logoHTML(l: Logo | undefined, name: string) {
  if (l?.path) return `<svg viewBox="0 0 24 24" aria-hidden="true"${l.color ? ` style="color:${l.color}"` : ''}><path d="${l.path}"/></svg>`;
  if (l?.src) return `<img src="${l.src}" alt="" loading="lazy" />`;
  return `<b aria-hidden="true">${esc(name.slice(0, 2))}</b>`;
}

function cellHTML(c: Cell) {
  switch (c.kind) {
    case 'link':
      return `<a href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.text)} ›</a>`;
    case 'list':
      return `<ul class="cmp-list">${c.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'bars':
      return `<span class="cmp-bars" role="img" aria-label="${c.value}/5">${Array.from({ length: 5 }, (_, i) => `<i class="${i < c.value ? 'on' : ''}"></i>`).join('')}<em>${c.value}/5</em></span>`;
    default:
      return c.text === '-' ? '<span class="cmp-none">-</span>' : esc(c.text);
  }
}

export function tableHTML(
  table: { distros: WikiNode[]; sections: Section[]; groups?: { fits: boolean; labels: string[] }[] },
  logos: Record<string, Logo>,
  labels: { wiki: string; best: string; other?: string },
  wikiPath: string,
) {
  const { distros, sections, groups = [] } = table;
  // selos com os grupos da distro; quem não é do tipo escolhido ganha um aviso
  const badges = (i: number) => {
    const g = groups[i];
    if (!g) return '';
    const list = g.labels.map((l) => `<span>${esc(l)}</span>`).join('');
    return `<span class="cmp-groups${g.fits ? '' : ' off'}"${g.fits || !labels.other ? '' : ` title="${esc(labels.other)}"`}>${list}</span>`;
  };
  const head = distros
    .map(
      (n, i) => `<th scope="col"><div class="cmp-head">
        <span class="cmp-logo">${logoHTML(logos[n.id], n.name)}</span>
        <strong>${esc(n.name)}</strong>
        ${badges(i)}
        <a href="${wikiPath}#${n.id}">${esc(labels.wiki)} ›</a>
      </div></th>`,
    )
    .join('');
  const body = sections
    .map(
      (s) => `<tbody>
        <tr class="cmp-section"><th scope="rowgroup" colspan="${distros.length + 1}">${esc(s.title)}</th></tr>
        ${s.rows
          .map(
            (r) => `<tr class="${r.same ? 'same' : 'diff'}">
              <th scope="row">${esc(r.label)}${r.hint ? `<small>${esc(r.hint)}</small>` : ''}</th>
              ${r.cells
                .map((c) => `<td class="${'best' in c && c.best ? 'best' : ''}"${'best' in c && c.best ? ` title="${esc(labels.best)}"` : ''}>${cellHTML(c)}</td>`)
                .join('')}
            </tr>`,
          )
          .join('')}
      </tbody>`,
    )
    .join('');
  return `<table class="cmp-table" style="--cols:${distros.length}">
    <thead><tr><td class="cmp-corner"></td>${head}</tr></thead>${body}</table>`;
}
