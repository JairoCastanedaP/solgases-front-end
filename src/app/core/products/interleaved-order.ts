/** Generador pseudoaleatorio con semilla (mulberry32): la misma semilla da siempre la misma serie. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Baraja `list` con una semilla fija y evita dos elementos seguidos del mismo grupo siempre que sea
 * posible. Es determinista a propósito: el servidor y el navegador calculan el mismo orden, así que
 * la hidratación no encuentra diferencias y ninguna detección de cambios vuelve a barajar.
 */
export function interleavedOrder<T>(
  list: readonly T[],
  groupOf: (item: T) => string,
  seed: number,
): T[] {
  const random = seededRandom(seed);
  const buckets = new Map<string, T[]>();
  for (const item of shuffle(list, random)) {
    const group = groupOf(item);
    buckets.set(group, [...(buckets.get(group) ?? []), item]);
  }

  const result: T[] = [];
  let previous: string | undefined;
  for (let left = list.length; left > 0; left--) {
    const open = [...buckets].filter(([, items]) => items.length > 0);
    const allowed = open.filter(([group]) => group !== previous);
    const candidates = allowed.length > 0 ? allowed : open;
    // Un grupo que ocupa casi la mitad de lo que queda debe salir ya, o acabaría con repetidos.
    const urgent = candidates.find(([, items]) => items.length * 2 - 1 >= left);
    const chosen = urgent ?? pickWeighted(candidates, random);
    result.push(chosen[1].pop()!);
    previous = chosen[0];
  }
  return result;
}

/** Elige un grupo con probabilidad proporcional a lo que le queda, para repartirlos por toda la lista. */
function pickWeighted<T>(
  candidates: readonly [string, T[]][],
  random: () => number,
): [string, T[]] {
  const total = candidates.reduce((sum, [, items]) => sum + items.length, 0);
  let point = random() * total;
  for (const candidate of candidates) {
    point -= candidate[1].length;
    if (point < 0) {
      return candidate;
    }
  }
  return candidates[candidates.length - 1];
}
