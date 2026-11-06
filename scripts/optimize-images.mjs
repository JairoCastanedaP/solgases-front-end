// Genera versiones optimizadas (WebP) de las imágenes referenciadas por el sitio y las
// imágenes para compartir (Open Graph). Los originales en public/img NO se modifican.
//
// Salidas:
//   public/img/webp/...                       WebP redimensionados (mismo subdirectorio)
//   public/img/og/<pagina>.jpg                1200×630 para Open Graph / Twitter
//   src/app/shared/images/optimized-images.json  manifiesto: original -> archivo, ancho, alto
//
// Uso: npm run optimize:images   (incremental; --force para regenerar todo)
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const publicDir = join(root, 'public');
const manifestPath = join(root, 'src/app/shared/images/optimized-images.json');
const force = process.argv.includes('--force');

/** Anchos de las variantes de banner (imagen principal, ocupa el 100 % del ancho). */
const BANNER_WIDTHS = [640, 1280, 1920];
/** Imágenes de galería: se ven también ampliadas en el modal. */
const GALLERY_MAX_WIDTH = 1280;
/** Tarjetas, logos y fotos de sección: se muestran a 350–690 px CSS como máximo. */
const DEFAULT_MAX_WIDTH = 800;
const WEBP = { quality: 78, effort: 5 };

/** Imágenes para compartir, recortadas desde imágenes existentes del sitio. */
const OG_IMAGES = {
  'img/og/inicio.jpg': 'img/construction-857143_1280.jpg',
  'img/og/nosotros.jpg': 'img/almacen.jpg',
  'img/og/productos.jpg': 'img/architecture-blur-bright-1329061 (1).jpg',
  'img/og/servicios.jpg': 'img/extintores.jpg',
  'img/og/bioseguridad.jpg': 'img/bioseguridad/coronavirus.jpg',
  'img/og/contacto.jpg': 'img/guantes.jpg',
};

function* sourceFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* sourceFiles(path);
    else if (/\.(ts|html)$/.test(name) && !name.endsWith('.spec.ts')) yield path;
  }
}

// 1. Recolecta las imágenes referenciadas y su tipo de uso.
const refPattern = /["'`](img\/[^"'`]+?\.(?:jpe?g|png|gif|webp|jfif))["'`]/gi;
const bannerPattern = /image="(img\/[^"]+)"/g;
const galleryPattern = /src: '(img\/[^']+)'/g;
const refs = new Set();
const banners = new Set();
const gallery = new Set();
for (const file of sourceFiles(join(root, 'src/app'))) {
  const text = readFileSync(file, 'utf8');
  for (const [, ref] of text.matchAll(refPattern)) {
    if (!ref.startsWith('img/webp/') && !ref.startsWith('img/og/')) refs.add(ref);
  }
  for (const [, ref] of text.matchAll(bannerPattern)) banners.add(ref);
  for (const [, ref] of text.matchAll(galleryPattern)) gallery.add(ref);
}

const webpPath = (ref, suffix = '') =>
  ref.replace(/^img\//, 'img/webp/').replace(/\.[^.]+$/, `${suffix}.webp`);

const isFresh = (out, input) =>
  !force && existsSync(out) && statSync(out).mtimeMs >= statSync(input).mtimeMs;

async function writeWebp(input, outRel, width) {
  const out = join(publicDir, outRel);
  if (!isFresh(out, input)) {
    mkdirSync(dirname(out), { recursive: true });
    await sharp(input, { limitInputPixels: false })
      .rotate() // respeta la orientación EXIF
      .resize({ width, withoutEnlargement: true })
      .webp(WEBP)
      .toFile(out);
  }
  const meta = await sharp(out).metadata();
  return { out, width: meta.width, height: meta.height };
}

// 2. Genera los WebP y el manifiesto.
const manifest = {};
const seen = new Map();
let before = 0;
let after = 0;
for (const ref of [...refs].sort()) {
  const input = join(publicDir, ref);
  if (!existsSync(input)) throw new Error(`No existe ${ref}`);
  const target = webpPath(ref);
  if (seen.has(target)) throw new Error(`Colisión de nombres: ${ref} y ${seen.get(target)}`);
  seen.set(target, ref);
  const original = await sharp(input, { limitInputPixels: false }).metadata();
  before += statSync(input).size;

  if (banners.has(ref)) {
    const widths = [];
    let largest;
    for (const w of BANNER_WIDTHS) {
      const capped = Math.min(w, original.width);
      if (widths.includes(capped)) continue;
      largest = await writeWebp(input, webpPath(ref, `-${capped}`), capped);
      widths.push(capped);
    }
    manifest[ref] = {
      src: webpPath(ref, '-{w}'),
      width: largest.width,
      height: largest.height,
      widths,
    };
    after += statSync(largest.out).size;
    continue;
  }

  const maxWidth = gallery.has(ref) ? GALLERY_MAX_WIDTH : DEFAULT_MAX_WIDTH;
  const result = await writeWebp(input, target, maxWidth);
  // Si el WebP no mejora a un original que ya tiene un tamaño adecuado, se usa el original.
  const keepOriginal =
    original.width <= maxWidth && statSync(result.out).size >= statSync(input).size;
  manifest[ref] = keepOriginal
    ? { src: ref, width: original.width, height: original.height }
    : { src: target, width: result.width, height: result.height };
  after += statSync(keepOriginal ? input : result.out).size;
}

// 3. Imágenes Open Graph (1200×630, recorte centrado).
for (const [outRel, srcRel] of Object.entries(OG_IMAGES)) {
  const input = join(publicDir, srcRel);
  const out = join(publicDir, outRel);
  if (isFresh(out, input)) continue;
  mkdirSync(dirname(out), { recursive: true });
  await sharp(input, { limitInputPixels: false })
    .rotate()
    .resize({ width: 1200, height: 630, fit: 'cover' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(sorted, null, 2) + '\n');

const mb = (n) => (n / 1e6).toFixed(2);
console.log(
  `OK: ${refs.size} imágenes (${banners.size} banners). Originales: ${mb(before)} MB -> ` +
    `optimizadas: ${mb(after)} MB (banners contados en su variante mayor). ` +
    `Manifiesto: ${relative(root, manifestPath)}`,
);
