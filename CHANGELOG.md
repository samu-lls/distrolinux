# Changelog

## v0.3

**SEO**
- Títulos e descrições das páginas reescritos para busca, em português e inglês.
- `sitemap.xml` gerado no build, com as versões pt-BR e en-US ligadas por hreflang.
- `robots.txt` liberando o site e apontando o sitemap.
- Link canônico em todas as páginas (links do Comparador com `?d=` contam como a mesma página).
- Dados estruturados (schema.org): `WebSite` em todo o site; Comparador e Teste de Afinidade como `WebApplication`.

## v0.1

**Página inicial**
- Nova página inicial "O que é o Linux?": sistema operacional para leigos, troca do Windows/Mac, onde o Linux roda, motivos, distros, comparação com o Windows e como começar.
- Painéis no estilo apple.com com ilustrações em vetor; botões "Continuar" e atalho para quem já sabe nos marcos.
- A página "Windows vs Linux" foi incorporada à inicial.
- No celular, feed de telas com encaixe (uma por vez), pontos de progresso e aviso de deslizar.

**Wiki**
- Nova árvore: SISTEMA → Linux / interfaces gráficas / protocolos gráficos; Linux → GNU → famílias; sistemas sem GNU (Android, Alpine, OpenWrt…) direto do Linux.
- 50 gotas novas: servidores, celulares, embarcados, Chromebook, novas distros de desktop e linhagens históricas (Red Hat Linux, Mandrake, Mandriva, SUSE).
- Distros descontinuadas esmaecidas, com ano de fim.
- Filtros por categoria e ligações secundárias tracejadas.
- Logo em todas as gotas.
- Botão "Comparar" na ficha.
- Desempenho: culling, modo ocioso, limite de gotas pela GPU, resolução adaptativa.
- Correção: gotas invisíveis nos primeiros segundos no Firefox.

**Comparador** (novo, `/comparar`)
- Até 4 distros, com tabela por seções, melhor valor destacado, "só diferenças" e link compartilhável.
- Abas Desktop, Servidor, Celular e Embarcados, com linhas próprias e selos de grupo em cada distro.
- Lista de distros com busca, logos e teclado.

**Teste de Afinidade** (antes "Quiz")
- Só distros de PC para o dia a dia.
- Resultado mantido ao ir à Wiki ou ao Comparador e voltar (zera com F5).
- Botão "Comparar" nos resultados.
- Aviso quando as respostas se contradizem.
- Correção: opções sobrepostas no Firefox.

**Site**
- Versão em inglês (`/en/`), com detecção pelo país e seletor PT | EN.
- Navegação em jornada (Início → Guia Inicial → Teste de Afinidade → Comparador → Wiki) com "Próximo passo" ao fim de cada página.
- Doações por Pix no Brasil.
- Revisão para iPhone e Android: barra superior opaca, alvos de toque maiores, campos de busca maiores.
- Testes automatizados: Vitest e Playwright em iPhone, iPhone SE, Android, Chrome e Firefox.

## v0.0

- Site recriado como estático em Astro (substitui o projeto Django).
- Páginas: Windows vs Linux, Escolha sua distro (guia, tabela filtrável, interfaces, Wayland × X11), Wiki (árvore das distros em gotas WebGL, fichas e mascote-guia) e Quiz (12 perguntas, 5 distros mais compatíveis).
- Tema claro/escuro, versão para celular e botão de doações.
- Prévia de link (Open Graph) para WhatsApp e redes sociais.
