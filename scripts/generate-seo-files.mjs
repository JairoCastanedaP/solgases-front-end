// Se ejecuta después de `ng build` (ver "build" en package.json):
// - escribe robots.txt y, si el dominio está confirmado, sitemap.xml en el directorio publicable;
// - comprueba que cada página pública se haya prerenderizado con su título y descripción.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PUBLIC_PAGES } from '../src/app/core/seo/public-pages.ts';
import { buildRobotsTxt, buildSitemapXml } from '../src/app/core/seo/seo-files.ts';
import { SITE_URL } from '../src/app/core/seo/site-url.ts';

const outDir = new URL('../dist/solgases/browser/', import.meta.url).pathname;
if (!existsSync(join(outDir, 'index.html'))) {
  console.error(`No existe ${outDir}index.html: ejecuta primero "ng build".`);
  process.exit(1);
}

const errors = [];
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const page of Object.values(PUBLIC_PAGES)) {
  const file = join(outDir, page.path, 'index.html');
  if (!existsSync(file)) {
    errors.push(`/${page.path}: falta el HTML prerenderizado (${file})`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  if (!html.includes(`<title>${escapeHtml(page.title)}</title>`)) {
    errors.push(`/${page.path}: el HTML no tiene el título esperado`);
  }
  if (!html.includes(`content="${escapeHtml(page.description)}"`)) {
    errors.push(`/${page.path}: el HTML no tiene la descripción esperada`);
  }
  if ((html.match(/<h1[\s>]/g) ?? []).length !== 1) {
    errors.push(`/${page.path}: debe tener exactamente un <h1>`);
  }
}
if (errors.length) {
  console.error(`Prerenderizado incompleto:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

writeFileSync(join(outDir, 'robots.txt'), buildRobotsTxt(SITE_URL));
if (SITE_URL) {
  const paths = Object.values(PUBLIC_PAGES).map((p) => p.path);
  writeFileSync(join(outDir, 'sitemap.xml'), buildSitemapXml(SITE_URL, paths));
  console.log(`OK: robots.txt y sitemap.xml (${paths.length} URL) generados para ${SITE_URL}.`);
} else {
  console.warn(
    'AVISO: SITE_URL no está definido (src/app/core/seo/site-url.ts). Se generó robots.txt ' +
      'sin sitemap; no se generan sitemap.xml, URL canónicas ni og:image hasta confirmar el dominio.',
  );
}
console.log(
  `OK: ${Object.keys(PUBLIC_PAGES).length} páginas prerenderizadas con título, descripción y un <h1>.`,
);
