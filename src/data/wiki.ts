// Base de dados da Wiki: árvore de distros (cada uma aponta para o `parent`).
// Também serve de fonte para o quiz no futuro.
// Escalas de 1 a 5: ease = facilidade de uso (5 = muito fácil),
// config = configuração necessária (5 = muita), terminal = uso de terminal (5 = constante).

export interface WikiNode {
  id: string;
  name: string;
  parent?: string;
  kind?: 'root' | 'group';
  year?: number;
  by?: string;
  desc: string;
  model?: string;
  pkg?: string;
  init?: string;
  des?: string[]; // a primeira é a padrão
  ease?: number;
  config?: number;
  terminal?: number;
  for?: string;
  site?: string;
  download?: string;
}

export const wiki: WikiNode[] = [
  {
    id: 'unix', name: 'UNIX', kind: 'root', year: 1969, by: 'Bell Labs (AT&T)',
    desc: 'O sistema criado em 1969 por Ken Thompson e Dennis Ritchie. O Linux, lançado por Linus Torvalds em 1991, é "Unix-like": segue as mesmas ideias (tudo é arquivo, pequenos programas que fazem uma coisa bem, multiusuário), mas foi escrito do zero. Toda distro abaixo usa o kernel Linux.',
    site: 'https://www.kernel.org',
  },

  // ---------------- Debian ----------------
  {
    id: 'debian', name: 'Debian', parent: 'unix', year: 1993, by: 'Ian Murdock / comunidade',
    desc: 'Uma das distros mais antigas e respeitadas, mantida só por voluntários. Famosa pela estabilidade: a versão Stable muda pouco e quase nunca quebra. É a base de centenas de outras distros, incluindo o Ubuntu.',
    model: 'Fixo (Stable a cada ~2 anos)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'XFCE', 'Cinnamon', 'MATE', 'LXQt', 'LXDE'],
    ease: 3, config: 3, terminal: 3, for: 'Servidores, quem prioriza estabilidade e PCs mais modestos',
    site: 'https://www.debian.org', download: 'https://www.debian.org/distrib/',
  },
  {
    id: 'ubuntu', name: 'Ubuntu', parent: 'debian', year: 2004, by: 'Canonical',
    desc: 'A distro mais popular do mundo. Tem versões LTS a cada 2 anos com 5 anos de suporte, enorme compatibilidade de hardware e uma comunidade gigante. Quase todo tutorial de Linux funciona nele.',
    model: 'Fixo (semestral, LTS a cada 2 anos)', pkg: 'APT (.deb) + Snap', init: 'systemd',
    des: ['GNOME'], ease: 4, config: 2, terminal: 2, for: 'Iniciantes, uso geral, desenvolvimento',
    site: 'https://ubuntu.com', download: 'https://ubuntu.com/download/desktop',
  },
  {
    id: 'devuan', name: 'Devuan', parent: 'debian', year: 2017, by: 'Veteran Unix Admins',
    desc: 'Um fork do Debian criado para oferecer o mesmo sistema sem o systemd, deixando você escolher o init. Compatível com a maior parte dos pacotes do Debian.',
    model: 'Fixo (acompanha o Debian Stable)', pkg: 'APT (.deb)', init: 'sysvinit, OpenRC ou runit',
    des: ['XFCE', 'MATE', 'Cinnamon', 'KDE Plasma', 'LXQt'], ease: 2, config: 4, terminal: 4,
    for: 'Quem não quer systemd', site: 'https://www.devuan.org', download: 'https://www.devuan.org/get-devuan',
  },
  {
    id: 'mx', name: 'MX Linux', parent: 'debian', year: 2014, by: 'Comunidades antiX e MEPIS',
    desc: 'Leve, estável e cheia de ferramentas gráficas próprias (MX Tools) que facilitam tarefas que normalmente exigiriam terminal. Ótima para dar vida nova a computadores mais antigos.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', init: 'sysvinit (systemd opcional)',
    des: ['XFCE', 'KDE Plasma', 'Fluxbox'], ease: 4, config: 2, terminal: 2, for: 'PCs antigos, quem quer leveza sem complicação',
    site: 'https://mxlinux.org', download: 'https://mxlinux.org/download-links/',
  },
  {
    id: 'antix', name: 'antiX', parent: 'debian', year: 2007, by: 'anticapitalista / comunidade',
    desc: 'Extremamente leve e sem systemd. Roda com pouquíssima memória e funciona muito bem como sistema live em pendrive. Visual simples, foco total em desempenho.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', init: 'sysvinit ou runit',
    des: ['IceWM', 'Fluxbox', 'JWM', 'herbstluftwm'], ease: 2, config: 3, terminal: 3, for: 'Máquinas muito antigas',
    site: 'https://antixlinux.com', download: 'https://antixlinux.com/download/',
  },
  {
    id: 'knoppix', name: 'Knoppix', parent: 'debian', year: 2000, by: 'Klaus Knopper',
    desc: 'A pioneira dos sistemas live: roda direto do DVD ou pendrive, sem instalar. Muito usada para recuperar dados e testar hardware.',
    model: 'Live (lançamentos esporádicos)', pkg: 'APT (.deb)', init: 'Próprio (estilo sysvinit)',
    des: ['LXDE'], ease: 4, config: 2, terminal: 2, for: 'Recuperação de sistemas, testes, uso sem instalar',
    site: 'https://www.knopper.net/knoppix/', download: 'https://www.knopper.net/knoppix-mirrors/index-en.html',
  },
  {
    id: 'deepin', name: 'deepin', parent: 'debian', year: 2004, by: 'Deepin Technology (China)',
    desc: 'Conhecida pela interface DDE, uma das mais bonitas do Linux. Nasceu sobre o Debian e hoje usa uma base própria derivada dele. Coleta telemetria (pode ser desativada).',
    model: 'Fixo', pkg: 'APT (.deb)', init: 'systemd',
    des: ['DDE (Deepin Desktop)'], ease: 4, config: 2, terminal: 2, for: 'Quem quer um visual moderno e polido',
    site: 'https://www.deepin.org/en/', download: 'https://www.deepin.org/en/download/',
  },
  {
    id: 'tails', name: 'Tails', parent: 'debian', year: 2009, by: 'Tails Project',
    desc: 'Sistema live "amnésico": roda do pendrive, passa toda a conexão pelo Tor e não deixa rastros no computador ao desligar. Usado por jornalistas e ativistas.',
    model: 'Live (atualizações frequentes)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['GNOME'], ease: 3, config: 1, terminal: 1, for: 'Privacidade e anonimato extremos',
    site: 'https://tails.net', download: 'https://tails.net/install/',
  },
  {
    id: 'kali', name: 'Kali Linux', parent: 'debian', year: 2013, by: 'Offensive Security',
    desc: 'A distro de referência para testes de invasão e segurança, com centenas de ferramentas já instaladas. Não é pensada para uso diário.',
    model: 'Rolling (base Debian Testing)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['XFCE', 'GNOME', 'KDE Plasma'], ease: 2, config: 3, terminal: 5, for: 'Pentest, segurança, CTFs',
    site: 'https://www.kali.org', download: 'https://www.kali.org/get-kali/',
  },
  {
    id: 'parrot', name: 'Parrot OS', parent: 'debian', year: 2013, by: 'Parrot Security',
    desc: 'Alternativa ao Kali, com ferramentas de segurança, forense e privacidade. Tem também uma edição "Home" para uso diário.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['MATE', 'KDE Plasma', 'XFCE'], ease: 3, config: 3, terminal: 4, for: 'Segurança, forense, privacidade',
    site: 'https://parrotsec.org', download: 'https://parrotsec.org/download/',
  },

  // ---------------- Ubuntu e derivadas ----------------
  {
    id: 'mint', name: 'Linux Mint', parent: 'ubuntu', year: 2006, by: 'Clement Lefebvre / comunidade',
    desc: 'Talvez a melhor porta de entrada para quem vem do Windows: menu iniciar, barra de tarefas, tudo onde você espera. Estável, leve e sem Snap por padrão.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', init: 'systemd',
    des: ['Cinnamon', 'MATE', 'XFCE'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes e ex-usuários de Windows',
    site: 'https://linuxmint.com', download: 'https://linuxmint.com/download.php',
  },
  {
    id: 'zorin', name: 'Zorin OS', parent: 'ubuntu', year: 2009, by: 'Zorin Group',
    desc: 'Feita para parecer familiar: o layout pode imitar Windows ou macOS com um clique. Polida e muito amigável. Tem edição Lite para PCs fracos.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak + Snap', init: 'systemd',
    des: ['Zorin Desktop (GNOME)', 'XFCE (Lite)'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes vindos do Windows',
    site: 'https://zorin.com/os/', download: 'https://zorin.com/os/download/',
  },
  {
    id: 'popos', name: 'Pop!_OS', parent: 'ubuntu', year: 2017, by: 'System76',
    desc: 'Da fabricante de PCs System76. Oferece ISO com driver NVIDIA pronto e usa o COSMIC, interface nova escrita em Rust, com tiling opcional.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', init: 'systemd',
    des: ['COSMIC'], ease: 4, config: 2, terminal: 2, for: 'Quem tem NVIDIA, desenvolvedores, gamers casuais',
    site: 'https://system76.com/pop/', download: 'https://system76.com/pop/download/',
  },
  {
    id: 'elementary', name: 'elementary OS', parent: 'ubuntu', year: 2011, by: 'elementary, Inc.',
    desc: 'Inspirada no macOS, com a interface Pantheon, muito consistente e elegante. Tem loja própria no modelo "pague quanto quiser".',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', init: 'systemd',
    des: ['Pantheon'], ease: 5, config: 1, terminal: 1, for: 'Quem gosta do estilo Apple',
    site: 'https://elementary.io', download: 'https://elementary.io',
  },
  {
    id: 'kubuntu', name: 'Kubuntu', parent: 'ubuntu', year: 2005, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com KDE Plasma: altamente personalizável e cheio de recursos.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['KDE Plasma'], ease: 4, config: 2, terminal: 2, for: 'Quem gosta de personalizar',
    site: 'https://kubuntu.org', download: 'https://kubuntu.org/getkubuntu/',
  },
  {
    id: 'xubuntu', name: 'Xubuntu', parent: 'ubuntu', year: 2006, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com XFCE: leve, tradicional e eficiente.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['XFCE'], ease: 4, config: 2, terminal: 2, for: 'PCs modestos',
    site: 'https://xubuntu.org', download: 'https://xubuntu.org/download/',
  },
  {
    id: 'lubuntu', name: 'Lubuntu', parent: 'ubuntu', year: 2011, by: 'Comunidade (sabor oficial)',
    desc: 'O sabor mais leve do Ubuntu, com LXQt. Bom para netbooks e PCs muito fracos.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['LXQt'], ease: 4, config: 2, terminal: 2, for: 'PCs muito fracos',
    site: 'https://lubuntu.me', download: 'https://lubuntu.me/downloads/',
  },
  {
    id: 'ubuntumate', name: 'Ubuntu MATE', parent: 'ubuntu', year: 2014, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com MATE, herdeiro do GNOME 2. Clássico, leve e estável.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', init: 'systemd',
    des: ['MATE'], ease: 4, config: 2, terminal: 2, for: 'Quem gosta do visual clássico',
    site: 'https://ubuntu-mate.org', download: 'https://ubuntu-mate.org/download/',
  },
  {
    id: 'puppy', name: 'Puppy Linux', parent: 'ubuntu', year: 2003, by: 'Barry Kauler / comunidade',
    desc: 'Minúscula e roda inteira na memória RAM, direto do pendrive. É montada a partir de pacotes de outras distros (Ubuntu, Debian ou Slackware, dependendo da edição).',
    model: 'Fixo (várias edições)', pkg: 'PPM (Puppy Package Manager)', init: 'Próprio',
    des: ['JWM', 'Openbox'], ease: 3, config: 3, terminal: 2, for: 'PCs muito antigos, uso portátil',
    site: 'https://puppylinux-woof-ce.github.io', download: 'https://puppylinux-woof-ce.github.io',
  },

  // ---------------- Arch ----------------
  {
    id: 'arch', name: 'Arch Linux', parent: 'unix', year: 2002, by: 'Judd Vinet / comunidade',
    desc: 'Minimalista e sempre atualizada. Você monta o sistema peça por peça e entende tudo que está instalado. Tem a ArchWiki, a melhor documentação do mundo Linux, e o AUR, com praticamente qualquer programa.',
    model: 'Rolling release', pkg: 'pacman + AUR', init: 'systemd',
    des: ['Qualquer uma (você escolhe)'], ease: 1, config: 5, terminal: 5, for: 'Quem quer aprender e ter controle total',
    site: 'https://archlinux.org', download: 'https://archlinux.org/download/',
  },
  {
    id: 'manjaro', name: 'Manjaro', parent: 'arch', year: 2011, by: 'Manjaro GmbH',
    desc: 'O Arch com instalador gráfico e pacotes segurados por algumas semanas para testes. Bom meio-termo entre novidade e estabilidade.',
    model: 'Rolling (com atraso para testes)', pkg: 'pacman + Pamac (+ AUR)', init: 'systemd',
    des: ['KDE Plasma', 'XFCE', 'GNOME'], ease: 4, config: 2, terminal: 2, for: 'Quem quer Arch sem montar do zero',
    site: 'https://manjaro.org', download: 'https://manjaro.org/download/',
  },
  {
    id: 'biglinux', name: 'BigLinux', parent: 'manjaro', by: 'Comunidade brasileira',
    desc: 'Distro brasileira baseada no Manjaro, focada em facilidade e com boa compatibilidade com bancos e serviços do governo.',
    model: 'Rolling', pkg: 'pacman + Pamac', init: 'systemd',
    des: ['KDE Plasma'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes brasileiros',
    site: 'https://www.biglinux.com.br', download: 'https://www.biglinux.com.br',
  },
  {
    id: 'artix', name: 'Artix Linux', parent: 'arch', year: 2017, by: 'Comunidade',
    desc: 'O Arch sem systemd. Você escolhe entre OpenRC, runit, s6 ou dinit.',
    model: 'Rolling release', pkg: 'pacman', init: 'OpenRC, runit, s6 ou dinit',
    des: ['KDE Plasma', 'XFCE', 'LXQt', 'MATE', 'Cinnamon'], ease: 2, config: 4, terminal: 4, for: 'Quem quer Arch sem systemd',
    site: 'https://artixlinux.org', download: 'https://artixlinux.org/download.php',
  },
  {
    id: 'cachyos', name: 'CachyOS', parent: 'arch', year: 2021, by: 'Comunidade',
    desc: 'Arch otimizado para desempenho: kernel com escalonador próprio e pacotes compilados para processadores modernos. Instalador gráfico com várias interfaces. Muito usado para jogos.',
    model: 'Rolling release', pkg: 'pacman + AUR', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE', 'Hyprland', 'i3', 'Sway'], ease: 3, config: 3, terminal: 3, for: 'Desempenho máximo, jogos',
    site: 'https://cachyos.org', download: 'https://cachyos.org/download/',
  },
  {
    id: 'garuda', name: 'Garuda Linux', parent: 'arch', year: 2020, by: 'Comunidade',
    desc: 'Arch com visual chamativo (KDE "Dr460nized"), snapshots automáticos em Btrfs e edição Gaming com tudo pronto para jogar.',
    model: 'Rolling release', pkg: 'pacman + AUR (Chaotic-AUR)', init: 'systemd',
    des: ['KDE Plasma (Dr460nized)', 'GNOME', 'XFCE', 'Hyprland'], ease: 3, config: 2, terminal: 2, for: 'Gamers, quem gosta de visual marcante',
    site: 'https://garudalinux.org', download: 'https://garudalinux.org/editions',
  },
  {
    id: 'steamos', name: 'SteamOS', parent: 'arch', year: 2013, by: 'Valve',
    desc: 'O sistema do Steam Deck. A versão 3 é baseada em Arch e imutável: liga no modo de jogo (Big Picture) e tem um modo desktop com KDE Plasma. Otimizado principalmente para hardware AMD.',
    model: 'Imutável (atualizações da Valve)', pkg: 'Flatpak (sistema somente leitura)', init: 'systemd',
    des: ['Steam Big Picture', 'KDE Plasma (modo desktop)'], ease: 5, config: 1, terminal: 1, for: 'Jogos, portáteis',
    site: 'https://store.steampowered.com/steamos', download: 'https://store.steampowered.com/steamos/download',
  },
  {
    id: 'chimeraos', name: 'ChimeraOS', parent: 'arch', year: 2019, by: 'Comunidade',
    desc: 'Transforma o PC num console: liga direto na interface do Steam, é imutável e se atualiza sozinho.',
    model: 'Imutável', pkg: 'Flatpak (sistema somente leitura)', init: 'systemd',
    des: ['Steam Big Picture (Gamescope)'], ease: 5, config: 1, terminal: 1, for: 'PC na sala, estilo console',
    site: 'https://chimeraos.org', download: 'https://chimeraos.org',
  },
  {
    id: 'blackarch', name: 'BlackArch', parent: 'arch', year: 2013, by: 'Comunidade',
    desc: 'Arch com um repositório de mais de 2.800 ferramentas de segurança. Pode ser instalado do zero ou adicionado a um Arch existente.',
    model: 'Rolling release', pkg: 'pacman', init: 'systemd',
    des: ['Fluxbox', 'Openbox', 'awesome', 'i3'], ease: 1, config: 5, terminal: 5, for: 'Pentesters experientes',
    site: 'https://blackarch.org', download: 'https://blackarch.org/downloads.html',
  },

  // ---------------- Fedora / Red Hat ----------------
  {
    id: 'fedora', name: 'Fedora', parent: 'unix', year: 2003, by: 'Comunidade + Red Hat',
    desc: 'Moderna e segura, sempre perto das novidades sem perder a estabilidade. É onde a Red Hat testa o que vai para o RHEL. Tem edições Atomic (imutáveis), como Silverblue e Kinoite.',
    model: 'Fixo (a cada ~6 meses)', pkg: 'DNF (.rpm) + Flatpak', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'XFCE', 'Cinnamon', 'LXQt', 'MATE', 'Budgie', 'Sway', 'i3'], ease: 3, config: 3, terminal: 3,
    for: 'Desenvolvedores, quem quer software recente e estável',
    site: 'https://fedoraproject.org', download: 'https://fedoraproject.org/workstation/download',
  },
  {
    id: 'rhel', name: 'Red Hat Enterprise Linux', parent: 'fedora', year: 2002, by: 'Red Hat (IBM)',
    desc: 'O Linux corporativo mais usado do mundo, com até 10 anos de suporte por versão. É pago para empresas, mas gratuito para desenvolvedores individuais.',
    model: 'Fixo (ciclo longo, ~10 anos)', pkg: 'DNF (.rpm)', init: 'systemd',
    des: ['GNOME'], ease: 3, config: 4, terminal: 4, for: 'Empresas e servidores',
    site: 'https://www.redhat.com/pt-br/technologies/linux-platforms/enterprise-linux', download: 'https://developers.redhat.com/products/rhel/download',
  },
  {
    id: 'rocky', name: 'Rocky Linux', parent: 'rhel', year: 2021, by: 'Rocky Enterprise Software Foundation',
    desc: 'Gratuito e 100% compatível com o RHEL. Criado por um dos fundadores do CentOS depois que o CentOS tradicional foi descontinuado.',
    model: 'Fixo (acompanha o RHEL)', pkg: 'DNF (.rpm)', init: 'systemd',
    des: ['GNOME'], ease: 2, config: 4, terminal: 4, for: 'Servidores',
    site: 'https://rockylinux.org', download: 'https://rockylinux.org/download',
  },
  {
    id: 'nobara', name: 'Nobara', parent: 'fedora', year: 2022, by: 'GloriousEggroll',
    desc: 'Fedora preparado para jogos e criação de conteúdo: drivers, codecs e ajustes de desempenho já vêm prontos. Do mesmo autor do Proton-GE.',
    model: 'Fixo (acompanha o Fedora)', pkg: 'DNF (.rpm) + Flatpak', init: 'systemd',
    des: ['KDE Plasma', 'GNOME'], ease: 4, config: 2, terminal: 2, for: 'Jogos, streaming',
    site: 'https://nobaraproject.org', download: 'https://nobaraproject.org/download-nobara/',
  },
  {
    id: 'bazzite', name: 'Bazzite', parent: 'fedora', year: 2023, by: 'Universal Blue',
    desc: 'Baseado no Fedora Atomic: o sistema é imutável e difícil de quebrar. Tem edição com modo de jogo igual ao Steam Deck.',
    model: 'Imutável', pkg: 'Flatpak + rpm-ostree + Distrobox', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'Steam Gaming Mode'], ease: 5, config: 1, terminal: 1, for: 'Jogos, portáteis, quem não quer manutenção',
    site: 'https://bazzite.gg', download: 'https://bazzite.gg',
  },
  {
    id: 'qubes', name: 'Qubes OS', parent: 'fedora', year: 2012, by: 'Invisible Things Lab',
    desc: 'Segurança por isolamento: cada atividade roda numa máquina virtual separada (Xen). Se uma for comprometida, as outras continuam seguras. O domínio de controle usa Fedora. Exige bastante hardware.',
    model: 'Fixo', pkg: 'DNF nas VMs (Fedora, Debian, Whonix)', init: 'systemd',
    des: ['XFCE'], ease: 1, config: 4, terminal: 4, for: 'Segurança máxima',
    site: 'https://www.qubes-os.org', download: 'https://www.qubes-os.org/downloads/',
  },

  // ---------------- openSUSE ----------------
  {
    id: 'opensuse', name: 'openSUSE', parent: 'unix', year: 2005, by: 'Comunidade + SUSE',
    desc: 'Projeto alemão com raízes no SUSE Linux (1994). Famoso pelo YaST, um painel que configura o sistema inteiro graficamente, e pelos snapshots automáticos. Tem duas versões principais: Leap e Tumbleweed.',
    pkg: 'zypper (.rpm) + YaST', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], site: 'https://www.opensuse.org', download: 'https://get.opensuse.org',
  },
  {
    id: 'leap', name: 'openSUSE Leap', parent: 'opensuse', year: 2015, by: 'Comunidade + SUSE',
    desc: 'A versão estável, construída sobre a base do SUSE Linux Enterprise. Ideal para quem quer confiabilidade.',
    model: 'Fixo', pkg: 'zypper (.rpm) + YaST', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], ease: 3, config: 3, terminal: 3, for: 'Estabilidade, estações de trabalho',
    site: 'https://get.opensuse.org/leap/', download: 'https://get.opensuse.org/leap/',
  },
  {
    id: 'tumbleweed', name: 'openSUSE Tumbleweed', parent: 'opensuse', year: 2014, by: 'Comunidade + SUSE',
    desc: 'Rolling release testado automaticamente (openQA) antes de chegar até você, com snapshots para voltar atrás se algo der errado.',
    model: 'Rolling release (testado)', pkg: 'zypper (.rpm) + YaST', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], ease: 3, config: 3, terminal: 3, for: 'Quem quer novidades com segurança',
    site: 'https://get.opensuse.org/tumbleweed/', download: 'https://get.opensuse.org/tumbleweed/',
  },
  {
    id: 'regata', name: 'Regata OS', parent: 'opensuse', year: 2018, by: 'Comunidade brasileira',
    desc: 'Distro brasileira baseada no openSUSE, voltada para jogos e produtividade, com loja própria e o Game Access.',
    model: 'Fixo', pkg: 'zypper (.rpm) + loja própria', init: 'systemd',
    des: ['KDE Plasma'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes brasileiros, jogos',
    site: 'https://www.regataos.com.br', download: 'https://www.regataos.com.br',
  },

  // ---------------- Gentoo e Slackware ----------------
  {
    id: 'gentoo', name: 'Gentoo', parent: 'unix', year: 2002, by: 'Daniel Robbins / comunidade',
    desc: 'Você compila praticamente tudo a partir do código-fonte, escolhendo os recursos de cada programa com as "USE flags". Controle total, mas instalar e atualizar leva tempo.',
    model: 'Rolling release (código-fonte)', pkg: 'Portage (emerge)', init: 'OpenRC ou systemd',
    des: ['Qualquer uma (você escolhe)'], ease: 1, config: 5, terminal: 5, for: 'Entusiastas, quem quer otimizar cada detalhe',
    site: 'https://www.gentoo.org', download: 'https://www.gentoo.org/downloads/',
  },
  {
    id: 'slackware', name: 'Slackware', parent: 'unix', year: 1993, by: 'Patrick Volkerding',
    desc: 'A distro mais antiga ainda ativa. Fiel à filosofia Unix: simples e transparente, sem resolver dependências automaticamente.',
    model: 'Fixo (lançamentos raros) + current', pkg: 'pkgtool / slackpkg', init: 'Estilo BSD (sysvinit)',
    des: ['KDE Plasma', 'XFCE'], ease: 1, config: 5, terminal: 5, for: 'Quem quer aprender Unix de verdade',
    site: 'http://www.slackware.com', download: 'http://www.slackware.com/getslack/',
  },

  // ---------------- Independentes ----------------
  {
    id: 'indep', name: 'Independentes', parent: 'unix', kind: 'group',
    desc: 'Distros que não derivam de nenhuma outra: têm gerenciador de pacotes, repositórios e decisões próprias.',
  },
  {
    id: 'void', name: 'Void Linux', parent: 'indep', year: 2008, by: 'Juan Romero Pardines / comunidade',
    desc: 'Rápida, minimalista e independente. Usa o runit (inicia muito rápido) e oferece versões com glibc ou musl.',
    model: 'Rolling release', pkg: 'XBPS', init: 'runit',
    des: ['XFCE', 'Qualquer outra via repositório'], ease: 2, config: 4, terminal: 4, for: 'Quem gosta de sistema enxuto',
    site: 'https://voidlinux.org', download: 'https://voidlinux.org/download/',
  },
  {
    id: 'solus', name: 'Solus', parent: 'indep', year: 2015, by: 'Comunidade',
    desc: 'Pensada para desktop, com atualizações semanais selecionadas. Berço da interface Budgie.',
    model: 'Rolling (curado, semanal)', pkg: 'eopkg', init: 'systemd',
    des: ['Budgie', 'KDE Plasma', 'GNOME', 'XFCE'], ease: 4, config: 2, terminal: 2, for: 'Uso doméstico',
    site: 'https://getsol.us', download: 'https://getsol.us/download/',
  },
  {
    id: 'nixos', name: 'NixOS', parent: 'indep', year: 2003, by: 'Eelco Dolstra / comunidade',
    desc: 'O sistema inteiro é descrito num arquivo de configuração. Você pode reproduzir a mesma máquina em qualquer lugar e voltar a qualquer versão anterior. Tem um dos maiores repositórios de pacotes que existem.',
    model: 'Fixo (semestral) ou unstable', pkg: 'Nix', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'Qualquer outra'], ease: 1, config: 5, terminal: 5, for: 'Desenvolvedores, quem quer reprodutibilidade',
    site: 'https://nixos.org', download: 'https://nixos.org/download/',
  },
  {
    id: 'alpine', name: 'Alpine Linux', parent: 'indep', year: 2005, by: 'Comunidade',
    desc: 'Minúscula e segura, usa musl e BusyBox. É a base mais popular para containers Docker.',
    model: 'Fixo (semestral) + edge', pkg: 'apk', init: 'OpenRC',
    des: ['Qualquer uma (manual)'], ease: 1, config: 5, terminal: 5, for: 'Containers, servidores, roteadores',
    site: 'https://alpinelinux.org', download: 'https://alpinelinux.org/downloads/',
  },
  {
    id: 'crux', name: 'CRUX', parent: 'indep', year: 2002, by: 'Per Lidén / comunidade',
    desc: 'Minimalista e baseada em código-fonte, com sistema de "ports" inspirado no BSD. Foi uma das inspirações do Arch.',
    model: 'Fixo', pkg: 'ports (prt-get)', init: 'Estilo BSD',
    des: ['Qualquer uma (manual)'], ease: 1, config: 5, terminal: 5, for: 'Usuários experientes',
    site: 'https://crux.nu', download: 'https://crux.nu/Main/Download',
  },
  {
    id: 'pclinuxos', name: 'PCLinuxOS', parent: 'indep', year: 2003, by: 'Bill Reynolds (Texstar)',
    desc: 'Nasceu do Mandrake e hoje é independente. Rolling release amigável, sem systemd, com o gerenciador gráfico Synaptic.',
    model: 'Rolling release', pkg: 'APT-RPM + Synaptic', init: 'sysvinit',
    des: ['KDE Plasma', 'MATE', 'XFCE'], ease: 4, config: 2, terminal: 2, for: 'Uso doméstico',
    site: 'https://www.pclinuxos.com', download: 'https://www.pclinuxos.com/get-pclinuxos/',
  },
  {
    id: 'lfs', name: 'Linux From Scratch', parent: 'indep', year: 1999, by: 'Gerard Beekmans',
    desc: 'Não é bem uma distro, é um livro: ensina a construir seu próprio Linux do zero, compilando cada componente. A melhor aula sobre como um sistema funciona por dentro.',
    model: 'Livro (versões periódicas)', pkg: 'Nenhum (você compila)', init: 'sysvinit ou systemd',
    des: ['Você decide'], ease: 1, config: 5, terminal: 5, for: 'Aprendizado profundo',
    site: 'https://www.linuxfromscratch.org', download: 'https://www.linuxfromscratch.org/lfs/',
  },
];

// Converte um nome como aparece no site ("Linux Mint (Cinnamon)", "Fedora Sway", "Gentoo Testing") no id da Wiki.
const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9!_ ]/g, ' ').replace(/\s+/g, ' ').trim();
const ALIASES: Record<string, string> = {
  void: 'void', lfs: 'lfs', arch: 'arch', kali: 'kali', 'debian stable': 'debian', 'debian netinst': 'debian',
  'gentoo testing': 'gentoo', 'garuda linux': 'garuda', garuda: 'garuda', 'antix linux': 'antix', alpine: 'alpine', 'red hat': 'rhel',
};
const byName = new Map(wiki.filter((n) => n.kind !== 'group').map((n) => [norm(n.name), n.id]));
const prefixes = [...byName.keys()].sort((a, b) => b.length - a.length);

export function wikiIdFor(name: string): string | undefined {
  const n = norm(name);
  if (!n) return;
  if (byName.has(n)) return byName.get(n);
  if (ALIASES[n]) return ALIASES[n];
  // "linux mint cinnamon" -> "linux mint", "fedora sway" -> "fedora"
  const p = prefixes.find((k) => n.startsWith(k + ' '));
  return p ? byName.get(p) : Object.entries(ALIASES).find(([k]) => n.startsWith(k + ' '))?.[1];
}
