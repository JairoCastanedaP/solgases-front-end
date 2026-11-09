import { interleavedOrder } from './interleaved-order';

const items = (groups: Record<string, number>) =>
  Object.entries(groups).flatMap(([group, count]) =>
    Array.from({ length: count }, (_, i) => `${group}-${i}`),
  );
const groupOf = (item: string) => item.split('-')[0];

describe('interleavedOrder', () => {
  const list = items({ a: 8, b: 8, c: 4, d: 18 });

  it('devuelve cada elemento exactamente una vez', () => {
    const result = interleavedOrder(list, groupOf, 1);

    expect(result.length).toBe(list.length);
    expect(new Set(result).size).toBe(list.length);
  });

  it('la misma semilla da el mismo orden, sin aleatoriedad externa', () => {
    const random = vi.spyOn(Math, 'random');

    expect(interleavedOrder(list, groupOf, 7)).toEqual(interleavedOrder(list, groupOf, 7));
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });

  it('otra semilla da otro orden', () => {
    expect(interleavedOrder(list, groupOf, 7)).not.toEqual(interleavedOrder(list, groupOf, 8));
  });

  it('no deja dos seguidos del mismo grupo con ninguna semilla, si es posible', () => {
    for (let seed = 0; seed < 200; seed++) {
      const result = interleavedOrder(list, groupOf, seed);
      for (let i = 1; i < result.length; i++) {
        expect(groupOf(result[i]), `semilla ${seed}`).not.toBe(groupOf(result[i - 1]));
      }
    }
  });

  it('un grupo que no se puede intercalar del todo no pierde elementos', () => {
    const result = interleavedOrder(items({ a: 5, b: 1 }), groupOf, 3);

    expect(result.length).toBe(6);
  });
});
