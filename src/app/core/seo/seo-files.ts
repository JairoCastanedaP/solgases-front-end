/**
 * Contenido de robots.txt y sitemap.xml. Lo usa scripts/generate-seo-files.mjs después del
 * build y lo verifican las pruebas. Sin imports para que Node pueda cargarlo directamente.
 */

/** El script PHP del formulario no es una página: no debe rastrearse ni indexarse. */
export const DISALLOWED_PATHS = ['/php/'] as const;

export function buildRobotsTxt(siteUrl: string | null): string {
  const lines = ['User-agent: *', ...DISALLOWED_PATHS.map((p) => `Disallow: ${p}`)];
  if (siteUrl) {
    lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
  }
  return lines.join('\n') + '\n';
}

/** Sitemap con las páginas públicas. No incluye `lastmod`: no hay fechas fiables. */
export function buildSitemapXml(siteUrl: string, paths: readonly string[]): string {
  const urls = paths.map(
    (path) => `  <url>\n    <loc>${escapeXml(`${siteUrl}/${path}`)}</loc>\n  </url>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
