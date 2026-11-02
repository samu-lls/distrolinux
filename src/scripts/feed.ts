// Feed do celular: as seções [data-screen] viram telas inteiras, uma por vez (CSS em global.css).
// Aqui só marcamos a tela ativa (.on, que dispara a entrada do conteúdo), os pontinhos de progresso
// e o aviso de "deslize para cima".

export const FEED_MEDIA = '(max-width: 760px)';

export function feedActive() {
  return document.documentElement.classList.contains('feed') && matchMedia(FEED_MEDIA).matches;
}

export function initFeed(main: HTMLElement) {
  const screens = [...main.querySelectorAll<HTMLElement>('[data-screen]')];
  if (!screens.length) return;

  // numera os itens de cada tela para entrarem um depois do outro
  screens.forEach((s) => s.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el, i) => el.style.setProperty('--i', String(i))));

  const dots = document.createElement('div');
  dots.className = 'feed-dots';
  dots.setAttribute('aria-hidden', 'true');
  dots.innerHTML = screens.map(() => '<i></i>').join('');
  document.body.append(dots);

  const hint = document.createElement('div');
  hint.className = 'feed-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 10l5-5 5 5"/></svg><span>${main.dataset.feedHint ?? ''}</span>`;
  document.body.append(hint);
  main.addEventListener('scroll', () => hint.classList.toggle('gone', main.scrollTop > 40), { passive: true });

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = e.target as HTMLElement;
        // entra quando ocupa mais da metade da tela; sai quando some de vez (assim reanima ao voltar)
        if (e.intersectionRatio >= 0.55) {
          s.classList.add('on');
          const i = screens.indexOf(s);
          dots.querySelectorAll('i').forEach((d, j) => d.classList.toggle('on', j === i));
          // os pontinhos seguem as cores da tela (seções invertidas são escuras no tema claro)
          dots.style.color = getComputedStyle(s).color;
        } else if (!e.isIntersecting) s.classList.remove('on');
      }
    },
    { root: main, threshold: [0, 0.55] },
  );
  screens.forEach((s) => io.observe(s));

  // virar o celular de lado troca o layout (feed ↔ página comum): recomeça do jeito certo
  matchMedia(FEED_MEDIA).addEventListener('change', () => location.reload());
}
