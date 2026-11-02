// Quiz no formato do Distrochooser: cada resposta gera critérios avaliados contra o perfil de cada distro.
// Cada critério devolve um valor de -1 (diverge) a +1 (combina) e um motivo, que aparece no resultado.
// Facilidade, configuração e terminal vêm da Wiki (wiki.ts); o restante do perfil está em `traits`.

import { wiki, inQuiz, type WikiNode, type Profile } from './wiki';

// os perfis ficam em cada distro da Wiki (campo `profile`): adicionar uma distro é editar um lugar só
export type Traits = Profile;
export const traits: Record<string, Traits> = Object.fromEntries(
  // só distros de PC para o dia a dia (sem servidores, celulares, descontinuadas…): ver inQuiz em wiki.ts
  wiki.filter(inQuiz).map((n) => [n.id, n.profile!]),
);

export interface Candidate { node: WikiNode; t: Traits }
export const candidates: Candidate[] = wiki.filter((n) => traits[n.id]).map((n) => ({ node: n, t: traits[n.id] }));

/* ---------- Regras ---------- */
export interface Verdict { v: number; text: string; w?: number }
type Rule = (c: Candidate) => Verdict | null;

const clamp = (v: number) => Math.max(-1, Math.min(1, v));
// escolhe o texto pelo sinal: a favor quando combina, contra quando diverge
const r = (v: number, pro: string, con: string, w = 1): Verdict => ({ v: clamp(v), text: v >= 0 ? pro : con, w });
const ease = (c: Candidate) => c.node.ease ?? 3;
const config = (c: Candidate) => c.node.config ?? 3;
const terminal = (c: Candidate) => c.node.terminal ?? 3;

export interface QuizOption { text: string; rules: Rule[] }
export interface QuizQuestion { text: string; help?: string; options: QuizOption[] }

export const questions: QuizQuestion[] = [
  {
    text: 'Você já usou Linux antes?',
    options: [
      { text: 'Nunca, vou começar agora', rules: [
        (c) => r((ease(c) - 3.2) / 1.8, 'Fácil de usar, ótima para começar', 'Difícil para quem nunca usou Linux', 1.5),
        (c) => r(c.t.docs - 1, 'Comunidade grande para tirar dúvidas', 'Pouca documentação para quem está começando', 0.6),
      ] },
      { text: 'Já testei um pouco', rules: [
        (c) => r((ease(c) - 2.5) / 2, 'Fácil o bastante para o seu nível', 'Pode exigir mais experiência do que você tem', 1.2),
        (c) => r(c.t.docs - 0.8, 'Boa documentação para quando travar', 'Documentação mais escassa', 0.5),
      ] },
      { text: 'Uso no dia a dia', rules: [
        (c) => r(ease(c) >= 2 ? 0.5 : -0.4, 'Equilíbrio bom entre praticidade e controle', 'Exige bastante conhecimento técnico', 0.6),
      ] },
      { text: 'Conheço bem e quero um desafio', rules: [
        (c) => r((config(c) - 3) / 2, 'Dá controle total e muito para aprender', 'Simples demais para quem quer se aprofundar', 1.3),
      ] },
    ],
  },
  {
    text: 'O terminal, aquela tela onde se digitam comandos, para você é…',
    help: 'Em toda distro dá para usar o terminal. A diferença é o quanto você vai precisar dele.',
    options: [
      { text: 'Algo que eu quero evitar', rules: [
        (c) => r(terminal(c) <= 2 ? 1 : -(terminal(c) - 2) / 2, 'Quase tudo se faz com cliques', 'Vai exigir terminal com frequência', 1.4),
      ] },
      { text: 'Uso se tiver um tutorial', rules: [
        (c) => r(terminal(c) <= 3 ? 0.8 : -(terminal(c) - 3) / 2, 'Pouco terminal no dia a dia', 'O terminal é usado o tempo todo'),
      ] },
      { text: 'Uso sem problemas, até gosto', rules: [
        // só soma pontos: quem gosta de terminal também se vira bem nas outras
        (c) => (terminal(c) >= 4 ? r(1, 'O terminal é parte central da experiência', '', 0.6) : null),
      ] },
    ],
  },
  {
    text: 'Para que você mais vai usar o computador?',
    options: [
      { text: 'Internet, estudos, trabalho de escritório', rules: [
        (c) => r(c.t.uses.includes('desktop') ? 1 : c.t.uses.some((u) => u === 'server' || u === 'security') ? -1 : -0.3, 'Pensada para o uso pessoal do dia a dia', 'Não é focada em uso pessoal', 1.3),
      ] },
      { text: 'Jogos', rules: [
        (c) => r(c.t.gaming - 1, 'Preparada para jogos (Steam, Proton, drivers)', 'Não é pensada para jogos', 1.6),
      ] },
      { text: 'Programação', rules: [
        (c) => r(c.t.uses.includes('dev') ? 1 : c.t.uses.includes('desktop') ? 0.2 : -0.3, 'Muito usada por desenvolvedores', 'Menos prática para programar', 1.2),
      ] },
      { text: 'Edição de foto, vídeo ou música', rules: [
        (c) => r(c.t.uses.includes('creative') ? 1 : c.t.nonfree === 2 && c.t.uses.includes('desktop') ? 0.4 : -0.3, 'Boa para criação de conteúdo', 'Pode faltar codecs ou programas de criação', 1.2),
      ] },
      { text: 'Servidor (sites, arquivos, serviços)', rules: [
        (c) => r(c.t.uses.includes('server') ? 1 : -0.6, 'Feita para servidores', 'Não é a melhor escolha para servidor', 1.5),
      ] },
      { text: 'Segurança e hacking ético', rules: [
        (c) => r(c.t.uses.includes('security') ? 1 : -0.8, 'Vem com ferramentas de segurança', 'Não traz ferramentas de segurança', 1.6),
      ] },
    ],
  },
  {
    text: 'Como é o computador onde você vai instalar?',
    options: [
      { text: 'Novo ou potente', rules: [] },
      { text: 'Intermediário, de alguns anos atrás', rules: [
        (c) => r(c.t.uses.includes('privacy') && c.t.uses.includes('security') ? -1 : c.t.old >= 1 ? 0.5 : 0.2, 'Roda bem em máquinas medianas', 'Exige um computador potente'),
      ] },
      { text: 'Antigo, com uns 4 GB de memória', rules: [
        (c) => r(c.t.old - 1, 'Leve, roda bem em PC antigo', 'Pesada para um computador antigo', 1.5),
      ] },
      { text: 'Muito antigo, 2 GB de memória ou menos', rules: [
        (c) => r(c.t.old === 2 ? 1 : c.t.old === 1 ? -0.5 : -1, 'Extremamente leve, feita para máquinas fracas', 'Pesada demais para esse computador', 2),
      ] },
    ],
  },
  {
    text: 'Seu computador tem placa de vídeo NVIDIA?',
    help: 'Você encontra essa informação nas configurações do sistema ou num adesivo do notebook.',
    options: [
      { text: 'Sim', rules: [
        (c) => r(c.t.nvidia - 1, 'Driver NVIDIA pronto ou fácil de instalar', 'Placas NVIDIA podem dar trabalho aqui', 1.2),
      ] },
      { text: 'Não', rules: [] },
      { text: 'Não sei', rules: [
        (c) => (c.t.nvidia === 2 ? r(0.5, 'Se tiver NVIDIA, o driver já vem pronto', '', 0.4) : null),
      ] },
    ],
  },
  {
    text: 'Qual visual deixa você mais à vontade?',
    options: [
      { text: 'Parecido com o Windows', rules: [
        (c) => r(c.t.look === 'windows' ? 1 : c.t.look === 'any' ? 0.2 : -0.5, 'Visual familiar para quem vem do Windows', 'Visual bem diferente do Windows'),
      ] },
      { text: 'Parecido com o macOS', rules: [
        (c) => r(c.t.look === 'mac' ? 1 : c.t.look === 'any' ? 0.2 : -0.5, 'Visual inspirado no macOS', 'Visual diferente do macOS'),
      ] },
      { text: 'Algo diferente e moderno', rules: [
        (c) => r(c.t.look === 'own' ? 1 : c.t.look === 'custom' ? 0.4 : -0.3, 'Interface própria e moderna', 'Visual tradicional', 0.8),
      ] },
      { text: 'Tanto faz', rules: [] },
    ],
  },
  {
    text: 'Como você prefere receber atualizações?',
    options: [
      { text: 'Poucas e bem testadas, priorizando estabilidade', rules: [
        (c) => r({ fixed: 1, immutable: 0.7, live: 0, rolling: -0.6, source: -0.8 }[c.t.release], 'Versões estáveis e testadas', 'Atualiza com frequência, e mudanças podem pegar você de surpresa'),
      ] },
      { text: 'Sempre a versão mais nova de tudo', rules: [
        (c) => r({ rolling: 1, source: 0.6, immutable: 0.2, live: -0.2, fixed: -0.6 }[c.t.release], 'Sempre com as versões mais novas (rolling release)', 'Os programas ficam algumas versões atrás'),
      ] },
      { text: 'Que o sistema cuide disso sozinho e nunca quebre', rules: [
        (c) => r({ immutable: 1, fixed: 0.5, live: 0, rolling: -0.6, source: -1 }[c.t.release], 'Atualizações automáticas e difíceis de quebrar', 'Atualizações exigem mais atenção', 1.2),
      ] },
      { text: 'Tanto faz', rules: [] },
    ],
  },
  {
    text: 'O quanto você quer personalizar o sistema?',
    options: [
      { text: 'Quero que já venha pronto', rules: [
        (c) => r(config(c) <= 2 ? 1 : config(c) === 3 ? 0 : -1, 'Funciona assim que termina de instalar', 'Você vai precisar montar e configurar bastante'),
      ] },
      { text: 'Um pouco: tema, ícones, papel de parede', rules: [
        (c) => r(c.t.custom >= 1 ? 0.7 : -0.4, 'Fácil de deixar com a sua cara', 'Pouco espaço para personalizar', 0.7),
      ] },
      { text: 'Tudo, até o último detalhe', rules: [
        (c) => r(c.t.custom - 1, 'Personalização sem limites', 'Personalização limitada'),
      ] },
    ],
  },
  {
    text: 'Programas fechados (driver da NVIDIA, Steam, codecs de vídeo) são…',
    help: 'Software livre é aquele cujo código qualquer pessoa pode ver e modificar. Algumas distros só trazem software livre por padrão.',
    options: [
      { text: 'Tudo bem, quero que tudo funcione', rules: [
        (c) => r(c.t.nonfree - 1.2, 'Drivers e codecs fechados já vêm prontos', 'Drivers e codecs fechados precisam ser instalados à parte'),
      ] },
      { text: 'Prefiro livres, mas aceito se precisar', rules: [
        (c) => r(c.t.nonfree === 1 ? 1 : c.t.nonfree === 0 ? 0.5 : 0.2, 'Prioriza software livre sem impedir o resto', '', 0.6),
      ] },
      { text: 'Só quero software livre', rules: [
        (c) => r(1 - c.t.nonfree, 'Foco em software livre', 'Vem com bastante software fechado'),
      ] },
    ],
  },
  {
    text: 'Privacidade, para você, é…',
    options: [
      { text: 'Não é algo que me preocupa', rules: [] },
      { text: 'Importante: não quero o sistema coletando meus dados', rules: [
        (c) => r(c.t.telemetry ? -1 : c.t.privacy === 2 ? 1 : 0.6, 'Não coleta dados de uso', 'Coleta dados de uso (dá para desativar)'),
      ] },
      { text: 'Prioridade máxima, quero anonimato', rules: [
        (c) => r(c.t.privacy === 2 ? 1 : c.t.telemetry ? -1 : -0.6, 'Feita para privacidade e anonimato', 'Não tem foco em anonimato', 2.4),
      ] },
    ],
  },
  {
    text: 'Você usa bancos brasileiros e serviços do governo (gov.br) pelo computador?',
    help: 'Alguns bancos pedem módulos de segurança que dão trabalho no Linux.',
    options: [
      { text: 'Sim, com frequência', rules: [
        (c) => r(c.t.br ? 1 : -0.3, 'Boa compatibilidade com bancos e gov.br', 'Pode exigir ajustes para os módulos dos bancos', 1.2),
      ] },
      { text: 'De vez em quando', rules: [
        (c) => (c.t.br ? r(0.8, 'Boa compatibilidade com bancos e gov.br', '', 0.5) : null),
      ] },
      { text: 'Não uso', rules: [] },
    ],
  },
  {
    text: 'O que você acha do systemd?',
    help: 'O systemd é o programa que liga o sistema e gerencia os serviços em segundo plano. A maioria das distros usa, mas parte da comunidade prefere alternativas mais simples.',
    options: [
      { text: 'Não sei o que é / tanto faz', rules: [] },
      { text: 'Prefiro distros sem systemd', rules: [
        (c) => r(c.t.systemd === false ? 1 : c.t.systemd === 'both' ? 0.6 : -1, 'Não usa systemd', 'Usa systemd', 1.2),
      ] },
      { text: 'Prefiro com systemd', rules: [
        (c) => r(c.t.systemd === true ? 1 : c.t.systemd === 'both' ? 0.3 : -0.8, 'Usa systemd, o padrão da maioria', 'Não usa systemd, e alguns tutoriais não vão servir', 0.8),
      ] },
    ],
  },
];

/* ---------- Pontuação ---------- */
export interface Answer { option: number; important: boolean }
export interface Reason { text: string; weight: number }
export interface Match { c: Candidate; pct: number; pros: Reason[]; cons: Reason[] }

export function rank(answers: (Answer | null)[]): Match[] {
  return candidates
    .map((c) => {
      let sum = 0, total = 0;
      const pros = new Map<string, number>(), cons = new Map<string, number>();
      answers.forEach((a, qi) => {
        if (!a) return;
        for (const rule of questions[qi].options[a.option].rules) {
          const res = rule(c);
          if (!res || !res.text) continue;
          const w = (res.w ?? 1) * (a.important ? 2.5 : 1);
          sum += w * res.v;
          total += w;
          const list = res.v >= 0.25 ? pros : res.v <= -0.25 ? cons : null;
          if (list) list.set(res.text, Math.max(list.get(res.text) ?? 0, Math.abs(w * res.v)));
        }
      });
      const sorted = (m: Map<string, number>) => [...m].map(([text, weight]) => ({ text, weight })).sort((a, b) => b.weight - a.weight);
      return { c, pct: total ? Math.round(50 + (50 * sum) / total) : 50, pros: sorted(pros), cons: sorted(cons) };
    })
    .sort((a, b) => b.pct - a.pct || (b.c.node.ease ?? 0) - (a.c.node.ease ?? 0));
}
