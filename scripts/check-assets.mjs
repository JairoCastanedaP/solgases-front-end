// Verifica que toda ruta de imagen referenciada en el código fuente (img/...)
// exista en public/ y tenga su versión optimizada (manifiesto de optimize-images.mjs). Las imágenes tienen espacios, tildes y extensiones mixtas
// (.PNG, .jfif), por lo que es fácil romper una ruta al migrar o renombrar.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const sources = [join(root, 'src')];
const publicDir = join(root, 'public');
const pattern = /["'`](img\/[^"'`]+?\.(?:jpe?g|png|gif|webp|jfif|svg))["'`]/gi;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(ts|html)$/.test(name) && !name.endsWith('.spec.ts')) yield path;
  }
}

let checked = 0;
const missing = [];
for (const dir of sources) {
  for (const file of walk(dir)) {
    for (const [, ref] of readFileSync(file, 'utf8').matchAll(pattern)) {
      checked++;
      if (!existsSync(join(publicDir, ref))) missing.push(`${relative(root, file)} -> ${ref}`);
    }
  }
}

// Cada imagen usada debe tener versión optimizada y los archivos del manifiesto deben existir.
const manifestFile = join(root, 'src/app/shared/images/optimized-images.json');
const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
for (const file of walk(join(root, 'src/app'))) {
  for (const [, ref] of readFileSync(file, 'utf8').matchAll(pattern)) {
    if (ref.startsWith('img/og/') || ref.startsWith('img/webp/')) continue;
    if (!manifest[ref]) missing.push(`${relative(root, file)} -> ${ref} (sin versión optimizada)`);
  }
}
let optimized = 0;
for (const [ref, entry] of Object.entries(manifest)) {
  for (const w of entry.widths ?? [null]) {
    const src = w === null ? entry.src : entry.src.replace('{w}', String(w));
    optimized++;
    if (!existsSync(join(publicDir, src))) missing.push(`manifiesto: ${ref} -> ${src}`);
  }
}

if (missing.length) {
  console.error(`Problemas con ${missing.length} imagen(es):\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(
  `OK: ${checked} referencias de imagen y ${optimized} archivos optimizados verificados en public/.`,
);
