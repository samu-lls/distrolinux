// Conteúdo do guia "Escolhendo sua distro", da comunidade r/linuxbrasil (versão 2025.1).

export interface GuideGroup {
  want: string;
  distros: string[];
  note?: string;
}

export const guide: { id: string; label: string; icon: string; groups: GuideGroup[] }[] = [
  {
    id: 'iniciante',
    label: 'Sou iniciante',
    icon: '🌱',
    groups: [
      { want: 'Parecida com Windows', distros: ['Zorin OS', 'Linux Mint (Cinnamon)'] },
      { want: 'Parecida com macOS', distros: ['Pop!_OS'] },
      { want: 'Generalista', distros: ['Ubuntu'] },
    ],
  },
  {
    id: 'avancado',
    label: 'Intermediário / Avançado',
    icon: '⚡',
    groups: [
      { want: 'Estável e segura', distros: ['Fedora', 'openSUSE Leap', 'Debian Stable'] },
      { want: 'Rolling release, mas ainda estável', distros: ['openSUSE Tumbleweed', 'Void', 'Gentoo Testing'] },
      { want: 'Para aprendizagem', distros: ['Arch Linux', 'Void', 'Slackware', 'LFS', 'Gentoo', 'Alpine'] },
      { want: 'Para jogos', distros: ['SteamOS', 'Nobara', 'Bazzite', 'ChimeraOS', 'Garuda Linux (Gaming)'] },
      {
        want: 'Com boa comunidade e documentação',
        distros: ['Arch Linux', 'Debian', 'Ubuntu', 'Fedora', 'openSUSE'],
        note: 'Distros baseadas nestas, que herdam a comunidade e a documentação, não foram citadas.',
      },
      { want: 'Para pentest, segurança ou análise forense', distros: ['Kali Linux', 'Parrot OS', 'BlackArch'] },
    ],
  },
  {
    id: 'outros',
    label: 'Outros casos',
    icon: '🧩',
    groups: [
      { want: 'Para máquina fraca ou antiga', distros: ['antiX Linux', 'MX Linux (XFCE ou Fluxbox)', 'Debian (XFCE ou LXQt)', 'Puppy Linux'] },
      {
        want: 'Distros que fazem telemetria',
        distros: ['Ubuntu', 'Zorin OS', 'Fedora', 'Deepin'],
        note: 'Todas podem ser desativadas, e os dados não são vendidos.',
      },
      { want: 'Compatíveis com bancos brasileiros e serviços do governo', distros: ['BigLinux', 'Regata OS'] },
    ],
  },
];

export type Tag = 'iniciante' | 'intermediario' | 'avancado' | 'jogos' | 'fraco';

export const tags: { id: Tag | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'iniciante', label: 'Iniciante' },
  { id: 'intermediario', label: 'Intermediário' },
  { id: 'avancado', label: 'Avançado' },
  { id: 'jogos', label: 'Jogos' },
  { id: 'fraco', label: 'PC fraco' },
];

export interface Distro {
  name: string;
  base: string;
  de: string;
  category: string;
  tag: Tag;
  nvidia: string;
  docs: string;
}

export const distros: Distro[] = [
  { name: 'Zorin OS', base: 'Ubuntu', de: 'GNOME-like (Zorin Desktop)', category: 'Parecida com Windows', tag: 'iniciante', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Linux Mint', base: 'Ubuntu', de: 'Cinnamon', category: 'Parecida com Windows', tag: 'iniciante', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Pop!_OS', base: 'Ubuntu', de: 'COSMIC (base GNOME)', category: 'Parecida com macOS', tag: 'iniciante', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Ubuntu', base: 'Debian', de: 'GNOME', category: 'Generalista', tag: 'iniciante', nvidia: 'Sim', docs: 'Sim' },
  { name: 'elementary OS', base: 'Ubuntu', de: 'Pantheon', category: 'Parecida com macOS', tag: 'iniciante', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Regata OS', base: 'openSUSE', de: 'KDE Plasma', category: 'Voltada para jogos e produtividade', tag: 'iniciante', nvidia: 'Sim', docs: 'Moderada' },
  { name: 'BigLinux', base: 'Manjaro/Arch', de: 'KDE Plasma', category: 'Nacional, focada em facilidade', tag: 'iniciante', nvidia: 'Sim', docs: 'Moderada' },
  { name: 'Fedora', base: 'Independente (Red Hat)', de: 'GNOME (padrão)', category: 'Estável e segura', tag: 'intermediario', nvidia: 'Sim (com RPM Fusion)', docs: 'Sim' },
  { name: 'openSUSE Leap', base: 'openSUSE', de: 'KDE, GNOME, XFCE', category: 'Estável e segura', tag: 'intermediario', nvidia: 'Sim (via repositórios)', docs: 'Sim' },
  { name: 'Debian Stable', base: 'Debian', de: 'XFCE, GNOME, KDE', category: 'Estável e segura', tag: 'intermediario', nvidia: 'Moderado (requer configuração)', docs: 'Sim' },
  { name: 'openSUSE Tumbleweed', base: 'openSUSE', de: 'KDE, GNOME, XFCE', category: 'Rolling estável', tag: 'intermediario', nvidia: 'Sim (via repositórios)', docs: 'Sim' },
  { name: 'Void Linux', base: 'Independente', de: 'XFCE, LXQt, Openbox', category: 'Rolling estável', tag: 'intermediario', nvidia: 'Limitado (exige configuração manual)', docs: 'Sim' },
  { name: 'Gentoo (testing)', base: 'Independente', de: 'Personalizável', category: 'Rolling estável', tag: 'intermediario', nvidia: 'Sim (com suporte manual)', docs: 'Sim' },
  { name: 'Arch Linux', base: 'Independente', de: 'Qualquer', category: 'Aprendizado', tag: 'avancado', nvidia: 'Sim (com configuração manual)', docs: 'Sim' },
  { name: 'Slackware', base: 'Independente', de: 'KDE, XFCE', category: 'Aprendizado', tag: 'avancado', nvidia: 'Limitado (precisa configuração intensa)', docs: 'Sim' },
  { name: 'SteamOS', base: 'Arch (customizado)', de: 'Steam Big Picture', category: 'Aprendizado', tag: 'avancado', nvidia: 'Sim (otimizado para NVIDIA)', docs: 'Sim' },
  { name: 'CachyOS', base: 'Arch', de: 'KDE Plasma', category: 'Otimização e jogos', tag: 'avancado', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Nobara', base: 'Fedora', de: 'GNOME, KDE', category: 'Jogos', tag: 'jogos', nvidia: 'Sim (otimizado)', docs: 'Sim' },
  { name: 'Bazzite', base: 'Fedora Atomic', de: 'GNOME, KDE', category: 'Jogos', tag: 'jogos', nvidia: 'Sim (otimizado)', docs: 'Sim' },
  { name: 'ChimeraOS', base: 'SteamOS/Arch', de: 'Steam Big Picture', category: 'Jogos', tag: 'jogos', nvidia: 'Sim', docs: 'Sim' },
  { name: 'Garuda Linux (Gaming)', base: 'Arch', de: 'KDE Dr460nized', category: 'Jogos', tag: 'jogos', nvidia: 'Sim', docs: 'Sim' },
  { name: 'antiX Linux', base: 'Debian', de: 'IceWM, Fluxbox', category: 'PC fraco/antigo', tag: 'fraco', nvidia: 'Não (foco em máquinas antigas)', docs: 'Sim' },
  { name: 'MX Linux', base: 'Debian', de: 'XFCE, Fluxbox', category: 'PC fraco/antigo', tag: 'fraco', nvidia: 'Moderado', docs: 'Moderada' },
  { name: 'Debian', base: 'Debian', de: 'XFCE, LXQt', category: 'PC fraco/antigo', tag: 'fraco', nvidia: 'Moderado', docs: 'Moderada' },
  { name: 'Puppy Linux', base: 'Varia (Ubuntu, Slackware)', de: 'JWM, Openbox', category: 'PC fraco/antigo', tag: 'fraco', nvidia: 'Não recomendado para NVIDIA moderna', docs: 'Sim' },
];

export interface DesktopEnv {
  name: string;
  difficulty: 1 | 2 | 3; // 1 fácil, 2 intermediária, 3 avançada (teclado/config manual)
  ram: string;
  ramMB: number; // valor aproximado, só para a barra visual
  style: string;
  features: string;
  for: string;
  distros: string;
}

export const desktops: DesktopEnv[] = [
  { name: 'GNOME', difficulty: 1, ram: 'Alta (~800 MB+)', ramMB: 800, style: 'Moderna e minimalista', features: 'Recursos integrados, Flatpak nativo', for: 'Usuários modernos e iniciantes', distros: 'Pop!_OS, Fedora, Ubuntu (padrão)' },
  { name: 'KDE Plasma', difficulty: 2, ram: 'Moderada (~500–700 MB)', ramMB: 600, style: 'Tradicional e altamente customizável', features: 'Recursos avançados, aparência rica', for: 'Quem gosta de personalizar', distros: 'KDE Neon, openSUSE, Kubuntu, Garuda' },
  { name: 'XFCE', difficulty: 2, ram: 'Baixa (~300–500 MB)', ramMB: 400, style: 'Clássica, leve e funcional', features: 'Simples, eficiente, altamente leve', for: 'PCs antigos, quem prioriza leveza', distros: 'MX Linux, Xubuntu, Manjaro XFCE' },
  { name: 'LXQt', difficulty: 2, ram: 'Muito baixa (~200–400 MB)', ramMB: 300, style: 'Muito leve e modular', features: 'Base Qt, minimalista', for: 'Netbooks, PCs muito fracos', distros: 'Debian LXQt, Lubuntu' },
  { name: 'MATE', difficulty: 1, ram: 'Moderada (~400–600 MB)', ramMB: 500, style: 'Clássica (base GNOME 2)', features: 'Equilíbrio entre leveza e funcionalidade', for: 'Migração do GNOME antigo', distros: 'Ubuntu MATE, Linux Mint MATE' },
  { name: 'Cinnamon', difficulty: 1, ram: 'Moderada (~400–600 MB)', ramMB: 500, style: 'Elegante e familiar (estilo Windows)', features: 'Recursos modernos com aparência clássica', for: 'Iniciantes, ex-usuários do Windows', distros: 'Linux Mint Cinnamon, EndeavourOS Cinnamon' },
  { name: 'Budgie', difficulty: 1, ram: 'Moderada (~500–700 MB)', ramMB: 600, style: 'Moderna e limpa', features: 'Base GNOME, visual elegante', for: 'Quem quer algo bonito e simples', distros: 'Solus, Ubuntu Budgie' },
  { name: 'i3wm', difficulty: 3, ram: 'Muito baixa (<200 MB)', ramMB: 150, style: 'Tiling minimalista', features: 'Controle total via teclado', for: 'Usuários avançados e produtividade', distros: 'Arch, Void, Debian netinst + i3' },
  { name: 'Sway', difficulty: 3, ram: 'Muito baixa (<200 MB)', ramMB: 150, style: 'Tiling minimalista (Wayland)', features: 'Compatível com i3, mas 100% Wayland', for: 'Usuários avançados, foco em Wayland leve', distros: 'Arch, Fedora Sway, Alpine' },
  { name: 'Hyprland', difficulty: 3, ram: 'Baixa a moderada (~200–400 MB)', ramMB: 300, style: 'Tiling dinâmica e moderna (Wayland)', features: 'Efeitos gráficos + animações leves', for: 'Avançados que querem estilo e performance', distros: 'Arch, NixOS, Fedora, CachyOS' },
];

export const displayServers: { criterion: string; x11: string; wayland: string }[] = [
  { criterion: 'Idade', x11: 'Antigo (anos 80)', wayland: 'Novo (ativo desde ~2010)' },
  { criterion: 'Desempenho', x11: 'Depende do compositor (geralmente menor)', wayland: 'Melhor uso de GPU e sincronização' },
  { criterion: 'Segurança', x11: 'Compartilha buffer entre apps (inseguro)', wayland: 'Cada app tem isolamento gráfico' },
  { criterion: 'Jogos', x11: 'Compatível com tudo', wayland: 'Compatível com 90% dos jogos (Proton incluído)' },
  { criterion: 'Gravação / tela remota', x11: 'Funciona nativamente com tudo', wayland: 'Depende de PipeWire, suporte ainda variável' },
  { criterion: 'Compatibilidade', x11: 'Funciona com tudo (legado incluso)', wayland: 'Apps antigos rodam via XWayland' },
  { criterion: 'Drivers NVIDIA', x11: 'Funciona bem com qualquer driver', wayland: 'Funciona bem com drivers recentes (525+)' },
  { criterion: 'Multi-monitor', x11: 'Muito compatível', wayland: 'Estável no GNOME/KDE, pode variar em WMs' },
  { criterion: 'Situação atual', x11: 'Sendo substituído', wayland: 'É o padrão em GNOME, KDE, Fedora etc.' },
];
