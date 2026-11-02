# DISTRO LINUX

Site estático sobre Linux para iniciantes, em pt-BR e en-US. Produção: <https://distrolinux.com.br>

**Stack:** Astro (saída estática) · TypeScript · WebGL · GSAP + ScrollTrigger · Lenis · Simple Icons · Vitest · Playwright

## Funcionalidades

| Funcionalidade | Técnica |
|---|---|
| **Página inicial** (`/`): painéis com título, frase, botões e ilustração | Ilustrações em CSS/SVG (sem imagens); reveal com GSAP ScrollTrigger; ilustrações seguem o mouse via CSS custom properties |
| **Feed no celular**: uma tela por vez | `<main>` como scroller (`100dvh`, `scroll-snap-type: y mandatory`, `scroll-snap-stop: always`) para a barra do navegador não redimensionar as telas; IntersectionObserver marca a tela ativa |
| **Wiki** (`/wiki`): árvore de ~120 distros em gotas d'água | Shader WebGL de *metaballs* com refração, sombra e ondulação; rótulos e linhas em HTML/SVG sincronizados com a câmera; layout radial com raio de anel calculado por geração |
| Desempenho da Wiki | Culling de gotas fora da tela; modo ocioso (sem redesenho com a cena parada); limite de gotas pelo `MAX_FRAGMENT_UNIFORM_VECTORS`; resolução adaptativa por tempo de quadro e por número de gotas |
| Filtros da Wiki (servidor, celular, jogos…) | Categorias por gota; gotas fora do filtro esmaecidas no shader, as da categoria destacadas |
| **Guia Inicial** (`/distros`): recomendações por perfil, tabela, interfaces, Wayland × X11 | Filtro, busca e ordenação no cliente |
| **Teste de Afinidade** (`/quiz`): 12 perguntas → 5 distros | Pontuação por regras ponderadas (−1 a 1) sobre o perfil de cada distro; resultado guardado no `sessionStorage` até recarregar a página |
| **Comparador** (`/comparar`): até 4 distros lado a lado | `compareTable()` pura, usada no build e no navegador; abas por tipo (desktop, servidor, celular, embarcados) mudam as linhas; lista de distros com busca e teclado; estado na URL (`?t=server&d=debian,rhel`) |
| **Idiomas** | Rotas `/` e `/en/`; `tr()` usa o texto em português como chave; país detectado por `/cdn-cgi/trace` (Cloudflare) no `<head>`; `hreflang` e `og:locale` por página |
| **Doações** | Pix (BR Code estático com CRC16) no Brasil, Buy Me a Coffee fora, decidido pelo país |
| **Tema claro/escuro** | Tokens CSS; transição circular com a View Transitions API; respeita `prefers-reduced-motion` |
| **Prévia de link** (WhatsApp, redes) | Open Graph e Twitter Card por idioma, imagem 1200×630 |

## Dados

Uma entrada por distro em [`src/data/wiki.ts`](src/data/wiki.ts) alimenta a Wiki, o Teste de Afinidade e o Comparador.

- `cats`: categorias (`desktop`, `server`, `mobile`, `embedded`, `security`, `gaming`, `chromebook`)
- `profile`: perfil usado pelo Teste e pelo Comparador; obrigatório em distros de desktop ativas
- `specs`: campos dos tipos Servidor, Celular e Embarcados no Comparador
- `also`: ligações secundárias (linha tracejada na Wiki)
- `discontinued`: ano de fim (fora do Teste e do Comparador)
- `logo`: `si:<slug>` (Simple Icons), `file:<arquivo>` (`public/logos`) ou `vec:<ícone>` ([`logos.ts`](src/data/logos.ts))

Traduções em [`src/i18n/en.ts`](src/i18n/en.ts). Os testes acusam campos faltando e textos sem tradução.

## Estrutura

```
src/
  pages/        rotas (pt e en/), finas
  views/        páginas, recebem `lang`
  components/   Nav, Footer, NextStep, Versus
  data/         wiki, quiz, compare, journey, logos
  scripts/      wiki-engine (WebGL), motion (GSAP/Lenis), feed, compare-render
  i18n/         tr(), detecção de idioma, dicionário en
tests/          Vitest (dados, i18n, quiz, comparador, site gerado)
tests/e2e/      Playwright (iPhone/WebKit, Android/Chromium, Chrome e Firefox no computador)
```

## Comandos

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera dist/
npm test           # Vitest
npm run test:e2e   # Playwright (antes: npx playwright install --with-deps chromium webkit firefox)
```

Versões e mudanças: [CHANGELOG.md](CHANGELOG.md).
