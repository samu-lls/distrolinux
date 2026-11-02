// Base de dados da Wiki: árvore de distros (cada uma aponta para o `parent`).
// É a fonte única da Wiki, do Teste de Afinidade (distros de PC para o dia a dia, com `profile`) e do Comparador
// (todas as distros). Árvore: SISTEMA → Linux → GNU → famílias; direto do Linux, os sistemas sem GNU (Android,
// Alpine, OpenWrt…); e, ao lado do Linux, Desktop Environments e Protocolos gráficos.
// Escalas de 1 a 5: ease = facilidade de uso (5 = muito fácil),
// config = configuração necessária (5 = muita), terminal = uso de terminal (5 = constante).

type Use = 'desktop' | 'dev' | 'server' | 'security' | 'creative' | 'gaming' | 'learn' | 'privacy' | 'portable';
type Level = 0 | 1 | 2;

export interface Profile {
  gaming: Level;      // 2 = feita para jogos
  old: Level;         // 2 = ótima em PC fraco/antigo
  nvidia: Level;      // 2 = driver NVIDIA pronto
  look: 'windows' | 'mac' | 'own' | 'custom' | 'any'; // visual padrão (custom = você monta)
  release: 'fixed' | 'rolling' | 'immutable' | 'source' | 'live';
  systemd: boolean | 'both';
  nonfree: Level;     // 2 = drivers/codecs fechados já vêm prontos; 0 = só software livre por padrão
  privacy: Level;     // 2 = foco em privacidade/anonimato
  telemetry?: boolean;
  br?: boolean;       // boa compatibilidade com bancos brasileiros e gov.br
  uses: Use[];
  custom: Level;      // quanto dá para personalizar
  docs: Level;        // tamanho da comunidade e da documentação
}

// categorias de uso (etiqueta na ficha, filtro da Wiki e tipo do Comparador)
export type Cat = 'desktop' | 'server' | 'mobile' | 'embedded' | 'security' | 'gaming' | 'chromebook';
export const CATS: Cat[] = ['desktop', 'server', 'mobile', 'embedded', 'security', 'gaming', 'chromebook'];

// dados extras usados pelo Comparador nos tipos Servidor, Celular e Embarcados
export interface Specs {
  support?: string;  // tempo de suporte de cada versão
  paid?: string;     // suporte pago / empresa
  compat?: string;   // compatível com
  cloud?: string;    // disponível nas nuvens
  devices?: string;  // aparelhos (celular)
  apps?: string;     // de onde vêm os apps (celular)
  google?: string;   // serviços do Google (celular)
  hardware?: string; // hardware alvo (embarcados)
  footprint?: string; // tamanho / requisitos mínimos
}

export interface WikiNode {
  id: string;
  name: string;
  parent?: string;
  // root = SISTEMA; hub = conceito que agrupa (Linux, GNU, interfaces, protocolos); group = só agrupa (Independentes)
  kind?: 'root' | 'hub' | 'group';
  year?: number;
  by?: string;
  desc: string;
  model?: string;
  pkg?: string;
  store?: string; // loja de apps / gerenciador de pacotes gráfico que vem por padrão
  init?: string;
  des?: string[]; // a primeira é a padrão
  ease?: number;
  config?: number;
  terminal?: number;
  for?: string;
  site?: string;
  download?: string;
  facts?: [string, string][]; // ficha própria (interfaces e protocolos), no lugar de lançamento/pacotes/init
  seenIn?: string[];          // ids das distros que usam isto por padrão
  childrenLabel?: string;     // título da lista de filhos no painel (padrão: "Derivadas")
  profile?: Profile;          // perfil usado pelo Teste de Afinidade e pelo Comparador (só distros)
  logo?: string;              // 'si:<slug do simple-icons>', 'file:<arquivo em public/logos>' ou 'vec:<ícone de logos.ts>'
  cats?: Cat[];               // categorias de uso (ver CATS); distros com perfil são 'desktop' por padrão
  discontinued?: number;      // ano em que foi descontinuada (gota apagada, fora do Teste e do Comparador)
  quiz?: false;               // distro de desktop que não entra no Teste de Afinidade (alfa, paga, recurso do Windows…)
  also?: [string, string][];  // ligações secundárias (linha tracejada): [id, motivo]
  specs?: Specs;
}

export const wiki: WikiNode[] = [
  {
    id: 'sistema', name: 'SISTEMA', kind: 'root', logo: 'vec:chip', childrenLabel: 'Partes',
    desc: 'Tudo o que faz um computador funcionar além das peças. Aqui ele aparece em três partes: o Linux (o núcleo e as distros feitas com ele), as interfaces gráficas (o que você vê na tela) e os protocolos gráficos (como as janelas chegam até a tela).',
  },
  {
    id: 'linux', name: 'Linux', parent: 'sistema', kind: 'hub', year: 1991, by: 'Linus Torvalds', logo: 'si:linux',
    desc: 'O kernel, o núcleo do sistema: conversa com as peças do computador e divide o trabalho entre os programas. Foi lançado em 1991 por Linus Torvalds e segue as ideias do UNIX, de 1969. Sozinho não é um sistema completo: cada distro junta o kernel com programas para virar um.',
    site: 'https://www.kernel.org',
  },
  {
    id: 'gnu', name: 'GNU', parent: 'linux', kind: 'hub', year: 1983, by: 'Richard Stallman / Free Software Foundation', logo: 'si:gnu',
    desc: 'O projeto de software livre que criou boa parte das ferramentas básicas (terminal, compiladores, bibliotecas) usadas junto com o kernel Linux. Por isso muita gente diz "GNU/Linux". Quase todas as distros de computador vêm daqui.',
    site: 'https://www.gnu.org',
  },


  // ---------------- Debian ----------------
  {
    id: 'debian', name: 'Debian', parent: 'gnu', year: 1993, by: 'Ian Murdock / comunidade',
    desc: 'Uma das distros mais antigas e respeitadas, mantida só por voluntários. Famosa pela estabilidade: a versão Stable muda pouco e quase nunca quebra. É a base de centenas de outras distros, incluindo o Ubuntu.',
    model: 'Fixo (Stable a cada ~2 anos)', pkg: 'APT (.deb)', store: 'GNOME Software ou Discover (conforme a interface) + Synaptic', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'XFCE', 'Cinnamon', 'MATE', 'LXQt', 'LXDE'],
    ease: 3, config: 3, terminal: 3, for: 'Servidores, quem prioriza estabilidade e PCs mais modestos',
    site: 'https://www.debian.org', download: 'https://www.debian.org/distrib/',
    profile: { gaming: 1, old: 1, nvidia: 1, look: 'any', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'server', 'dev'], custom: 1, docs: 2 },

    specs: { support: '5 anos por versão (3 + 2 de LTS)', paid: 'Empresas parceiras', cloud: 'AWS, Azure, Google Cloud' },
  },
  {
    id: 'ubuntu', name: 'Ubuntu', parent: 'debian', year: 2004, by: 'Canonical',
    desc: 'A distro mais popular do mundo. Tem versões LTS a cada 2 anos com 5 anos de suporte, enorme compatibilidade de hardware e uma comunidade gigante. Quase todo tutorial de Linux funciona nele.',
    model: 'Fixo (semestral, LTS a cada 2 anos)', pkg: 'APT (.deb) + Snap', store: 'App Center', init: 'systemd',
    des: ['GNOME'], ease: 4, config: 2, terminal: 2, for: 'Iniciantes, uso geral, desenvolvimento',
    site: 'https://ubuntu.com', download: 'https://ubuntu.com/download/desktop',
    profile: { gaming: 1, old: 0, nvidia: 2, look: 'own', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop', 'dev', 'server'], custom: 1, docs: 2 },

    specs: { support: '5 anos por LTS (até 12 com o Ubuntu Pro)', paid: 'Canonical (Ubuntu Pro)', cloud: 'AWS, Azure, Google Cloud, Oracle' },
  },
  {
    id: 'devuan', name: 'Devuan', parent: 'debian', year: 2017, by: 'Veteran Unix Admins',
    desc: 'Um fork do Debian criado para oferecer o mesmo sistema sem o systemd, deixando você escolher o init. Compatível com a maior parte dos pacotes do Debian.',
    model: 'Fixo (acompanha o Debian Stable)', pkg: 'APT (.deb)', store: 'Synaptic', init: 'sysvinit, OpenRC ou runit',
    des: ['XFCE', 'MATE', 'Cinnamon', 'KDE Plasma', 'LXQt'], ease: 2, config: 4, terminal: 4,
    for: 'Quem não quer systemd', site: 'https://www.devuan.org', download: 'https://www.devuan.org/get-devuan',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'any', release: 'fixed', systemd: false, nonfree: 1, privacy: 1, uses: ['desktop', 'server'], custom: 1, docs: 1 },
  },
  {
    id: 'mx', name: 'MX Linux', parent: 'debian', year: 2014, by: 'Comunidades antiX e MEPIS',
    desc: 'Leve, estável e cheia de ferramentas gráficas próprias (MX Tools) que facilitam tarefas que normalmente exigiriam terminal. Ótima para dar vida nova a computadores mais antigos.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', store: 'MX Package Installer', init: 'sysvinit (systemd opcional)',
    des: ['XFCE', 'KDE Plasma', 'Fluxbox'], ease: 4, config: 2, terminal: 2, for: 'PCs antigos, quem quer leveza sem complicação',
    site: 'https://mxlinux.org', download: 'https://mxlinux.org/download-links/',
    profile: { gaming: 1, old: 2, nvidia: 1, look: 'windows', release: 'fixed', systemd: false, nonfree: 2, privacy: 1, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'antix', name: 'antiX', parent: 'debian', year: 2007, by: 'anticapitalista / comunidade',
    desc: 'Extremamente leve e sem systemd. Roda com pouquíssima memória e funciona muito bem como sistema live em pendrive. Visual simples, foco total em desempenho.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', store: 'antiX Package Installer + Synaptic', init: 'sysvinit ou runit',
    des: ['IceWM', 'Fluxbox', 'JWM', 'herbstluftwm'], ease: 2, config: 3, terminal: 3, for: 'Máquinas muito antigas',
    site: 'https://antixlinux.com', download: 'https://antixlinux.com/download/',
    profile: { gaming: 0, old: 2, nvidia: 0, look: 'own', release: 'fixed', systemd: false, nonfree: 1, privacy: 1, uses: ['desktop', 'portable'], custom: 1, docs: 1 },
  },
  {
    id: 'knoppix', name: 'Knoppix', parent: 'debian', year: 2000, by: 'Klaus Knopper',
    desc: 'A pioneira dos sistemas live: roda direto do DVD ou pendrive, sem instalar. Muito usada para recuperar dados e testar hardware.',
    model: 'Live (lançamentos esporádicos)', pkg: 'APT (.deb)', store: 'Synaptic', init: 'Próprio (estilo sysvinit)',
    des: ['LXDE'], ease: 4, config: 2, terminal: 2, for: 'Recuperação de sistemas, testes, uso sem instalar',
    site: 'https://www.knopper.net/knoppix/', download: 'https://www.knopper.net/knoppix-mirrors/index-en.html',
    profile: { gaming: 0, old: 1, nvidia: 0, look: 'own', release: 'live', systemd: false, nonfree: 1, privacy: 1, uses: ['portable'], custom: 0, docs: 1 },

    also: [['dsl', 'Base do Damn Small Linux original']],
  },
  {
    id: 'deepin', name: 'deepin', parent: 'debian', year: 2004, by: 'Deepin Technology (China)',
    desc: 'Conhecida pela interface DDE, uma das mais bonitas do Linux. Nasceu sobre o Debian e hoje usa uma base própria derivada dele. Coleta telemetria (pode ser desativada).',
    model: 'Fixo', pkg: 'APT (.deb)', store: 'deepin App Store', init: 'systemd',
    des: ['DDE (Deepin Desktop)'], ease: 4, config: 2, terminal: 2, for: 'Quem quer um visual moderno e polido',
    site: 'https://www.deepin.org/en/', download: 'https://www.deepin.org/en/download/',
    profile: { gaming: 1, old: 0, nvidia: 1, look: 'mac', release: 'fixed', systemd: true, nonfree: 1, privacy: 0, telemetry: true, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'tails', name: 'Tails', parent: 'debian', year: 2009, by: 'Tails Project',
    desc: 'Sistema live "amnésico": roda do pendrive, passa toda a conexão pelo Tor e não deixa rastros no computador ao desligar. Usado por jornalistas e ativistas.',
    model: 'Live (atualizações frequentes)', pkg: 'APT (.deb)', store: 'Additional Software', init: 'systemd',
    des: ['GNOME'], ease: 3, config: 1, terminal: 1, for: 'Privacidade e anonimato extremos',
    site: 'https://tails.net', download: 'https://tails.net/install/',
    profile: { gaming: 0, old: 1, nvidia: 0, look: 'own', release: 'live', systemd: true, nonfree: 0, privacy: 2, uses: ['privacy', 'portable'], custom: 0, docs: 1 },
  },
  {
    id: 'kali', name: 'Kali Linux', parent: 'debian', year: 2013, by: 'Offensive Security',
    desc: 'A distro de referência para testes de invasão e segurança, com centenas de ferramentas já instaladas. Não é pensada para uso diário.',
    model: 'Rolling (base Debian Testing)', pkg: 'APT (.deb)', store: 'Nenhuma por padrão (só terminal)', init: 'systemd',
    des: ['XFCE', 'GNOME', 'KDE Plasma'], ease: 2, config: 3, terminal: 5, for: 'Pentest, segurança, CTFs',
    site: 'https://www.kali.org', download: 'https://www.kali.org/get-kali/',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'own', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['security'], custom: 1, docs: 2 },
  },
  {
    id: 'parrot', name: 'Parrot OS', parent: 'debian', year: 2013, by: 'Parrot Security',
    desc: 'Alternativa ao Kali, com ferramentas de segurança, forense e privacidade. Tem também uma edição "Home" para uso diário.',
    model: 'Fixo (base Debian Stable)', pkg: 'APT (.deb)', store: 'Synaptic', init: 'systemd',
    des: ['MATE', 'KDE Plasma', 'XFCE'], ease: 3, config: 3, terminal: 4, for: 'Segurança, forense, privacidade',
    site: 'https://parrotsec.org', download: 'https://parrotsec.org/download/',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'own', release: 'fixed', systemd: true, nonfree: 1, privacy: 2, uses: ['security', 'privacy', 'desktop'], custom: 1, docs: 1 },
  },

  // ---------------- Ubuntu e derivadas ----------------
  {
    id: 'mint', name: 'Linux Mint', parent: 'ubuntu', year: 2006, by: 'Clement Lefebvre / comunidade',
    desc: 'Talvez a melhor porta de entrada para quem vem do Windows: menu iniciar, barra de tarefas, tudo onde você espera. Estável, leve e sem Snap por padrão.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', store: 'Gerenciador de Programas', init: 'systemd',
    des: ['Cinnamon', 'MATE', 'XFCE'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes e ex-usuários de Windows',
    site: 'https://linuxmint.com', download: 'https://linuxmint.com/download.php',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 1, uses: ['desktop'], custom: 1, docs: 2 },
  },
  {
    id: 'zorin', name: 'Zorin OS', parent: 'ubuntu', year: 2009, by: 'Zorin Group',
    desc: 'Feita para parecer familiar: o layout pode imitar Windows ou macOS com um clique. Polida e muito amigável. Tem edição Lite para PCs fracos.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak + Snap', store: 'Zorin Software', init: 'systemd',
    des: ['Zorin Desktop (GNOME)', 'XFCE (Lite)'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes vindos do Windows',
    site: 'https://zorin.com/os/', download: 'https://zorin.com/os/download/',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'popos', name: 'Pop!_OS', parent: 'ubuntu', year: 2017, by: 'System76',
    desc: 'Da fabricante de PCs System76. Oferece ISO com driver NVIDIA pronto e usa o COSMIC, interface nova escrita em Rust, com tiling opcional.',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', store: 'COSMIC Store', init: 'systemd',
    des: ['COSMIC'], ease: 4, config: 2, terminal: 2, for: 'Quem tem NVIDIA, desenvolvedores, gamers casuais',
    site: 'https://system76.com/pop/', download: 'https://system76.com/pop/download/',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'mac', release: 'fixed', systemd: true, nonfree: 2, privacy: 1, uses: ['desktop', 'dev', 'gaming'], custom: 1, docs: 1 },
  },
  {
    id: 'elementary', name: 'elementary OS', parent: 'ubuntu', year: 2011, by: 'elementary, Inc.',
    desc: 'Inspirada no macOS, com a interface Pantheon, muito consistente e elegante. Tem loja própria no modelo "pague quanto quiser".',
    model: 'Fixo (base Ubuntu LTS)', pkg: 'APT (.deb) + Flatpak', store: 'AppCenter', init: 'systemd',
    des: ['Pantheon'], ease: 5, config: 1, terminal: 1, for: 'Quem gosta do estilo Apple',
    site: 'https://elementary.io', download: 'https://elementary.io',
    profile: { gaming: 0, old: 0, nvidia: 1, look: 'mac', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'creative'], custom: 0, docs: 1 },
  },
  {
    id: 'kubuntu', name: 'Kubuntu', parent: 'ubuntu', year: 2005, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com KDE Plasma: altamente personalizável e cheio de recursos.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', store: 'Discover', init: 'systemd',
    des: ['KDE Plasma'], ease: 4, config: 2, terminal: 2, for: 'Quem gosta de personalizar',
    site: 'https://kubuntu.org', download: 'https://kubuntu.org/getkubuntu/',
    profile: { gaming: 1, old: 0, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop', 'creative'], custom: 2, docs: 2 },
  },
  {
    id: 'xubuntu', name: 'Xubuntu', parent: 'ubuntu', year: 2006, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com XFCE: leve, tradicional e eficiente.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', store: 'GNOME Software', init: 'systemd',
    des: ['XFCE'], ease: 4, config: 2, terminal: 2, for: 'PCs modestos',
    site: 'https://xubuntu.org', download: 'https://xubuntu.org/download/',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop'], custom: 1, docs: 2 },
  },
  {
    id: 'lubuntu', name: 'Lubuntu', parent: 'ubuntu', year: 2011, by: 'Comunidade (sabor oficial)',
    desc: 'O sabor mais leve do Ubuntu, com LXQt. Bom para netbooks e PCs muito fracos.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', store: 'Discover', init: 'systemd',
    des: ['LXQt'], ease: 4, config: 2, terminal: 2, for: 'PCs muito fracos',
    site: 'https://lubuntu.me', download: 'https://lubuntu.me/downloads/',
    profile: { gaming: 0, old: 2, nvidia: 1, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'ubuntumate', name: 'Ubuntu MATE', parent: 'ubuntu', year: 2014, by: 'Comunidade (sabor oficial)',
    desc: 'O Ubuntu com MATE, herdeiro do GNOME 2. Clássico, leve e estável.',
    model: 'Fixo (acompanha o Ubuntu)', pkg: 'APT (.deb)', store: 'Software Boutique + GNOME Software', init: 'systemd',
    des: ['MATE'], ease: 4, config: 2, terminal: 2, for: 'Quem gosta do visual clássico',
    site: 'https://ubuntu-mate.org', download: 'https://ubuntu-mate.org/download/',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 0, telemetry: true, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'puppy', name: 'Puppy Linux', parent: 'ubuntu', year: 2003, by: 'Barry Kauler / comunidade',
    desc: 'Minúscula e roda inteira na memória RAM, direto do pendrive. É montada a partir de pacotes de outras distros (Ubuntu, Debian ou Slackware, dependendo da edição).',
    model: 'Fixo (várias edições)', pkg: 'PPM (Puppy Package Manager)', store: 'PPM (Puppy Package Manager)', init: 'Próprio',
    des: ['JWM', 'Openbox'], ease: 3, config: 3, terminal: 2, for: 'PCs muito antigos, uso portátil',
    site: 'https://puppylinux-woof-ce.github.io', download: 'https://puppylinux-woof-ce.github.io',
    profile: { gaming: 0, old: 2, nvidia: 0, look: 'own', release: 'live', systemd: false, nonfree: 1, privacy: 1, uses: ['portable', 'desktop'], custom: 1, docs: 1 },
  },

  // ---------------- Arch ----------------
  {
    id: 'arch', name: 'Arch Linux', parent: 'gnu', year: 2002, by: 'Judd Vinet / comunidade',
    desc: 'Minimalista e sempre atualizada. Você monta o sistema peça por peça e entende tudo que está instalado. Tem a ArchWiki, a melhor documentação do mundo Linux, e o AUR, com praticamente qualquer programa.',
    model: 'Rolling release', pkg: 'pacman + AUR', store: 'Nenhuma por padrão (Pamac, Discover ou Octopi opcionais)', init: 'systemd',
    des: ['Qualquer uma (você escolhe)'], ease: 1, config: 5, terminal: 5, for: 'Quem quer aprender e ter controle total',
    site: 'https://archlinux.org', download: 'https://archlinux.org/download/',
    profile: { gaming: 1, old: 1, nvidia: 1, look: 'custom', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['learn', 'dev'], custom: 2, docs: 2 },
  },
  {
    id: 'manjaro', name: 'Manjaro', parent: 'arch', year: 2011, by: 'Manjaro GmbH',
    desc: 'O Arch com instalador gráfico e pacotes segurados por algumas semanas para testes. Bom meio-termo entre novidade e estabilidade.',
    model: 'Rolling (com atraso para testes)', pkg: 'pacman + Pamac (+ AUR)', store: 'Pamac (Adicionar/Remover Programas)', init: 'systemd',
    des: ['KDE Plasma', 'XFCE', 'GNOME'], ease: 4, config: 2, terminal: 2, for: 'Quem quer Arch sem montar do zero',
    site: 'https://manjaro.org', download: 'https://manjaro.org/download/',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'any', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, uses: ['desktop', 'gaming'], custom: 2, docs: 1 },
  },
  {
    id: 'biglinux', name: 'BigLinux', parent: 'manjaro', by: 'Comunidade brasileira',
    desc: 'Distro brasileira baseada no Manjaro, focada em facilidade e com boa compatibilidade com bancos e serviços do governo.',
    model: 'Rolling', pkg: 'pacman + Pamac', store: 'Big Store', init: 'systemd',
    des: ['KDE Plasma'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes brasileiros',
    site: 'https://www.biglinux.com.br', download: 'https://www.biglinux.com.br',
    profile: { gaming: 1, old: 0, nvidia: 2, look: 'windows', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, br: true, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'artix', name: 'Artix Linux', parent: 'arch', year: 2017, by: 'Comunidade',
    desc: 'O Arch sem systemd. Você escolhe entre OpenRC, runit, s6 ou dinit.',
    model: 'Rolling release', pkg: 'pacman', store: 'Nenhuma por padrão (Octopi opcional)', init: 'OpenRC, runit, s6 ou dinit',
    des: ['KDE Plasma', 'XFCE', 'LXQt', 'MATE', 'Cinnamon'], ease: 2, config: 4, terminal: 4, for: 'Quem quer Arch sem systemd',
    site: 'https://artixlinux.org', download: 'https://artixlinux.org/download.php',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'custom', release: 'rolling', systemd: false, nonfree: 1, privacy: 1, uses: ['learn'], custom: 2, docs: 1 },
  },
  {
    id: 'cachyos', name: 'CachyOS', parent: 'arch', year: 2021, by: 'Comunidade',
    desc: 'Arch otimizado para desempenho: kernel com escalonador próprio e pacotes compilados para processadores modernos. Instalador gráfico com várias interfaces. Muito usado para jogos.',
    model: 'Rolling release', pkg: 'pacman + AUR', store: 'Octopi + CachyOS Package Installer', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE', 'Hyprland', 'i3', 'Sway'], ease: 3, config: 3, terminal: 3, for: 'Desempenho máximo, jogos',
    site: 'https://cachyos.org', download: 'https://cachyos.org/download/',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'any', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming', 'dev'], custom: 2, docs: 1 },
  },
  {
    id: 'garuda', name: 'Garuda Linux', parent: 'arch', year: 2020, by: 'Comunidade',
    desc: 'Arch com visual chamativo (KDE "Dr460nized"), snapshots automáticos em Btrfs e edição Gaming com tudo pronto para jogar.',
    model: 'Rolling release', pkg: 'pacman + AUR (Chaotic-AUR)', store: 'Octopi', init: 'systemd',
    des: ['KDE Plasma (Dr460nized)', 'GNOME', 'XFCE', 'Hyprland'], ease: 3, config: 2, terminal: 2, for: 'Gamers, quem gosta de visual marcante',
    site: 'https://garudalinux.org', download: 'https://garudalinux.org/editions',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'own', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming'], custom: 2, docs: 1 },
  },
  {
    id: 'steamos', name: 'SteamOS', parent: 'arch', year: 2013, by: 'Valve',
    desc: 'O sistema do Steam Deck. A versão 3 é baseada em Arch e imutável: liga no modo de jogo (Big Picture) e tem um modo desktop com KDE Plasma. Otimizado principalmente para hardware AMD.',
    model: 'Imutável (atualizações da Valve)', pkg: 'Flatpak (sistema somente leitura)', store: 'Discover (modo desktop, Flatpak)', init: 'systemd',
    des: ['Steam Big Picture', 'KDE Plasma (modo desktop)'], ease: 5, config: 1, terminal: 1, for: 'Jogos, portáteis',
    site: 'https://store.steampowered.com/steamos', download: 'https://store.steampowered.com/steamos/download',
    profile: { gaming: 2, old: 0, nvidia: 0, look: 'own', release: 'immutable', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming'], custom: 0, docs: 1 },
  },
  {
    id: 'chimeraos', name: 'ChimeraOS', parent: 'arch', year: 2019, by: 'Comunidade',
    desc: 'Transforma o PC num console: liga direto na interface do Steam, é imutável e se atualiza sozinho.',
    model: 'Imutável', pkg: 'Flatpak (sistema somente leitura)', store: 'Steam (jogos) + Flathub', init: 'systemd',
    des: ['Steam Big Picture (Gamescope)'], ease: 5, config: 1, terminal: 1, for: 'PC na sala, estilo console',
    site: 'https://chimeraos.org', download: 'https://chimeraos.org',
    profile: { gaming: 2, old: 0, nvidia: 1, look: 'own', release: 'immutable', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming'], custom: 0, docs: 0 },
  },
  {
    id: 'blackarch', name: 'BlackArch', parent: 'arch', year: 2013, by: 'Comunidade',
    desc: 'Arch com um repositório de mais de 2.800 ferramentas de segurança. Pode ser instalado do zero ou adicionado a um Arch existente.',
    model: 'Rolling release', pkg: 'pacman', store: 'Nenhuma por padrão', init: 'systemd',
    des: ['Fluxbox', 'Openbox', 'awesome', 'i3'], ease: 1, config: 5, terminal: 5, for: 'Pentesters experientes',
    site: 'https://blackarch.org', download: 'https://blackarch.org/downloads.html',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'custom', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['security', 'learn'], custom: 2, docs: 1 },
  },

  // ---------------- Fedora / Red Hat ----------------
  {
    id: 'fedora', name: 'Fedora', parent: 'redhat', year: 2003, by: 'Comunidade + Red Hat',
    desc: 'Moderna e segura, sempre perto das novidades sem perder a estabilidade. É onde a Red Hat testa o que vai para o RHEL. Tem edições Atomic (imutáveis), como Silverblue e Kinoite.',
    model: 'Fixo (a cada ~6 meses)', pkg: 'DNF (.rpm) + Flatpak', store: 'GNOME Software ou Discover (conforme a edição)', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'XFCE', 'Cinnamon', 'LXQt', 'MATE', 'Budgie', 'Sway', 'i3'], ease: 3, config: 3, terminal: 3,
    for: 'Desenvolvedores, quem quer software recente e estável',
    site: 'https://fedoraproject.org', download: 'https://fedoraproject.org/workstation/download',
    profile: { gaming: 1, old: 0, nvidia: 1, look: 'own', release: 'fixed', systemd: true, nonfree: 0, privacy: 1, telemetry: true, uses: ['desktop', 'dev'], custom: 1, docs: 2 },
  },
  {
    id: 'rhel', name: 'Red Hat Enterprise Linux', parent: 'fedora', year: 2002, by: 'Red Hat (IBM)',
    desc: 'O Linux corporativo mais usado do mundo, com até 10 anos de suporte por versão. É pago para empresas, mas gratuito para desenvolvedores individuais.',
    model: 'Fixo (ciclo longo, ~10 anos)', pkg: 'DNF (.rpm)', store: 'GNOME Software', init: 'systemd',
    des: ['GNOME'], ease: 3, config: 4, terminal: 4, for: 'Empresas e servidores',
    site: 'https://www.redhat.com/pt-br/technologies/linux-platforms/enterprise-linux', download: 'https://developers.redhat.com/products/rhel/download',
    profile: { gaming: 0, old: 0, nvidia: 1, look: 'own', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['server'], custom: 0, docs: 2 },

    specs: { support: '10 anos por versão (+ estendido)', paid: 'Assinatura da Red Hat', compat: 'Padrão de compatibilidade (clones: Rocky, Alma)', cloud: 'AWS, Azure, Google Cloud, IBM' },
  },
  {
    id: 'rocky', name: 'Rocky Linux', parent: 'rhel', year: 2021, by: 'Rocky Enterprise Software Foundation',
    desc: 'Gratuito e 100% compatível com o RHEL. Criado por um dos fundadores do CentOS depois que o CentOS tradicional foi descontinuado.',
    model: 'Fixo (acompanha o RHEL)', pkg: 'DNF (.rpm)', store: 'GNOME Software', init: 'systemd',
    des: ['GNOME'], ease: 2, config: 4, terminal: 4, for: 'Servidores',
    site: 'https://rockylinux.org', download: 'https://rockylinux.org/download',
    profile: { gaming: 0, old: 0, nvidia: 1, look: 'own', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['server'], custom: 0, docs: 1 },

    also: [['centos', 'Criada para substituir o CentOS Linux']], specs: { support: '10 anos por versão', paid: 'Opcional (CIQ e parceiros)', compat: 'Compatível com o RHEL', cloud: 'AWS, Azure, Google Cloud, Oracle' },
  },
  {
    id: 'nobara', name: 'Nobara', parent: 'fedora', year: 2022, by: 'GloriousEggroll',
    desc: 'Fedora preparado para jogos e criação de conteúdo: drivers, codecs e ajustes de desempenho já vêm prontos. Do mesmo autor do Proton-GE.',
    model: 'Fixo (acompanha o Fedora)', pkg: 'DNF (.rpm) + Flatpak', store: 'Discover ou GNOME Software (conforme a edição)', init: 'systemd',
    des: ['KDE Plasma', 'GNOME'], ease: 4, config: 2, terminal: 2, for: 'Jogos, streaming',
    site: 'https://nobaraproject.org', download: 'https://nobaraproject.org/download-nobara/',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming', 'creative', 'desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'bazzite', name: 'Bazzite', parent: 'fedora', year: 2023, by: 'Universal Blue',
    desc: 'Baseado no Fedora Atomic: o sistema é imutável e difícil de quebrar. Tem edição com modo de jogo igual ao Steam Deck.',
    model: 'Imutável', pkg: 'Flatpak + rpm-ostree + Distrobox', store: 'Bazaar (Flathub)', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'Steam Gaming Mode'], ease: 5, config: 1, terminal: 1, for: 'Jogos, portáteis, quem não quer manutenção',
    site: 'https://bazzite.gg', download: 'https://bazzite.gg',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'any', release: 'immutable', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming', 'desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'qubes', name: 'Qubes OS', parent: 'fedora', year: 2012, by: 'Invisible Things Lab',
    desc: 'Segurança por isolamento: cada atividade roda numa máquina virtual separada (Xen). Se uma for comprometida, as outras continuam seguras. O domínio de controle usa Fedora. Exige bastante hardware.',
    model: 'Fixo', pkg: 'DNF nas VMs (Fedora, Debian, Whonix)', store: 'Nenhuma (programas instalados nas VMs-modelo)', init: 'systemd',
    des: ['XFCE'], ease: 1, config: 4, terminal: 4, for: 'Segurança máxima',
    site: 'https://www.qubes-os.org', download: 'https://www.qubes-os.org/downloads/',
    profile: { gaming: 0, old: 0, nvidia: 0, look: 'own', release: 'fixed', systemd: true, nonfree: 1, privacy: 2, uses: ['privacy', 'security'], custom: 0, docs: 1 },
  },

  // ---------------- openSUSE ----------------
  {
    id: 'opensuse', name: 'openSUSE', parent: 'suse', year: 2005, by: 'Comunidade + SUSE',
    desc: 'Projeto alemão com raízes no SUSE Linux (1994). Famoso pelo YaST, um painel que configura o sistema inteiro graficamente, e pelos snapshots automáticos. Tem duas versões principais: Leap e Tumbleweed.',
    pkg: 'zypper (.rpm) + YaST', store: 'YaST Software / Myrlyn + Discover ou GNOME Software', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], site: 'https://www.opensuse.org', download: 'https://get.opensuse.org',
  },
  {
    id: 'leap', name: 'openSUSE Leap', parent: 'opensuse', year: 2015, by: 'Comunidade + SUSE',
    desc: 'A versão estável, construída sobre a base do SUSE Linux Enterprise. Ideal para quem quer confiabilidade.',
    model: 'Fixo', pkg: 'zypper (.rpm) + YaST', store: 'YaST Software + Discover ou GNOME Software', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], ease: 3, config: 3, terminal: 3, for: 'Estabilidade, estações de trabalho',
    site: 'https://get.opensuse.org/leap/', download: 'https://get.opensuse.org/leap/',
    profile: { gaming: 1, old: 0, nvidia: 1, look: 'any', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'server'], custom: 2, docs: 2 },

    specs: { support: 'Cerca de 18 meses por versão menor', paid: 'Via SUSE Linux Enterprise', compat: 'Mesma base do SUSE Linux Enterprise', cloud: 'AWS, Azure, Google Cloud' },
  },
  {
    id: 'tumbleweed', name: 'openSUSE Tumbleweed', parent: 'opensuse', year: 2014, by: 'Comunidade + SUSE',
    desc: 'Rolling release testado automaticamente (openQA) antes de chegar até você, com snapshots para voltar atrás se algo der errado.',
    model: 'Rolling release (testado)', pkg: 'zypper (.rpm) + YaST', store: 'Myrlyn + Discover ou GNOME Software', init: 'systemd',
    des: ['KDE Plasma', 'GNOME', 'XFCE'], ease: 3, config: 3, terminal: 3, for: 'Quem quer novidades com segurança',
    site: 'https://get.opensuse.org/tumbleweed/', download: 'https://get.opensuse.org/tumbleweed/',
    profile: { gaming: 1, old: 0, nvidia: 1, look: 'any', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'dev'], custom: 2, docs: 2 },
  },
  {
    id: 'regata', name: 'Regata OS', parent: 'opensuse', year: 2018, by: 'Comunidade brasileira',
    desc: 'Distro brasileira baseada no openSUSE, voltada para jogos e produtividade, com loja própria e o Game Access.',
    model: 'Fixo', pkg: 'zypper (.rpm) + loja própria', store: 'Regata OS Store', init: 'systemd',
    des: ['KDE Plasma'], ease: 5, config: 1, terminal: 1, for: 'Iniciantes brasileiros, jogos',
    site: 'https://www.regataos.com.br', download: 'https://www.regataos.com.br',
    profile: { gaming: 2, old: 0, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 1, br: true, uses: ['gaming', 'desktop'], custom: 1, docs: 1 },
  },

  // ---------------- Gentoo e Slackware ----------------
  {
    id: 'gentoo', name: 'Gentoo', parent: 'gnu', year: 2002, by: 'Daniel Robbins / comunidade',
    desc: 'Você compila praticamente tudo a partir do código-fonte, escolhendo os recursos de cada programa com as "USE flags". Controle total, mas instalar e atualizar leva tempo.',
    model: 'Rolling release (código-fonte)', pkg: 'Portage (emerge)', store: 'Nenhuma por padrão', init: 'OpenRC ou systemd',
    des: ['Qualquer uma (você escolhe)'], ease: 1, config: 5, terminal: 5, for: 'Entusiastas, quem quer otimizar cada detalhe',
    site: 'https://www.gentoo.org', download: 'https://www.gentoo.org/downloads/',
    profile: { gaming: 1, old: 1, nvidia: 1, look: 'custom', release: 'source', systemd: 'both', nonfree: 1, privacy: 1, uses: ['learn'], custom: 2, docs: 2 },
  },
  {
    id: 'slackware', name: 'Slackware', parent: 'gnu', year: 1993, by: 'Patrick Volkerding',
    desc: 'A distro mais antiga ainda ativa. Fiel à filosofia Unix: simples e transparente, sem resolver dependências automaticamente.',
    model: 'Fixo (lançamentos raros) + current', pkg: 'pkgtool / slackpkg', store: 'Nenhuma por padrão', init: 'Estilo BSD (sysvinit)',
    des: ['KDE Plasma', 'XFCE'], ease: 1, config: 5, terminal: 5, for: 'Quem quer aprender Unix de verdade',
    site: 'http://www.slackware.com', download: 'http://www.slackware.com/getslack/',
    profile: { gaming: 0, old: 1, nvidia: 1, look: 'custom', release: 'fixed', systemd: false, nonfree: 1, privacy: 1, uses: ['learn', 'server'], custom: 2, docs: 1 },
  },

  // ---------------- Independentes ----------------
  {
    id: 'indep', name: 'Independentes', parent: 'gnu', kind: 'group',
    desc: 'Distros que não derivam de nenhuma outra: têm gerenciador de pacotes, repositórios e decisões próprias.',
  },
  {
    id: 'void', name: 'Void Linux', parent: 'indep', year: 2008, by: 'Juan Romero Pardines / comunidade',
    desc: 'Rápida, minimalista e independente. Usa o runit (inicia muito rápido) e oferece versões com glibc ou musl.',
    model: 'Rolling release', pkg: 'XBPS', store: 'Nenhuma por padrão (OctoXBPS opcional)', init: 'runit',
    des: ['XFCE', 'Qualquer outra via repositório'], ease: 2, config: 4, terminal: 4, for: 'Quem gosta de sistema enxuto',
    site: 'https://voidlinux.org', download: 'https://voidlinux.org/download/',
    profile: { gaming: 0, old: 2, nvidia: 1, look: 'custom', release: 'rolling', systemd: false, nonfree: 1, privacy: 1, uses: ['learn', 'dev'], custom: 2, docs: 1 },
  },
  {
    id: 'solus', name: 'Solus', parent: 'indep', year: 2015, by: 'Comunidade',
    desc: 'Pensada para desktop, com atualizações semanais selecionadas. Berço da interface Budgie.',
    model: 'Rolling (curado, semanal)', pkg: 'eopkg', store: 'Software Center', init: 'systemd',
    des: ['Budgie', 'KDE Plasma', 'GNOME', 'XFCE'], ease: 4, config: 2, terminal: 2, for: 'Uso doméstico',
    site: 'https://getsol.us', download: 'https://getsol.us/download/',
    profile: { gaming: 1, old: 0, nvidia: 2, look: 'own', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, uses: ['desktop'], custom: 1, docs: 1 },
  },
  {
    id: 'nixos', name: 'NixOS', parent: 'indep', year: 2003, by: 'Eelco Dolstra / comunidade',
    desc: 'O sistema inteiro é descrito num arquivo de configuração. Você pode reproduzir a mesma máquina em qualquer lugar e voltar a qualquer versão anterior. Tem um dos maiores repositórios de pacotes que existem.',
    model: 'Fixo (semestral) ou unstable', pkg: 'Nix', store: 'Nenhuma nativa (GNOME Software/Discover só para Flatpak)', init: 'systemd',
    des: ['GNOME', 'KDE Plasma', 'Qualquer outra'], ease: 1, config: 5, terminal: 5, for: 'Desenvolvedores, quem quer reprodutibilidade',
    site: 'https://nixos.org', download: 'https://nixos.org/download/',
    profile: { gaming: 1, old: 0, nvidia: 1, look: 'custom', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['dev', 'learn'], custom: 2, docs: 1 },
  },
  {
    id: 'alpine', name: 'Alpine Linux', parent: 'linux', year: 2005, by: 'Comunidade',
    desc: 'Minúscula e segura, usa musl e BusyBox. É a base mais popular para containers Docker.',
    model: 'Fixo (semestral) + edge', pkg: 'apk', store: 'Nenhuma por padrão', init: 'OpenRC',
    des: ['Qualquer uma (manual)'], ease: 1, config: 5, terminal: 5, for: 'Containers, servidores, roteadores',
    site: 'https://alpinelinux.org', download: 'https://alpinelinux.org/downloads/',
    profile: { gaming: 0, old: 2, nvidia: 0, look: 'custom', release: 'fixed', systemd: false, nonfree: 0, privacy: 1, uses: ['server'], custom: 2, docs: 1 },

    specs: { support: '2 anos por versão', compat: 'Base padrão de contêineres Docker', cloud: 'AWS, Azure, Google Cloud', hardware: 'Contêineres, roteadores, Raspberry Pi', footprint: 'Cerca de 5 MB em contêiner' },
  },
  {
    id: 'crux', name: 'CRUX', parent: 'indep', year: 2002, by: 'Per Lidén / comunidade',
    desc: 'Minimalista e baseada em código-fonte, com sistema de "ports" inspirado no BSD. Foi uma das inspirações do Arch.',
    model: 'Fixo', pkg: 'ports (prt-get)', store: 'Nenhuma', init: 'Estilo BSD',
    des: ['Qualquer uma (manual)'], ease: 1, config: 5, terminal: 5, for: 'Usuários experientes',
    site: 'https://crux.nu', download: 'https://crux.nu/Main/Download',
    profile: { gaming: 0, old: 1, nvidia: 0, look: 'custom', release: 'source', systemd: false, nonfree: 0, privacy: 1, uses: ['learn'], custom: 2, docs: 0 },
  },
  {
    id: 'pclinuxos', name: 'PCLinuxOS', parent: 'indep', year: 2003, by: 'Bill Reynolds (Texstar)',
    desc: 'Nasceu do Mandrake e hoje é independente. Rolling release amigável, sem systemd, com o gerenciador gráfico Synaptic.',
    model: 'Rolling release', pkg: 'APT-RPM + Synaptic', store: 'Synaptic', init: 'sysvinit',
    des: ['KDE Plasma', 'MATE', 'XFCE'], ease: 4, config: 2, terminal: 2, for: 'Uso doméstico',
    site: 'https://www.pclinuxos.com', download: 'https://www.pclinuxos.com/get-pclinuxos/',
    profile: { gaming: 1, old: 1, nvidia: 2, look: 'windows', release: 'rolling', systemd: false, nonfree: 2, privacy: 1, uses: ['desktop'], custom: 1, docs: 1 },

    also: [['mandrake', 'Começou baseada no Mandrake']],
  },
  {
    id: 'lfs', name: 'Linux From Scratch', parent: 'indep', year: 1999, by: 'Gerard Beekmans',
    desc: 'Não é bem uma distro, é um livro: ensina a construir seu próprio Linux do zero, compilando cada componente. A melhor aula sobre como um sistema funciona por dentro.',
    model: 'Livro (versões periódicas)', pkg: 'Nenhum (você compila)', store: 'Nenhuma (você compila tudo)', init: 'sysvinit ou systemd',
    des: ['Você decide'], ease: 1, config: 5, terminal: 5, for: 'Aprendizado profundo',
    site: 'https://www.linuxfromscratch.org', download: 'https://www.linuxfromscratch.org/lfs/',
    profile: { gaming: 0, old: 1, nvidia: 0, look: 'custom', release: 'source', systemd: 'both', nonfree: 0, privacy: 1, uses: ['learn'], custom: 2, docs: 1 },
  },

  // ---------------- Wiki 2.0: linhagens históricas, servidores, celulares, embarcados e novas de desktop ----------------
  { id: 'redhat', name: 'Red Hat Linux', parent: 'gnu', year: 1995, by: 'Red Hat', logo: 'si:redhat', cats: ['desktop'], discontinued: 2004, desc: 'A distro comercial que popularizou o Linux nos anos 1990 e criou o formato de pacotes RPM. Em 2003 virou duas: o Fedora, comunitário, e o Red Hat Enterprise Linux, para empresas.', model: 'Fixo', pkg: 'RPM', site: 'https://www.redhat.com' },
  { id: 'mandrake', name: 'Mandrake Linux', parent: 'redhat', year: 1998, by: 'MandrakeSoft', logo: 'vec:star', cats: ['desktop'], discontinued: 2005, desc: 'Começou como um Red Hat com KDE e foi uma das primeiras distros pensadas para iniciantes, com instalador gráfico simples. Virou Mandriva em 2005.', pkg: 'RPM (urpmi)' },
  { id: 'mandriva', name: 'Mandriva Linux', parent: 'mandrake', year: 2005, by: 'Mandriva', logo: 'vec:star', cats: ['desktop'], discontinued: 2011, desc: 'A continuação do Mandrake depois da fusão com a brasileira Conectiva. A empresa entrou em crise, a última versão saiu em 2011, e a comunidade seguiu em dois forks: Mageia e OpenMandriva.', pkg: 'RPM (urpmi)' },
  { id: 'mageia', name: 'Mageia', parent: 'mandriva', year: 2010, by: 'Comunidade Mageia', logo: 'vec:star', cats: ['desktop'], desc: 'Fork comunitário do Mandriva, mantido por uma associação sem fins lucrativos. Tem um centro de controle gráfico completo e versões estáveis com bastante tempo de suporte.', model: 'Fixo (versões com cerca de 18 meses de suporte)', pkg: 'RPM (DNF e urpmi)', store: 'Rpmdrake', init: 'systemd', des: ['KDE Plasma', 'GNOME', 'XFCE'], ease: 4, config: 2, terminal: 2, for: 'Quem quer um sistema estável com ferramentas gráficas para tudo', site: 'https://www.mageia.org', download: 'https://www.mageia.org/downloads/', profile: { gaming: 1, old: 1, nvidia: 1, look: 'any', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 1, docs: 1 } },
  { id: 'openmandriva', name: 'OpenMandriva Lx', parent: 'mandriva', year: 2013, by: 'Associação OpenMandriva', logo: 'vec:star', cats: ['desktop'], desc: 'O outro herdeiro do Mandriva. Usa KDE Plasma por padrão, é compilado com otimizações próprias e tem duas versões: Rock (estável) e ROME (rolling release).', model: 'Fixo (Rock) ou rolling (ROME)', pkg: 'RPM (DNF)', store: 'Discover', init: 'systemd', des: ['KDE Plasma'], ease: 3, config: 3, terminal: 3, for: 'Fãs do KDE que querem algo diferente do comum', site: 'https://www.openmandriva.org', download: 'https://www.openmandriva.org/en/download', profile: { gaming: 1, old: 0, nvidia: 1, look: 'windows', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 2, docs: 0 } },
  { id: 'suse', name: 'SUSE Linux', parent: 'gnu', year: 1994, by: 'SUSE (Alemanha)', logo: 'si:suse', cats: ['desktop'], discontinued: 2005, desc: 'Uma das distros mais antigas, criada na Alemanha e famosa pelo YaST, um painel que configura o sistema inteiro. Em 2005 a parte gratuita virou o projeto openSUSE.', pkg: 'RPM (YaST)' },
  { id: 'sles', name: 'SUSE Linux Enterprise', parent: 'suse', year: 2000, by: 'SUSE', logo: 'si:suse', cats: ['server'], desc: 'A versão paga da SUSE para empresas, usada em servidores, nuvem e sistemas como os da SAP. Divide a base com o openSUSE Leap.', model: 'Fixo (Service Packs)', pkg: 'RPM (Zypper)', init: 'systemd', site: 'https://www.suse.com/products/server/', also: [['leap', 'Mesma base do openSUSE Leap']], specs: { support: 'Até 13 anos por versão (com suporte estendido)', paid: 'Assinatura da SUSE', compat: 'Compartilha a base com o openSUSE Leap', cloud: 'AWS, Azure, Google Cloud' } },
  { id: 'alma', name: 'AlmaLinux', parent: 'rhel', year: 2021, by: 'AlmaLinux OS Foundation', logo: 'si:almalinux', cats: ['server'], desc: 'Clone gratuito do Red Hat Enterprise Linux, mantido por uma fundação sem fins lucrativos. Surgiu quando o CentOS Linux foi encerrado.', model: 'Fixo (acompanha o RHEL)', pkg: 'RPM (DNF)', init: 'systemd', site: 'https://almalinux.org', download: 'https://almalinux.org/get-almalinux/', also: [['centos', 'Criada para substituir o CentOS Linux']], specs: { support: '10 anos por versão', paid: 'Opcional, por empresas parceiras', compat: 'Compatível com o RHEL', cloud: 'AWS, Azure, Google Cloud, Oracle' } },
  { id: 'centos', name: 'CentOS Linux', parent: 'rhel', year: 2004, by: 'Comunidade, depois Red Hat', logo: 'si:centos', cats: ['server'], discontinued: 2024, desc: 'Por 20 anos foi a cópia gratuita do RHEL usada em milhões de servidores. A Red Hat encerrou o CentOS Linux (a última versão perdeu o suporte em 2024) e manteve só o CentOS Stream, que fica um passo à frente do RHEL.', pkg: 'RPM (YUM/DNF)', init: 'systemd', site: 'https://www.centos.org', specs: { support: '10 anos por versão (até o fim do projeto)', compat: 'Compatível com o RHEL' } },
  { id: 'amazonlinux', name: 'Amazon Linux', parent: 'fedora', year: 2010, by: 'Amazon Web Services', logo: 'vec:cloud', cats: ['server'], desc: 'O sistema da Amazon para servidores na AWS. A versão atual, Amazon Linux 2023, é baseada no Fedora e vem otimizada para a nuvem da Amazon.', model: 'Fixo', pkg: 'RPM (DNF)', init: 'systemd', site: 'https://aws.amazon.com/linux/amazon-linux-2023/', specs: { support: '5 anos por versão', paid: 'Incluído na AWS', cloud: 'AWS' } },
  { id: 'azurelinux', name: 'Azure Linux', parent: 'indep', year: 2020, by: 'Microsoft', logo: 'vec:cloud', cats: ['server'], desc: 'Distro da Microsoft feita do zero para a própria nuvem e para contêineres. Começou como CBL-Mariner, de uso interno, e hoje roda em serviços do Azure.', model: 'Fixo', pkg: 'RPM (tdnf)', init: 'systemd', site: 'https://github.com/microsoft/azurelinux', specs: { support: 'Cerca de 3 anos por versão', paid: 'Incluído no Azure', cloud: 'Azure' } },
  { id: 'proxmox', name: 'Proxmox VE', parent: 'debian', year: 2008, by: 'Proxmox Server Solutions', logo: 'si:proxmox', cats: ['server'], desc: 'Sistema baseado no Debian para transformar um computador em servidor de máquinas virtuais e contêineres, tudo controlado por uma página no navegador. Muito usado em servidores caseiros.', model: 'Fixo (acompanha o Debian)', pkg: 'APT (.deb)', init: 'systemd', site: 'https://www.proxmox.com', download: 'https://www.proxmox.com/en/downloads', specs: { support: 'Acompanha o Debian (cerca de 3 anos por versão)', paid: 'Assinatura opcional', compat: 'Pacotes do Debian' } },
  { id: 'googlecos', name: 'Container-Optimized OS', parent: 'chromiumos', year: 2016, by: 'Google', logo: 'si:googlecloud', cats: ['server'], desc: 'Sistema mínimo do Google para rodar contêineres na Google Cloud. Vem do ChromiumOS, atualiza sozinho e não tem gerenciador de pacotes.', model: 'Atualização automática da imagem inteira', init: 'systemd', site: 'https://cloud.google.com/container-optimized-os/docs', specs: { support: 'Versões LTS com cerca de 2 anos', paid: 'Incluído na Google Cloud', cloud: 'Google Cloud' } },
  { id: 'chromiumos', name: 'ChromiumOS', parent: 'gentoo', year: 2009, by: 'Google / comunidade', logo: 'si:googlechrome', cats: ['chromebook'], desc: 'A versão de código aberto que serve de base para o ChromeOS. Usa ferramentas do Gentoo para montar o sistema, que gira em torno do navegador.', model: 'Atualização automática da imagem inteira', init: 'Upstart', site: 'https://www.chromium.org/chromium-os/' },
  { id: 'chromeos', name: 'ChromeOS', parent: 'chromiumos', year: 2011, by: 'Google', logo: 'si:googlechrome', cats: ['chromebook'], desc: 'O sistema dos Chromebooks: simples, rápido, seguro e centrado no Chrome. Roda apps Android e, se você ativar, também programas Linux.', model: 'Atualização automática a cada ~4 semanas', store: 'Google Play', site: 'https://www.google.com/chromebook/chrome-os/' },
  { id: 'chromeosflex', name: 'ChromeOS Flex', parent: 'chromeos', year: 2022, by: 'Google', logo: 'si:googlechrome', cats: ['chromebook'], desc: 'ChromeOS gratuito para instalar em PCs e Macs antigos, transformando-os em algo parecido com um Chromebook. Não roda apps Android.', model: 'Atualização automática', site: 'https://chromeenterprise.google/os/chromeosflex/' },
  { id: 'fydeos', name: 'FydeOS', parent: 'chromiumos', year: 2018, by: 'Fyde Innovations', logo: 'vec:browser', cats: ['chromebook'], desc: 'Sistema baseado no ChromiumOS para PCs comuns, com apps Android e programas Linux, sem depender dos serviços do Google.', model: 'Atualização automática', site: 'https://fydeos.io' },
  { id: 'android', name: 'Android', parent: 'linux', year: 2008, by: 'Google (AOSP)', logo: 'si:android', cats: ['mobile'], desc: 'O sistema da maioria dos celulares do mundo. Usa o kernel Linux, mas não as ferramentas GNU: tem o próprio jeito de rodar apps. A parte aberta se chama AOSP.', model: 'Uma versão grande por ano', store: 'Google Play', site: 'https://source.android.com', specs: { devices: 'Bilhões de celulares, tablets e TVs', apps: 'Google Play e outras lojas', google: 'Sim, na maioria dos aparelhos' } },
  { id: 'cyanogenmod', name: 'CyanogenMod', parent: 'android', year: 2009, by: 'Comunidade / Cyanogen Inc.', logo: 'vec:phone', cats: ['mobile'], discontinued: 2016, desc: 'A versão alternativa de Android mais famosa: deixava celulares antigos atualizados e sem os excessos dos fabricantes. Foi encerrada em 2016 e continuou como LineageOS.', specs: { devices: 'Centenas de modelos', apps: 'Google Play opcional', google: 'Opcional' } },
  { id: 'lineageos', name: 'LineageOS', parent: 'cyanogenmod', year: 2016, by: 'Comunidade', logo: 'si:lineageos', cats: ['mobile'], desc: 'Herdeiro do CyanogenMod: um Android limpo e livre que dá vida nova a celulares que o fabricante abandonou.', model: 'Acompanha as versões do Android', site: 'https://lineageos.org', download: 'https://download.lineageos.org', specs: { devices: 'Centenas de modelos com suporte oficial', apps: 'F-Droid; Google Play opcional', google: 'Opcional (instalado à parte)' } },
  { id: 'grapheneos', name: 'GrapheneOS', parent: 'android', year: 2019, by: 'GrapheneOS Foundation', logo: 'si:grapheneos', cats: ['mobile', 'security'], desc: 'Android focado em privacidade e segurança, para celulares Google Pixel. Os apps do Google podem ser usados, mas presos numa caixa de areia, sem acesso especial ao sistema.', model: 'Atualizações rápidas, acompanhando o Android', site: 'https://grapheneos.org', download: 'https://grapheneos.org/install/', specs: { devices: 'Celulares Google Pixel', apps: 'Google Play opcional, isolado', google: 'Opcional, sem privilégios' } },
  { id: 'ubuntutouch', name: 'Ubuntu Touch', parent: 'ubuntu', year: 2013, by: 'Canonical; desde 2017, UBports', logo: 'si:ubuntu', cats: ['mobile'], desc: 'Ubuntu para celulares, com gestos no lugar dos botões. A Canonical desistiu em 2017 e a comunidade UBports seguiu com o projeto.', model: 'Atualizações pela rede (OTA)', store: 'OpenStore', site: 'https://ubports.com', specs: { devices: 'Dezenas de modelos (Pixel 3a, Volla, Fairphone…)', apps: 'OpenStore', google: 'Não' } },
  { id: 'mobian', name: 'Mobian', parent: 'debian', year: 2020, by: 'Comunidade', logo: 'vec:phone', cats: ['mobile'], desc: 'Debian adaptado para celulares Linux como o PinePhone e o Librem 5, com interface própria para telas pequenas.', model: 'Acompanha o Debian', pkg: 'APT (.deb)', site: 'https://mobian.org', specs: { devices: 'PinePhone, Librem 5, OnePlus 6 e outros', apps: 'Programas Linux (Debian)', google: 'Não' } },
  { id: 'droidian', name: 'Droidian', parent: 'mobian', year: 2021, by: 'Comunidade', logo: 'vec:phone', cats: ['mobile'], desc: 'Leva o Debian para celulares Android, aproveitando os drivers do próprio Android para funcionar em aparelhos comuns.', pkg: 'APT (.deb)', site: 'https://droidian.org', also: [['android', 'Usa os drivers do Android']], specs: { devices: 'Alguns celulares Android (Pixel 3a, OnePlus…)', apps: 'Programas Linux (Debian)', google: 'Não' } },
  { id: 'postmarketos', name: 'postmarketOS', parent: 'alpine', year: 2017, by: 'Comunidade', logo: 'vec:phone', cats: ['mobile'], desc: 'Linux de verdade para celulares, baseado no Alpine. A meta é manter aparelhos funcionando por dez anos ou mais, muito depois do fim do suporte do fabricante.', pkg: 'APK', site: 'https://postmarketos.org', also: [['android', 'Roda em celulares feitos para Android']], specs: { devices: 'Centenas de celulares, muitos antigos', apps: 'Programas Linux (Alpine)', google: 'Não' } },
  { id: 'tinycore', name: 'Tiny Core Linux', parent: 'linux', year: 2008, by: 'Robert Shingledecker / comunidade', logo: 'vec:cube', cats: ['embedded'], desc: 'Um Linux minúsculo: a versão com interface gráfica tem cerca de 25 MB e roda inteira na memória RAM. Você monta o resto instalando só o que precisa.', pkg: 'tce', site: 'http://tinycorelinux.net', specs: { hardware: 'Qualquer PC, até muito antigo', footprint: 'Cerca de 25 MB com interface gráfica' } },
  { id: 'openwrt', name: 'OpenWrt', parent: 'linux', year: 2004, by: 'Comunidade', logo: 'si:openwrt', cats: ['embedded'], desc: 'Sistema para roteadores: troca o software do fabricante por um Linux completo, com mais recursos, mais segurança e atualizações por muito mais tempo.', pkg: 'opkg / apk', site: 'https://openwrt.org', download: 'https://firmware-selector.openwrt.org', specs: { hardware: 'Roteadores Wi-Fi e aparelhos de rede', footprint: 'A partir de 16 MB de armazenamento e 128 MB de RAM' } },
  { id: 'sonic', name: 'SONiC', parent: 'debian', year: 2016, by: 'Microsoft; hoje Linux Foundation', logo: 'vec:switch', cats: ['embedded', 'server'], desc: 'Sistema aberto para os switches de rede dos grandes data centers. Criado pela Microsoft para o Azure, é baseado no Debian.', pkg: 'APT (.deb)', site: 'https://sonicfoundation.dev', specs: { hardware: 'Switches de data center', support: 'Versões semestrais' } },
  { id: 'azuresphere', name: 'Azure Sphere OS', parent: 'linux', year: 2018, by: 'Microsoft', logo: 'vec:shield', cats: ['embedded'], desc: 'Linux minúsculo e blindado da Microsoft para aparelhos da internet das coisas, com atualizações de segurança automáticas pela nuvem.', model: 'Atualização automática pela nuvem', site: 'https://learn.microsoft.com/azure-sphere/', specs: { hardware: 'Microcontroladores Azure Sphere (MT3620)', footprint: 'Cerca de 4 MB de RAM' } },
  { id: 'rtlinux', name: 'Linux em tempo real', parent: 'linux', year: 2005, by: 'Comunidade (PREEMPT_RT)', logo: 'vec:clock', cats: ['embedded'], desc: 'Não é uma distro, e sim um modo do kernel que garante respostas em tempo certo, essencial em robôs, máquinas industriais e áudio profissional. Desde 2024 faz parte do kernel oficial.', site: 'https://wiki.linuxfoundation.org/realtime/start', specs: { hardware: 'Robôs, indústria, áudio' } },
  { id: 'raspios', name: 'Raspberry Pi OS', parent: 'debian', year: 2012, by: 'Raspberry Pi Ltd', logo: 'si:raspberrypi', cats: ['embedded'], desc: 'O sistema oficial dos computadorzinhos Raspberry Pi, baseado no Debian. Vem com área de trabalho leve e ferramentas para aprender programação e eletrônica.', model: 'Acompanha o Debian', pkg: 'APT (.deb)', init: 'systemd', des: ['LXDE'], site: 'https://www.raspberrypi.com/software/', specs: { hardware: 'Placas Raspberry Pi', footprint: 'Versão Lite sem interface, a partir de 512 MB de RAM' } },
  { id: 'apertis', name: 'Apertis', parent: 'debian', year: 2015, by: 'Collabora / Bosch', logo: 'vec:gear', cats: ['embedded'], desc: 'Distro baseada no Debian para produtos industriais e carros, com atualizações seguras de imagem inteira.', pkg: 'APT (.deb)', site: 'https://www.apertis.org', specs: { hardware: 'Carros e equipamentos industriais' } },
  { id: 'wsl', name: 'WSL', parent: 'linux', year: 2016, by: 'Microsoft', logo: 'vec:terminal', cats: ['desktop'], quiz: false, desc: 'Não é uma distro: é um recurso do Windows que roda distros Linux (Ubuntu, Debian, Fedora…) dentro dele, sem instalar outro sistema. Bom para programar; para trocar de vez, use uma distro de verdade.', site: 'https://learn.microsoft.com/windows/wsl/', also: [['ubuntu', 'Distro padrão do WSL']] },
  { id: 'tuxedo', name: 'TUXEDO OS', parent: 'ubuntu', year: 2022, by: 'TUXEDO Computers', logo: 'si:tuxedocomputers', cats: ['desktop'], desc: 'Feita pela fabricante alemã de notebooks TUXEDO: base Ubuntu LTS com KDE Plasma recente, sem Snap e com drivers prontos.', model: 'Ubuntu LTS + KDE recente', pkg: 'APT (.deb) + Flatpak', store: 'Discover', init: 'systemd', des: ['KDE Plasma'], ease: 4, config: 2, terminal: 2, for: 'Quem quer KDE moderno sobre uma base estável', site: 'https://www.tuxedocomputers.com/os', download: 'https://www.tuxedocomputers.com/os', profile: { gaming: 1, old: 0, nvidia: 2, look: 'windows', release: 'fixed', systemd: true, nonfree: 2, privacy: 1, uses: ['desktop', 'dev'], custom: 2, docs: 1 } },
  { id: 'kdeneon', name: 'KDE neon', parent: 'ubuntu', year: 2016, by: 'KDE', logo: 'si:kdeneon', cats: ['desktop'], desc: 'Feita pelo próprio KDE: base Ubuntu LTS com a versão mais nova do Plasma assim que ela sai.', model: 'Ubuntu LTS + Plasma sempre novo', pkg: 'APT (.deb) + Flatpak', store: 'Discover', init: 'systemd', des: ['KDE Plasma'], ease: 3, config: 2, terminal: 2, for: 'Quem quer o KDE mais novo, do jeito que o KDE fez', site: 'https://neon.kde.org', download: 'https://neon.kde.org/download', profile: { gaming: 1, old: 0, nvidia: 1, look: 'windows', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 2, docs: 1 } },
  { id: 'kdelinux', name: 'KDE Linux', parent: 'arch', year: 2025, by: 'KDE', logo: 'si:kde', cats: ['desktop'], quiz: false, desc: 'O novo sistema do KDE, ainda em fase de testes: imutável, com base no Arch e o Plasma mais recente. Apps vêm em Flatpak.', model: 'Imutável (imagem inteira)', pkg: 'Flatpak', store: 'Discover', init: 'systemd', des: ['KDE Plasma'], site: 'https://kde.org/linux/', also: [['kdeneon', 'Projeto mais novo do KDE, depois do neon']] },
  { id: 'anduin', name: 'AnduinOS', parent: 'ubuntu', year: 2024, by: 'Anduin Xue', logo: 'vec:window', cats: ['desktop'], desc: 'Ubuntu com GNOME arrumado para ficar parecido com o Windows 11: barra embaixo, menu iniciar e tudo no lugar esperado.', model: 'Acompanha o Ubuntu', pkg: 'APT (.deb) + Flatpak', store: 'GNOME Software', init: 'systemd', des: ['GNOME'], ease: 5, config: 1, terminal: 1, for: 'Quem vem do Windows 11 e não quer estranhar', site: 'https://www.anduinos.com', download: 'https://www.anduinos.com', profile: { gaming: 1, old: 0, nvidia: 1, look: 'windows', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 1, docs: 0 } },
  { id: 'vanilla', name: 'Vanilla OS', parent: 'debian', year: 2022, by: 'Comunidade Vanilla OS', logo: 'vec:layers', cats: ['desktop'], desc: 'Sistema imutável com GNOME puro: a base não muda e as atualizações são aplicadas de uma vez, sem quebrar. Programas de outras distros rodam em caixinhas separadas.', model: 'Imutável', pkg: 'Flatpak + caixas (Apx)', store: 'GNOME Software', init: 'systemd', des: ['GNOME'], ease: 3, config: 2, terminal: 3, for: 'Quem quer um sistema que não quebra', site: 'https://vanillaos.org', download: 'https://vanillaos.org/download', also: [['ubuntu', 'A versão 1 era baseada no Ubuntu']], profile: { gaming: 1, old: 0, nvidia: 1, look: 'mac', release: 'immutable', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'dev'], custom: 0, docs: 0 } },
  { id: 'peppermint', name: 'Peppermint OS', parent: 'debian', year: 2010, by: 'Equipe Peppermint', logo: 'vec:leaf', cats: ['desktop'], desc: 'Leve e simples, com XFCE e base Debian. Feita para PCs modestos e para quem usa muito o navegador.', model: 'Acompanha o Debian', pkg: 'APT (.deb)', store: 'Synaptic', init: 'systemd', des: ['XFCE'], ease: 4, config: 2, terminal: 2, for: 'PCs mais fracos e uso leve', site: 'https://peppermintos.com', download: 'https://peppermintos.com', profile: { gaming: 0, old: 2, nvidia: 1, look: 'windows', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 1, docs: 0 } },
  { id: 'minios', name: 'MiniOS', parent: 'debian', by: 'Comunidade MiniOS', logo: 'vec:usb', cats: ['desktop'], desc: 'Sistema portátil baseado no Debian, feito para rodar direto do pendrive e guardar seus arquivos e ajustes nele.', model: 'Live (roda do pendrive)', pkg: 'APT (.deb)', init: 'systemd', des: ['XFCE', 'Fluxbox'], ease: 3, config: 2, terminal: 2, for: 'Levar o seu sistema no bolso', site: 'https://minios.dev', download: 'https://minios.dev', profile: { gaming: 0, old: 2, nvidia: 0, look: 'windows', release: 'live', systemd: true, nonfree: 1, privacy: 1, uses: ['portable', 'desktop'], custom: 1, docs: 0 } },
  { id: 'q4os', name: 'Q4OS', parent: 'debian', year: 2013, by: 'Equipe Q4OS', logo: 'vec:window', cats: ['desktop'], desc: 'Base Debian com cara de Windows clássico, usando a interface Trinity (bem leve) ou o KDE Plasma. Ótima para dar vida a PCs antigos.', model: 'Acompanha o Debian', pkg: 'APT (.deb)', store: 'Synaptic', init: 'systemd', des: ['Trinity', 'KDE Plasma'], ease: 4, config: 2, terminal: 2, for: 'PCs antigos e quem gosta do Windows clássico', site: 'https://q4os.org', download: 'https://q4os.org/downloads1.html', profile: { gaming: 0, old: 2, nvidia: 1, look: 'windows', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop'], custom: 1, docs: 0 } },
  { id: 'dsl', name: 'Damn Small Linux', parent: 'antix', year: 2005, by: 'John Andrews', logo: 'vec:usb', cats: ['desktop'], desc: 'Famosa por caber em 50 MB nos anos 2000. Voltou em 2024 com base no antiX, ainda pequena e feita para computadores bem antigos.', model: 'Live ou instalada', pkg: 'APT (.deb)', init: 'sysvinit', des: ['Fluxbox', 'JWM'], ease: 2, config: 3, terminal: 3, for: 'Computadores muito antigos', site: 'https://www.damnsmalllinux.org', download: 'https://www.damnsmalllinux.org', also: [['knoppix', 'A versão original era baseada no Knoppix']], profile: { gaming: 0, old: 2, nvidia: 0, look: 'custom', release: 'live', systemd: false, nonfree: 0, privacy: 1, uses: ['desktop', 'portable'], custom: 1, docs: 0 } },
  { id: 'endeavouros', name: 'EndeavourOS', parent: 'arch', year: 2019, by: 'Comunidade', logo: 'si:endeavouros', cats: ['desktop'], desc: 'Arch com instalador gráfico e uma comunidade conhecida por ser acolhedora. Fica bem perto do Arch puro, só que muito mais fácil de instalar.', model: 'Rolling release', pkg: 'Pacman + AUR', init: 'systemd', des: ['KDE Plasma', 'GNOME', 'XFCE', 'Cinnamon', 'i3wm'], ease: 3, config: 3, terminal: 4, for: 'Quem quer Arch sem a instalação manual', site: 'https://endeavouros.com', download: 'https://endeavouros.com', profile: { gaming: 1, old: 1, nvidia: 1, look: 'any', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'dev', 'gaming'], custom: 2, docs: 1 } },
  { id: 'omarchy', name: 'Omarchy', parent: 'arch', year: 2025, by: 'David Heinemeier Hansson (37signals)', logo: 'si:omarchy', cats: ['desktop'], desc: 'Arch com o Hyprland já configurado e bonito, feito para programadores que usam muito o teclado. Muito personalizável, mas exige gostar de atalhos e terminal.', model: 'Rolling release', pkg: 'Pacman + AUR', init: 'systemd', des: ['Hyprland'], ease: 2, config: 3, terminal: 5, for: 'Programadores que vivem no teclado', site: 'https://omarchy.org', download: 'https://omarchy.org', profile: { gaming: 1, old: 0, nvidia: 1, look: 'custom', release: 'rolling', systemd: true, nonfree: 1, privacy: 1, uses: ['dev'], custom: 2, docs: 0 } },
  { id: 'pikaos', name: 'PikaOS', parent: 'debian', by: 'Comunidade PikaOS', logo: 'vec:bolt', cats: ['desktop', 'gaming'], desc: 'Feita para jogos: base Debian com kernel, drivers e programas de jogo sempre atualizados e já configurados.', model: 'Rolling release', pkg: 'APT (.deb) + Flatpak', init: 'systemd', des: ['KDE Plasma', 'GNOME', 'Hyprland'], ease: 3, config: 2, terminal: 2, for: 'Jogos no PC', site: 'https://wiki.pika-os.com', download: 'https://wiki.pika-os.com', profile: { gaming: 2, old: 0, nvidia: 2, look: 'any', release: 'rolling', systemd: true, nonfree: 2, privacy: 1, uses: ['gaming', 'desktop'], custom: 1, docs: 0 } },
  { id: 'asahi', name: 'Asahi Linux', parent: 'fedora', year: 2021, by: 'Asahi Linux / Fedora', logo: 'si:asahilinux', cats: ['desktop'], desc: 'Linux para Macs com chip Apple M1 e M2. O projeto fez os drivers do zero e entrega um Fedora adaptado para esses Macs.', model: 'Acompanha o Fedora', pkg: 'RPM (DNF) + Flatpak', store: 'Discover', init: 'systemd', des: ['KDE Plasma', 'GNOME'], ease: 3, config: 3, terminal: 3, for: 'Quem tem Mac M1/M2 e quer Linux', site: 'https://asahilinux.org', download: 'https://asahilinux.org', profile: { gaming: 0, old: 0, nvidia: 0, look: 'windows', release: 'fixed', systemd: true, nonfree: 1, privacy: 1, uses: ['desktop', 'dev'], custom: 1, docs: 1 } },
  { id: 'aerynos', name: 'AerynOS', parent: 'indep', year: 2025, by: 'Ikey Doherty / comunidade', logo: 'vec:cube', cats: ['desktop'], quiz: false, desc: 'Distro independente em fase alfa, do criador do Solus. Tem gerenciador de pacotes próprio que permite voltar o sistema inteiro para uma versão anterior.', model: 'Rolling release (alfa)', pkg: 'moss', init: 'systemd', des: ['GNOME'], site: 'https://aerynos.com', also: [['solus', 'Do mesmo criador do Solus']] },
  { id: 'clearlinux', name: 'Clear Linux', parent: 'indep', year: 2015, by: 'Intel', logo: 'si:intel', cats: ['desktop', 'server'], discontinued: 2025, desc: 'A distro da Intel, famosa por ser uma das mais rápidas nos testes de desempenho. A Intel encerrou o projeto em 2025.', pkg: 'swupd', init: 'systemd', site: 'https://www.clearlinux.org' },
  { id: 'lindows', name: 'Lindows', parent: 'debian', year: 2001, by: 'Michael Robertson', logo: 'vec:window', cats: ['desktop'], discontinued: 2004, desc: 'Distro comercial que tentava imitar o Windows. Por causa do nome, foi processada pela Microsoft e virou Linspire em 2004.', pkg: 'APT (.deb)' },
  { id: 'linspire', name: 'Linspire', parent: 'lindows', year: 2004, by: 'Linspire / PC/OpenSystems', logo: 'vec:window', cats: ['desktop'], quiz: false, desc: 'O novo nome do Lindows. Foi descontinuada em 2008 e voltou em 2017 como uma distro paga baseada no Ubuntu.', pkg: 'APT (.deb)', site: 'https://www.linspirelinux.com', also: [['ubuntu', 'A versão atual é baseada no Ubuntu']] },

  // ================= Desktop Environments =================
  {
    id: 'de', name: 'Desktop Environments', parent: 'sistema', kind: 'hub', logo: 'vec:window', childrenLabel: 'Ambientes',
    desc: 'O ambiente gráfico é tudo que você vê e toca: barra de tarefas, menus, janelas, área de trabalho e os aplicativos básicos. No Linux ele é uma peça separada do sistema: a mesma distro pode vir com vários, e você pode trocar quando quiser.',
  },
  {
    id: 'gnome', name: 'GNOME', parent: 'de', year: 1999, by: 'GNOME Project',
    desc: 'Moderno e minimalista, com fluxo próprio: em vez de menu iniciar, um painel de atividades que mostra janelas e busca tudo. É o padrão das distros mais populares.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'Wayland (sessão X11 sendo aposentada)'], ['Memória', 'Alta (~800 MB+)'], ['Estilo', 'Moderno, focado em gestos e busca']],
    ease: 4, config: 2, terminal: 2, for: 'Quem quer algo moderno e organizado sem precisar configurar',
    seenIn: ['ubuntu', 'fedora', 'debian', 'rhel', 'rocky', 'tails', 'zorin', 'xubuntu'], site: 'https://www.gnome.org',
  },
  {
    id: 'kde', name: 'KDE Plasma', parent: 'de', year: 1996, by: 'KDE',
    desc: 'O mais personalizável de todos: dá para deixá-lo parecido com o Windows, o macOS ou algo totalmente seu. Cheio de recursos e, apesar disso, eficiente.',
    facts: [['Toolkit', 'Qt'], ['Protocolo', 'Wayland (X11 ainda suportado)'], ['Memória', 'Moderada (~500–700 MB)'], ['Estilo', 'Tradicional, parecido com o Windows por padrão']],
    ease: 4, config: 2, terminal: 1, for: 'Quem gosta de personalizar e de ter recursos à mão',
    seenIn: ['kubuntu', 'steamos', 'garuda', 'cachyos', 'nobara', 'bazzite', 'leap', 'tumbleweed', 'regata', 'biglinux', 'manjaro', 'pclinuxos'], site: 'https://kde.org/plasma-desktop/',
  },
  {
    id: 'xfce', name: 'XFCE', parent: 'de', year: 1996, by: 'Olivier Fourdan / comunidade',
    desc: 'Leve, estável e tradicional. Não tem efeitos chamativos, mas faz tudo que precisa e roda bem em computadores mais modestos.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'X11 (Wayland em desenvolvimento)'], ['Memória', 'Baixa (~300–500 MB)'], ['Estilo', 'Clássico, painel e menu']],
    ease: 4, config: 2, terminal: 2, for: 'PCs antigos e quem prioriza leveza',
    seenIn: ['xubuntu', 'mx', 'kali', 'devuan', 'manjaro', 'void'], site: 'https://www.xfce.org',
  },
  {
    id: 'cinnamon', name: 'Cinnamon', parent: 'de', year: 2011, by: 'Linux Mint',
    desc: 'Criado pelo Linux Mint para ser familiar a quem vem do Windows: menu iniciar, barra de tarefas e bandeja no lugar de sempre.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'X11 (Wayland experimental)'], ['Memória', 'Moderada (~400–600 MB)'], ['Estilo', 'Parecido com o Windows']],
    ease: 5, config: 1, terminal: 1, for: 'Iniciantes e ex-usuários do Windows',
    seenIn: ['mint'], site: 'https://projects.linuxmint.com/cinnamon/',
  },
  {
    id: 'mate', name: 'MATE', parent: 'de', year: 2011, by: 'Comunidade (fork do GNOME 2)',
    desc: 'Continuação do GNOME 2, o visual clássico que muita gente usou nos anos 2000. Leve, estável e sem surpresas.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'X11 (Wayland parcial)'], ['Memória', 'Moderada (~400–600 MB)'], ['Estilo', 'Clássico, dois painéis']],
    ease: 4, config: 2, terminal: 2, for: 'Quem gosta do visual clássico',
    seenIn: ['ubuntumate', 'parrot'], site: 'https://mate-desktop.org',
  },
  {
    id: 'lxqt', name: 'LXQt', parent: 'de', year: 2013, by: 'Comunidade (LXDE + Razor-qt)',
    desc: 'Um dos ambientes completos mais leves que existem, modular e simples. Ótimo para netbooks e máquinas muito fracas.',
    facts: [['Toolkit', 'Qt'], ['Protocolo', 'X11 e Wayland'], ['Memória', 'Muito baixa (~200–400 MB)'], ['Estilo', 'Clássico, minimalista']],
    ease: 4, config: 2, terminal: 2, for: 'PCs muito fracos',
    seenIn: ['lubuntu'], site: 'https://lxqt-project.org',
  },
  {
    id: 'budgie', name: 'Budgie', parent: 'de', year: 2013, by: 'Buddies of Budgie (nasceu no Solus)',
    desc: 'Moderno e limpo, com um painel lateral de notificações e widgets. Bonito sem ser complicado.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'Migrando de X11 para Wayland'], ['Memória', 'Moderada (~500–700 MB)'], ['Estilo', 'Moderno e simples']],
    ease: 4, config: 2, terminal: 2, for: 'Quem quer algo bonito e simples',
    seenIn: ['solus'], site: 'https://buddiesofbudgie.org',
  },
  {
    id: 'pantheon', name: 'Pantheon', parent: 'de', year: 2011, by: 'elementary, Inc.',
    desc: 'O ambiente do elementary OS, inspirado no macOS: dock embaixo, barra fina no topo e aplicativos com visual muito consistente.',
    facts: [['Toolkit', 'GTK'], ['Protocolo', 'X11 (Wayland em testes)'], ['Memória', 'Moderada'], ['Estilo', 'Inspirado no macOS']],
    ease: 5, config: 1, terminal: 1, for: 'Quem gosta do estilo Apple',
    seenIn: ['elementary'], site: 'https://elementary.io',
  },
  {
    id: 'cosmic', name: 'COSMIC', parent: 'de', year: 2024, by: 'System76',
    desc: 'Ambiente novo, escrito do zero em Rust, com tiling (janelas lado a lado) opcional e feito só para Wayland.',
    facts: [['Toolkit', 'iced (Rust)'], ['Protocolo', 'Somente Wayland'], ['Memória', 'Moderada'], ['Estilo', 'Moderno, com tiling opcional']],
    ease: 4, config: 2, terminal: 2, for: 'Quem quer algo moderno e produtivo',
    seenIn: ['popos'], site: 'https://system76.com/cosmic',
  },
  {
    id: 'dde', name: 'DDE', parent: 'de', year: 2011, by: 'Deepin Technology',
    desc: 'O Deepin Desktop Environment, conhecido como um dos visuais mais polidos do Linux, com dock e centro de controle elegantes.',
    facts: [['Toolkit', 'Qt'], ['Protocolo', 'X11 (Wayland em desenvolvimento)'], ['Memória', 'Moderada a alta'], ['Estilo', 'Moderno, com dock']],
    ease: 4, config: 1, terminal: 1, for: 'Quem quer um visual moderno e caprichado',
    seenIn: ['deepin'], site: 'https://www.deepin.org/en/dde/',
  },
  {
    id: 'wm', name: 'Gerenciadores de janela', parent: 'de', kind: 'group', childrenLabel: 'Gerenciadores',
    desc: 'Mais leves e minimalistas que um ambiente completo: só cuidam das janelas, e o resto (barra, menus, atalhos) você monta. Os de "tiling" organizam as janelas lado a lado automaticamente e são usados quase todo pelo teclado.',
  },
  {
    id: 'i3', name: 'i3wm', parent: 'wm', year: 2009, by: 'Michael Stapelberg',
    desc: 'O tiling clássico: janelas lado a lado, tudo pelo teclado, configuração num arquivo de texto simples.',
    facts: [['Tipo', 'Tiling (lado a lado)'], ['Protocolo', 'X11'], ['Memória', 'Muito baixa (<200 MB)'], ['Configuração', 'Arquivo de texto']],
    ease: 1, config: 5, terminal: 5, for: 'Usuários avançados que querem produtividade', site: 'https://i3wm.org',
  },
  {
    id: 'sway', name: 'Sway', parent: 'wm', year: 2016, by: 'Drew DeVault / comunidade',
    desc: 'O "i3 do Wayland": usa a mesma configuração e os mesmos atalhos, mas no protocolo moderno.',
    facts: [['Tipo', 'Tiling (lado a lado)'], ['Protocolo', 'Wayland'], ['Memória', 'Muito baixa (<200 MB)'], ['Configuração', 'Compatível com a do i3']],
    ease: 1, config: 5, terminal: 5, for: 'Fãs do i3 que querem Wayland', site: 'https://swaywm.org',
  },
  {
    id: 'hyprland', name: 'Hyprland', parent: 'wm', year: 2022, by: 'Vaxry / comunidade',
    desc: 'Tiling dinâmico com animações suaves, cantos arredondados e desfoque. O queridinho de quem gosta de deixar a tela bonita.',
    facts: [['Tipo', 'Tiling dinâmico'], ['Protocolo', 'Wayland'], ['Memória', 'Baixa (~200–400 MB)'], ['Configuração', 'Arquivo de texto']],
    ease: 1, config: 5, terminal: 5, for: 'Avançados que querem estilo e desempenho', site: 'https://hyprland.org',
  },
  {
    id: 'openbox', name: 'Openbox', parent: 'wm', year: 2002, by: 'Dana Jansens / comunidade',
    desc: 'Flutuante (janelas soltas, como no Windows), levíssimo e com menu ao clicar com o botão direito na área de trabalho.',
    facts: [['Tipo', 'Flutuante'], ['Protocolo', 'X11'], ['Memória', 'Muito baixa'], ['Configuração', 'Arquivos XML']],
    ease: 2, config: 4, terminal: 3, for: 'PCs fracos e quem gosta de montar o próprio ambiente', site: 'http://openbox.org',
  },
  {
    id: 'fluxbox', name: 'Fluxbox', parent: 'wm', year: 2001, by: 'Comunidade',
    desc: 'Flutuante e minúsculo, com abas de janelas e barra simples. Muito usado em sistemas leves.',
    facts: [['Tipo', 'Flutuante, com abas'], ['Protocolo', 'X11'], ['Memória', 'Muito baixa'], ['Configuração', 'Arquivos de texto']],
    ease: 2, config: 4, terminal: 3, for: 'Máquinas antigas', seenIn: ['antix', 'mx'], site: 'http://fluxbox.org',
  },
  {
    id: 'icewm', name: 'IceWM', parent: 'wm', year: 1997, by: 'Marko Maček / comunidade',
    desc: 'Flutuante, rapidíssimo e com barra de tarefas no estilo do Windows antigo. Familiar logo de cara.',
    facts: [['Tipo', 'Flutuante'], ['Protocolo', 'X11'], ['Memória', 'Muito baixa'], ['Configuração', 'Arquivos de texto']],
    ease: 3, config: 3, terminal: 2, for: 'Máquinas muito antigas', seenIn: ['antix'], site: 'https://ice-wm.org',
  },

  // ================= Protocolos gráficos =================
  {
    id: 'display', name: 'Protocolos gráficos', parent: 'sistema', kind: 'hub', logo: 'vec:monitor', childrenLabel: 'Protocolos',
    desc: 'A camada que liga os programas à tela: desenha as janelas e entrega teclado e mouse para o aplicativo certo. Hoje existem dois: o veterano X11 e o moderno Wayland. Na maioria das distros você nem precisa escolher.',
  },
  {
    id: 'x11', name: 'X11', parent: 'display', year: 1984, by: 'MIT (Projeto Athena)',
    desc: 'O X Window System, criado nos anos 80, rodou praticamente todo desktop Linux por décadas. Funciona com tudo, mas carrega muita coisa antiga e tem limitações de segurança: qualquer programa consegue ver o que acontece nas outras janelas.',
    facts: [['Servidor', 'X.Org'], ['Situação', 'Legado, sendo substituído'], ['Segurança', 'Apps podem ler outras janelas'], ['Compatibilidade', 'Total, inclusive programas antigos'], ['Gravação de tela', 'Funciona com tudo'], ['Drivers NVIDIA', 'Funciona com qualquer driver']],
    for: 'Programas antigos, alguns casos de acesso remoto e drivers antigos', site: 'https://www.x.org',
  },
  {
    id: 'wayland', name: 'Wayland', parent: 'display', year: 2008, by: 'Kristian Høgsberg / freedesktop.org',
    desc: 'O sucessor do X11: mais simples, mais seguro (cada aplicativo fica isolado) e com imagem mais fluida, sem cortes. Já é o padrão no GNOME, no KDE e nas principais distros.',
    facts: [['Compositor', 'Cada interface tem o seu (Mutter, KWin, Sway…)'], ['Situação', 'Padrão atual'], ['Segurança', 'Cada app isolado'], ['Compatibilidade', 'Apps antigos rodam via XWayland'], ['Gravação de tela', 'Via PipeWire e portais'], ['Drivers NVIDIA', 'Bom com drivers recentes (525+)']],
    for: 'Praticamente todo mundo hoje', site: 'https://wayland.freedesktop.org',
  },
  {
    id: 'xwayland', name: 'XWayland', parent: 'wayland', year: 2014, by: 'freedesktop.org',
    desc: 'Uma ponte: roda programas feitos para o X11 dentro de uma sessão Wayland, sem você perceber. É por causa dele que a troca para o Wayland foi quase invisível.',
    facts: [['Função', 'Rodar apps X11 no Wayland'], ['Instalação', 'Já vem nas distros com Wayland']],
    for: 'Quem usa Wayland e ainda tem programas antigos', site: 'https://wayland.freedesktop.org/xserver.html',
  },
];

// Converte um nome como aparece no site ("Linux Mint (Cinnamon)", "Fedora Sway", "Gentoo Testing") no id da Wiki.
const norm = (s: string) => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z0-9!_ ]/g, ' ').replace(/\s+/g, ' ').trim();
const ALIASES: Record<string, string> = {
  void: 'void', lfs: 'lfs', arch: 'arch', kali: 'kali', 'debian stable': 'debian', 'debian netinst': 'debian',
  'gentoo testing': 'gentoo', 'garuda linux': 'garuda', garuda: 'garuda', 'antix linux': 'antix', alpine: 'alpine', 'red hat': 'rhel',
};
// categorias das distros que já existiam; quem tem perfil e não está aqui é 'desktop'
const CAT_OF: Record<string, Cat[]> = {
  debian: ['desktop', 'server'], ubuntu: ['desktop', 'server'], opensuse: ['desktop', 'server'], fedora: ['desktop', 'server'], leap: ['desktop', 'server'],
  rhel: ['server'], rocky: ['server'], alpine: ['server', 'embedded'], nixos: ['desktop', 'server'],
  kali: ['desktop', 'security'], parrot: ['desktop', 'security'], tails: ['desktop', 'security'], qubes: ['desktop', 'security'],
  blackarch: ['desktop', 'security'], steamos: ['desktop', 'gaming'], chimeraos: ['desktop', 'gaming'], bazzite: ['desktop', 'gaming'],
  nobara: ['desktop', 'gaming'], garuda: ['desktop', 'gaming'], cachyos: ['desktop', 'gaming'], regata: ['desktop', 'gaming'],
};
for (const n of wiki) n.cats ??= CAT_OF[n.id] ?? (n.profile ? ['desktop'] : undefined);

// é uma distro (comparável), e não SISTEMA, conceito (Linux, GNU…), grupo, interface ou protocolo
export const isDistro = (n: WikiNode) => !n.kind && !n.facts && !!n.cats?.length;
// entra no Teste de Afinidade: PC para o dia a dia, ativa, com perfil
export const inQuiz = (n: WikiNode) => !!n.profile && !!n.cats?.includes('desktop') && !n.discontinued && n.quiz !== false;

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
