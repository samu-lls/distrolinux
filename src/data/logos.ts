// Logos das distros: vetores oficiais do simple-icons (com a cor da marca) ou arquivos baixados em /public/logos.
// Roda só no build (frontmatter das páginas); o resultado vai para o navegador como JSON.
import * as icons from 'simple-icons';
import { wiki } from './wiki';

export type Logo = { path?: string; color?: string; src?: string };

const SIMPLE: Record<string, string> = {
  unix: 'linux', debian: 'debian', ubuntu: 'ubuntu', devuan: 'devuan', mx: 'mxlinux', deepin: 'deepin', tails: 'tails',
  kali: 'kalilinux', parrot: 'parrotsecurity', mint: 'linuxmint', zorin: 'zorin', popos: 'popos', elementary: 'elementary',
  kubuntu: 'kubuntu', xubuntu: 'xubuntu', lubuntu: 'lubuntu', ubuntumate: 'ubuntumate', arch: 'archlinux', manjaro: 'manjaro',
  artix: 'artixlinux', cachyos: 'cachyos', garuda: 'garudalinux', steamos: 'steamdeck', fedora: 'fedora', rhel: 'redhat',
  rocky: 'rockylinux', qubes: 'qubesos', opensuse: 'opensuse', leap: 'opensuse', tumbleweed: 'opensuse', gentoo: 'gentoo',
  slackware: 'slackware', void: 'voidlinux', solus: 'solus', nixos: 'nixos', alpine: 'alpinelinux',
};

const FILES: Record<string, string> = {
  antix: 'antix.png', knoppix: 'knoppix.png', puppy: 'puppy.svg', biglinux: 'biglinux.png', chimeraos: 'chimeraos.svg',
  blackarch: 'blackarch.png', nobara: 'nobara.png', bazzite: 'bazzite.svg', regata: 'regata.png', pclinuxos: 'pclinuxos.svg',
  lfs: 'lfs.png',
};

const bySlug = new Map(Object.values(icons).filter((i: any) => i?.slug).map((i: any) => [i.slug, i]));

const luminance = (hex: string) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const logos: Record<string, Logo> = Object.fromEntries(
  wiki.flatMap((n) => {
    const icon = SIMPLE[n.id] && bySlug.get(SIMPLE[n.id]);
    if (icon) {
      const l = luminance(icon.hex);
      // cores quase pretas ou quase brancas sumiriam em um dos temas: usam a cor do texto
      return [[n.id, { path: icon.path, color: l < 0.12 || l > 0.9 ? '' : `#${icon.hex}` }]];
    }
    return FILES[n.id] ? [[n.id, { src: `/logos/${FILES[n.id]}` }]] : [];
  }),
);
