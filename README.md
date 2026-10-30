<div align="center">

# DISTRO LINUX

**Um guia bonito, leve e bem-humorado para quem quer sair do Windows e encontrar o Linux certo.**

[Windows vs Linux](#o-que-o-site-oferece) · [Escolha sua distro](#o-que-o-site-oferece) · [Wiki](#o-que-o-site-oferece) · [Quiz](#o-que-o-site-oferece)

</div>

---

## Por que este projeto existe

Quase todo mundo que pensa em experimentar Linux trava na mesma pergunta: **"qual distro eu instalo?"**

Existem centenas. Os nomes não dizem nada para quem está começando (Debian? Arch? Fedora?), os fóruns estão cheios
de opiniões que se contradizem, e boa parte do conteúdo foi escrita por gente técnica para gente técnica.
O resultado é que muita gente desiste antes de começar.

O **DISTRO LINUX** nasceu para resolver isso de um jeito visual e leve:

- explicar, com humor, **por que vale a pena** trocar de sistema;
- mostrar **de onde vem cada distro** e como elas se relacionam;
- ajudar cada pessoa a encontrar **a distro que combina com ela**, em linguagem de gente normal.

Tudo isso num site rápido, sem cadastro, sem anúncios e sem coletar dados de ninguém.

## O que o site oferece

### Windows vs Linux
Uma página cômica comparando os dois sistemas: a atualização do Windows que trava em 99% enquanto o terminal do Linux
termina em segundos, o Candy Crush que vem "de brinde", a conta Microsoft obrigatória, o famoso "Ativar o Windows"…
Argumentos reais, contados de um jeito que faz rir.

### Escolha sua distro
Um guia rápido e organizado, baseado nas recomendações da comunidade brasileira:

- **por perfil**: iniciante, intermediário/avançado e casos especiais (PC fraco, jogos, bancos brasileiros, segurança);
- **tabela completa** de distros, com filtros, busca e ordenação por qualquer coluna;
- **interfaces gráficas** (GNOME, KDE, XFCE…) comparadas por consumo de memória e dificuldade;
- **Wayland ou X11**, explicado sem complicação.

### Wiki: a árvore das distros
Um plano infinito onde cada distro é uma **gota d'água**. Comece pela gota UNIX e clique para ela se dividir nas
grandes famílias (Debian, Arch, Fedora, openSUSE…), e depois em cada distro derivada. As gotas reagem ao mouse como
água de verdade, e cada uma mostra uma ficha com:

- história, base, modelo de atualização e gerenciador de pacotes;
- facilidade de uso, nível de configuração e quanto terminal ela exige;
- interfaces disponíveis, para quem ela é indicada e o link oficial para baixar.

São quase 50 distros, de Ubuntu e Linux Mint até Gentoo, NixOS e Linux From Scratch. Um pinguim-guia no canto da
tela ensina a navegar.

### Quiz: qual distro é a sua?
Doze perguntas simples (pode pular as que não souber) e, no fim, as **cinco distros mais compatíveis** com você,
em porcentagem, mostrando **o que joga a favor e o que joga contra** cada uma, com um atalho para ver a distro na Wiki.

### E mais
- Tema **claro e escuro**, com transição animada.
- Funciona bem no **celular**.
- Respeita quem prefere **menos movimento** na tela (configuração de acessibilidade do sistema).

## Como foi feito

O site é **100% estático**: não tem servidor de aplicação nem banco de dados, só arquivos HTML, CSS e JavaScript.
O quiz roda inteiro no navegador e não salva nada: recarregou a página, recomeçou.

| Ferramenta | Para quê |
|---|---|
| [Astro](https://astro.build) | Monta as páginas e gera o site estático |
| TypeScript | A linguagem de todo o código interativo |
| WebGL (shader próprio) | As gotas d'água da Wiki: refração, reflexos e o efeito de líquido se dividindo (*metaballs*) |
| [GSAP](https://gsap.com) | Animações de rolagem e de entrada |
| [Lenis](https://lenis.darkroom.engineering) | Rolagem suave |
| [Simple Icons](https://simpleicons.org) | Logos oficiais das distros em vetor |

O visual é inspirado no estilo da Apple: minimalista, tipografia grande e efeitos de vidro (*liquid glass*).

## Rodando localmente

Você precisa do [Node.js](https://nodejs.org) 18 ou mais recente.

```bash
git clone https://github.com/samu-lls/distrolinux.git
cd distrolinux
npm install
npm run dev
```

Depois é só abrir **http://localhost:4321**.

Para gerar a versão final, rode `npm run build`. Os arquivos ficam na pasta `dist/` e podem ser servidos por qualquer
servidor web (nginx, Apache, GitHub Pages…).

## Créditos

- O guia da página **Escolha sua distro** foi feito com base num post da comunidade
  [r/linuxbrasil](https://www.reddit.com/r/linuxbrasil/), que infelizmente foi apagado.
- Os logos das distribuições são marcas registradas de seus respectivos donos e aparecem aqui apenas para identificação.
- Tux, o pinguim do Linux, foi criado por Larry Ewing.

## Apoie o projeto

Se o site te ajudou a escolher sua distro, considere pagar um café:
**[buymeacoffee.com/samulls](https://buymeacoffee.com/samulls)** ☕

---

<div align="center">

Feito com software livre por [samu-lls](https://github.com/samu-lls).

</div>
