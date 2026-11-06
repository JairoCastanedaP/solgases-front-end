// Verifica que toda ruta de imagen referenciada en el código fuente (img/...)
// exista en public/. Las imágenes tienen espacios, tildes y extensiones mixtas
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

if (missing.length) {
  console.error(`Faltan ${missing.length} imagen(es) en public/:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}
console.log(`OK: ${checked} referencias de imagen verificadas en public/.`);
