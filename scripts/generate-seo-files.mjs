// Se ejecuta después de `ng build` (ver "build" en package.json):
// - escribe robots.txt y, si el dominio está confirmado, sitemap.xml en el directorio publicable;
// - comprueba que cada página pública se haya prerenderizado con su título y descripción.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildProductSeo } from '../src/app/core/products/product-seo.ts';
import { buildServiceSeo } from '../src/app/core/site-services/site-service-seo.ts';
import { PUBLIC_PAGES } from '../src/app/core/seo/public-pages.ts';
import { buildRobotsTxt, buildSitemapXml } from '../src/app/core/seo/seo-files.ts';
import { SITE_URL } from '../src/app/core/seo/site-url.ts';

const outDir = new URL('../dist/solgases/browser/', import.meta.url).pathname;
if (!existsSync(join(outDir, 'index.html'))) {
  console.error(`No existe ${outDir}index.html: ejecuta primero "ng build".`);
  process.exit(1);
}

const { notice, products } = JSON.parse(
  readFileSync(new URL('../src/app/core/products/products.json', import.meta.url), 'utf8'),
);
const productPages = products.map(buildProductSeo);
const { services } = JSON.parse(
  readFileSync(
    new URL('../src/app/core/site-services/site-services.json', import.meta.url),
    'utf8',
  ),
);
const servicePages = services.map(buildServiceSeo);
const pages = [...Object.values(PUBLIC_PAGES), ...productPages, ...servicePages];

const errors = [];
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const page of pages) {
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
// El detalle debe llegar en el HTML estático (nombre, imagen, descripción y aviso de demostración),
// pero nunca su precio ficticio, que solo se muestra después de cargar en el navegador.
const productFile = (product) => join(outDir, 'productos', product.slug, 'index.html');
for (const product of products) {
  if (!existsSync(productFile(product))) continue; // ya registrado arriba
  const html = readFileSync(productFile(product), 'utf8');
  const expected = {
    nombre: product.name,
    descripción: product.description,
    'texto alternativo': product.image.alt,
    'aviso de demostración': notice,
  };
  for (const [label, text] of Object.entries(expected)) {
    if (!html.includes(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))) {
      errors.push(`/productos/${product.slug}: falta ${label} en el HTML`);
    }
  }
  if (/COP|Precio ficticio de demostración|product-detail__unit"/.test(html)) {
    errors.push(`/productos/${product.slug}: el HTML estático contiene el precio ficticio`);
  }
}
// Lo mismo para los servicios: nombre, imagen, descripción y notas en el HTML estático.
for (const service of services) {
  const file = join(outDir, 'servicios', service.slug, 'index.html');
  if (!existsSync(file)) continue; // ya registrado arriba
  const html = readFileSync(file, 'utf8');
  const texts = [service.name, service.description, service.image.alt, ...(service.notes ?? [])];
  for (const text of texts) {
    if (!html.includes(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'))) {
      errors.push(`/servicios/${service.slug}: falta "${text}" en el HTML`);
    }
  }
}
if (errors.length) {
  console.error(`Prerenderizado incompleto:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}

writeFileSync(join(outDir, 'robots.txt'), buildRobotsTxt(SITE_URL));
if (SITE_URL) {
  const paths = pages.map((p) => p.path);
  writeFileSync(join(outDir, 'sitemap.xml'), buildSitemapXml(SITE_URL, paths));
  console.log(`OK: robots.txt y sitemap.xml (${paths.length} URL) generados para ${SITE_URL}.`);
} else {
  console.warn(
    'AVISO: SITE_URL no está definido (src/app/core/seo/site-url.ts). Se generó robots.txt ' +
      'sin sitemap; no se generan sitemap.xml, URL canónicas ni og:image hasta confirmar el dominio.',
  );
}
console.log(
  `OK: ${pages.length} páginas prerenderizadas con título, descripción y un <h1> ` +
    `(${products.length} de producto y ${services.length} de servicio).`,
);
