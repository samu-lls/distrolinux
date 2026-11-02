// Logos das gotas: vetores oficiais do simple-icons (com a cor da marca), arquivos baixados em /public/logos ou
// ícones próprios em vetor (VEC) para conceitos e distros sem logo no simple-icons. Toda gota tem um.
// Roda só no build (frontmatter das páginas); o resultado vai para o navegador como JSON.
import * as icons from 'simple-icons';
import { wiki } from './wiki';

export type Logo = { path?: string; color?: string; src?: string };

const SIMPLE: Record<string, string> = {
  debian: 'debian', ubuntu: 'ubuntu', devuan: 'devuan', mx: 'mxlinux', deepin: 'deepin', tails: 'tails',
  kali: 'kalilinux', parrot: 'parrotsecurity', mint: 'linuxmint', zorin: 'zorin', popos: 'popos', elementary: 'elementary',
  kubuntu: 'kubuntu', xubuntu: 'xubuntu', lubuntu: 'lubuntu', ubuntumate: 'ubuntumate', arch: 'archlinux', manjaro: 'manjaro',
  artix: 'artixlinux', cachyos: 'cachyos', garuda: 'garudalinux', steamos: 'steamdeck', fedora: 'fedora', rhel: 'redhat',
  rocky: 'rockylinux', qubes: 'qubesos', opensuse: 'opensuse', leap: 'opensuse', tumbleweed: 'opensuse', gentoo: 'gentoo',
  slackware: 'slackware', void: 'voidlinux', cosmic: 'popos', solus: 'solus', nixos: 'nixos', alpine: 'alpinelinux',
  // interfaces e protocolos (Pantheon e DDE usam o logo de quem os criou)
  gnome: 'gnome', kde: 'kdeplasma', xfce: 'xfce', cinnamon: 'cinnamon', pantheon: 'elementary', dde: 'deepin',
  i3: 'i3', sway: 'sway', hyprland: 'hyprland', x11: 'xdotorg', wayland: 'wayland', xwayland: 'wayland',
};

const FILES: Record<string, string> = {
  antix: 'antix.png', knoppix: 'knoppix.png', puppy: 'puppy.svg', biglinux: 'biglinux.png', chimeraos: 'chimeraos.svg',
  blackarch: 'blackarch.png', nobara: 'nobara.png', bazzite: 'bazzite.svg', regata: 'regata.png', pclinuxos: 'pclinuxos.svg',
  lfs: 'lfs.png',
  mate: 'mate.svg', lxqt: 'lxqt.svg', budgie: 'budgie.svg', openbox: 'openbox.png', fluxbox: 'fluxbox.svg', icewm: 'icewm.png',
};

// ícones próprios (24×24, preenchidos com currentColor) e a cor de cada um
export const VEC: Record<string, { d: string; color: string }> = {
  chip: { color: '#2997ff', d: 'M9 2h2v2h2V2h2v2h1a3 3 0 0 1 3 3v1h2v2h-2v2h2v2h-2v2h2v2h-2v1a3 3 0 0 1-3 3h-1v2h-2v-2h-2v2H9v-2H8a3 3 0 0 1-3-3v-1H3v-2h2v-2H3v-2h2v-2H3V8h2V7a3 3 0 0 1 3-3h1Zm-1 6v8h8V8Zm2 2h4v4h-4Z' },
  window: { color: '#5e5ce6', d: 'M3 4h18v16H3Zm2 5v9h14V9Zm0-3v1h1.5V6Zm2.5 0v1H9V6Z' },
  monitor: { color: '#30b0c7', d: 'M2 4h20v13h-9v2h4v2H7v-2h4v-2H2Zm2 2v9h16V6Z' },
  star: { color: '#f5a623', d: 'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21l1.6-7L2 9.2l7.1-.6Z' },
  cloud: { color: '#0a84ff', d: 'M7 19a5 5 0 0 1-.6-10A6 6 0 0 1 18 8.5 4.5 4.5 0 0 1 17.5 19Z' },
  phone: { color: '#34c759', d: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v13h10V5Zm4 14v1h2v-1Z' },
  cube: { color: '#bf5af2', d: 'M12 2 3 7v10l9 5 9-5V7Zm0 2.3L18.7 8 12 11.7 5.3 8Zm-7 5.4 6 3.4v6.6l-6-3.4Zm8 10V13l6-3.3v6.6Z' },
  switch: { color: '#64d2ff', d: 'M2 7h20v10H2Zm3 3v4h2v-4Zm4 0v4h2v-4Zm4 0v4h2v-4Zm4 0v2h2v-2Z' },
  shield: { color: '#0a84ff', d: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5Zm-1 13-3-3 1.4-1.4 1.6 1.6 4-4L16.4 9.6Z' },
  clock: { color: '#ff9f0a', d: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-1 3h2v4.4l3.5 2-1 1.7L11 12.6Z' },
  gear: { color: '#8e8e93', d: 'M10.3 2h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9L2 13.7v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8ZM12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z' },
  terminal: { color: '#0a84ff', d: 'M3 4h18v16H3Zm2 2v12h14V6Zm1.6 2.6L10 12l-3.4 3.4L5.2 14l2-2-2-2Zm4.4 5.4h6v2h-6Z' },
  browser: { color: '#ff9f0a', d: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm0 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-4a8 8 0 0 0-6.9 4h6.9a4 4 0 0 1 0 0h6.9A8 8 0 0 0 12 4Z' },
  layers: { color: '#ffd60a', d: 'M12 2 2 7l10 5 10-5Zm-10 9 2-1 8 4 8-4 2 1-10 5Zm0 4 2-1 8 4 8-4 2 1-10 5Z' },
  leaf: { color: '#30d158', d: 'M20 3C10 3 4 8 4 16c0 1 .1 2 .3 3l1.9-.6C8 13 12 10 17 8c-4 3-7 6-9 11 9 0 12-7 12-16Z' },
  usb: { color: '#8e8e93', d: 'M9 2h6v6h2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8h2Zm1 2v3h1V4Zm3 0v3h1V4Z' },
  bolt: { color: '#ff375f', d: 'M13 2 4 14h7l-1 8 9-12h-7Z' },
  grid: { color: '#5e5ce6', d: 'M3 3h8v8H3Zm10 0h8v5h-8Zm0 7h8v11h-8ZM3 13h8v8H3Z' },
};

const bySlug = new Map(Object.values(icons).filter((i: any) => i?.slug).map((i: any) => [i.slug, i]));

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// o campo `logo` da própria distro (wiki.ts) vence as tabelas acima: 'si:<slug>' ou 'file:<arquivo>'
const fromNode = (logo?: string) => ({
  slug: logo?.startsWith('si:') ? logo.slice(3) : undefined,
  file: logo?.startsWith('file:') ? logo.slice(5) : undefined,
  vec: logo?.startsWith('vec:') ? VEC[logo.slice(4)] : undefined,
});
// gotas antigas sem logo próprio no simple-icons
const VEC_OF: Record<string, string> = { indep: 'cube', wm: 'grid', crux: 'gear' };

export const logos: Record<string, Logo> = Object.fromEntries(
  wiki.flatMap((n) => {
    const own = fromNode(n.logo);
    if (own.file) return [[n.id, { src: `/logos/${own.file}` }]];
    const vec = own.vec ?? (VEC_OF[n.id] ? VEC[VEC_OF[n.id]] : undefined);
    if (vec) return [[n.id, { path: vec.d, color: vec.color }]];
    const icon = bySlug.get(own.slug ?? SIMPLE[n.id] ?? '');
    if (icon) {
      const l = luminance(icon.hex);
      // cores quase pretas ou quase brancas sumiriam em um dos temas: usam a cor do texto
      return [[n.id, { path: icon.path, color: l < 0.12 || l > 0.9 ? '' : `#${icon.hex}` }]];
    }
    return FILES[n.id] ? [[n.id, { src: `/logos/${FILES[n.id]}` }]] : [];
  }),
);
