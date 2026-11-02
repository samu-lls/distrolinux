// Mapa do site para os buscadores, gerado no build: cada página nos dois idiomas, ligadas por hreflang.
import type { APIRoute } from 'astro';
import { JOURNEY } from '../data/journey';
import { localePath } from '../i18n';

export const GET: APIRoute = ({ site }) => {
  const url = (lang: 'pt' | 'en', path: string) => new URL(localePath(lang, path), site).href.replace(/([^/])$/, '$1/');
  const today = new Date().toISOString().slice(0, 10);
  const entries = JOURNEY.flatMap(({ href }) =>
    (['pt', 'en'] as const).map((lang) => `  <url>
    <loc>${url(lang, href)}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${url('pt', href)}"/>
    <xhtml:link rel="alternate" hreflang="en-US" href="${url('en', href)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('pt', href)}"/>
  </url>`),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
