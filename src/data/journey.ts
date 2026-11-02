// Ordem do site como uma jornada: de quem nunca ouviu falar de sistema operacional até quem quer explorar
// a árvore das distros. A navbar segue esta ordem e cada página termina apontando para a próxima (NextStep).
// Textos em português; tradução em src/i18n/en.ts.

export interface Step {
  href: string;
  label: string; // nome na navbar
  title: string; // chamada no bloco "Próximo passo"
  pitch: string;
}

export const JOURNEY: Step[] = [
  {
    href: '/',
    label: 'Início',
    title: 'O que é o Linux?',
    pitch: 'O que é um sistema operacional, por que trocar e como o Linux se sai contra o Windows.',
  },
  {
    href: '/distros',
    label: 'Guia Inicial',
    title: 'Por onde começar',
    pitch: 'As distros que a comunidade recomenda para cada perfil, numa tabela completa.',
  },
  {
    href: '/quiz',
    label: 'Teste de Afinidade',
    title: 'Descubra a sua distro',
    pitch: 'Doze perguntas simples e as cinco distros que mais combinam com você.',
  },
  {
    href: '/comparar',
    label: 'Comparador',
    title: 'Compare as finalistas',
    pitch: 'Coloque até quatro distros lado a lado antes de decidir.',
  },
  {
    href: '/wiki',
    label: 'Wiki',
    title: 'Explore a árvore das distros',
    pitch: 'De onde vem cada distro e como elas se relacionam.',
  },
];

// passo atual e o seguinte (null no último)
export function stepOf(href: string) {
  const i = JOURNEY.findIndex((s) => s.href === href);
  return { index: i, step: JOURNEY[i], next: i >= 0 && i < JOURNEY.length - 1 ? JOURNEY[i + 1] : null };
}

export const JOURNEY_TEXTS = JOURNEY.flatMap((s) => [s.label, s.title, s.pitch]);
