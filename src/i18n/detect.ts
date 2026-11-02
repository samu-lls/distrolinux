// Decide o idioma do visitante. A escolha manual (salva) sempre vence; depois vale o país informado pela
// Cloudflare (/cdn-cgi/trace); sem país (ex.: rodando local), usa o idioma do navegador.
// Esta função é serializada no <head> (Base.astro), então precisa ser autocontida.
export function decideLang(o: { stored: string | null; country: string | null; navLang: string | null }): 'pt' | 'en' {
  if (o.stored === 'pt' || o.stored === 'en') return o.stored;
  if (o.country) return o.country.toUpperCase() === 'BR' ? 'pt' : 'en';
  if (o.navLang) return o.navLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  return 'pt';
}

// lê o país da resposta do /cdn-cgi/trace (linhas "chave=valor", ex.: "loc=BR")
export function countryFromTrace(text: string): string | null {
  const m = /^loc=([A-Za-z]{2})$/m.exec(text);
  return m ? m[1].toUpperCase() : null;
}

// Botão de doação: Pix para quem está no Brasil; Buy Me a Coffee para o resto.
// Sem país conhecido, usa o idioma da página (a versão em português é a de quem está no Brasil).
export function donationMethod(country: string | null, lang: 'pt' | 'en'): 'pix' | 'bmc' {
  if (country) return country.toUpperCase() === 'BR' ? 'pix' : 'bmc';
  return lang === 'pt' ? 'pix' : 'bmc';
}
