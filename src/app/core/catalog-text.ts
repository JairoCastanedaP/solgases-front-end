/** Sin mayúsculas ni tildes: "NITRILO" y "dieléctricas" encuentran "Nitrilo" y "Dielectricas". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/** Palabras de una búsqueda: todas deben aparecer, en cualquier orden. */
export function searchWords(query: string): readonly string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean);
}

/** Orden alfabético en español, con los números en su orden natural. */
export const SPANISH_COLLATOR = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

/** Longitud máxima del texto de búsqueda que se acepta desde la URL. */
export const SEARCH_MAX_LENGTH = 100;
