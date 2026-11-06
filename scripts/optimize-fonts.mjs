// Genera versiones WOFF2 (con subconjunto de caracteres latinos) de las fuentes TTF locales.
// Los TTF originales se conservan como respaldo en @font-face.
// Uso: npm run optimize:fonts
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import subsetFont from 'subset-font';

const fontsDir = new URL('../src/styles/fonts/', import.meta.url).pathname;

// Latín básico + Latin-1 (tildes, ñ, ¿, ¡) + puntuación tipográfica usada en los textos (“ ” – —).
const ranges = [
  [0x20, 0x7e],
  [0xa0, 0xff],
  [0x2013, 0x2014],
  [0x2018, 0x201d],
  [0x2022, 0x2022],
  [0x2026, 0x2026],
  [0x20ac, 0x20ac],
];
const text = ranges
  .flatMap(([from, to]) =>
    Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)),
  )
  .join('');

for (const name of readdirSync(fontsDir).filter((f) => f.endsWith('.ttf'))) {
  const input = join(fontsDir, name);
  const output = input.replace(/\.ttf$/, '.woff2');
  const woff2 = await subsetFont(readFileSync(input), text, { targetFormat: 'woff2' });
  writeFileSync(output, woff2);
  const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
  console.log(`${name}: ${kb(statSync(input).size)} -> ${kb(woff2.length)} (woff2)`);
}
