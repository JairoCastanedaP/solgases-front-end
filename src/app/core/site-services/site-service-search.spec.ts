import { SITE_SERVICE_CATALOG } from './site-service-catalog';
import {
  EMPTY_SERVICE_QUERY,
  SERVICE_TOTAL,
  SERVICE_TYPES,
  ServiceQuery,
  isServiceQueryActive,
  parseServiceQuery,
  searchServices,
  toServiceParams,
} from './site-service-search';

const search = (query: Partial<ServiceQuery>) =>
  searchServices({ ...EMPTY_SERVICE_QUERY, ...query });
const params = (values: Record<string, string>) => new URLSearchParams(values);

describe('Búsqueda de servicios', () => {
  it('cubre los 18 servicios; el tipo existe en todos', () => {
    expect(SERVICE_TOTAL).toBe(SITE_SERVICE_CATALOG.services.length);
    expect(search({}).items.every((card) => card.kind)).toBe(true);
    expect(SERVICE_TYPES).toContain('Recarga de extintores');
  });

  it('el orden intercalado es estable y no cambia al filtrar', () => {
    const all = search({}).items.map((c) => c.link);
    const found = search({ q: 'extintor' }).items.map((c) => c.link);

    expect(search({}).items.map((c) => c.link)).toEqual(all);
    expect(search({}).items[0]).toBe(search({}).items[0]);
    expect(found).toEqual(all.filter((link) => found.includes(link)));
  });

  it('exige todas las palabras, sin importar el orden, y trata los símbolos como texto', () => {
    expect(search({ q: 'libras recarga 5' }).items.map((c) => c.slug)).toContain(
      'recarga-extintor-5-libras',
    );
    expect(search({ q: '.*' }).total).toBe(0);
    expect(search({ q: '   ' }).total).toBe(18);
  });

  it('las tarjetas no llevan marca, estrellas ni precio', () => {
    for (const card of search({}).items) {
      expect(card.brand, card.slug).toBeUndefined();
      expect(card.rating, card.slug).toBeUndefined();
      expect(card.note, card.slug).toBeUndefined();
      expect(card.quickView.notice, card.slug).toBeUndefined();
      expect(card.quickView.image, card.slug).toBe(true);
    }
  });

  it('lee la URL e ignora valores desconocidos', () => {
    expect(parseServiceQuery(params({ q: 'x', tipo: 'Alquiler', orden: 'nombre-asc' }))).toEqual({
      q: 'x',
      type: 'Alquiler',
      sort: 'nombre-asc',
    });
    expect(parseServiceQuery(params({ tipo: 'Nada', orden: 'precio-asc' }))).toEqual(
      EMPTY_SERVICE_QUERY,
    );
    expect(parseServiceQuery(params({ q: 'a'.repeat(500) })).q.length).toBe(100);
  });

  it('quita de la URL lo que no filtra y distingue si hay criterios', () => {
    expect(toServiceParams(EMPTY_SERVICE_QUERY)).toEqual({ q: null, tipo: null, orden: null });
    expect(toServiceParams({ ...EMPTY_SERVICE_QUERY, q: 'gas ' }).q).toBe('gas ');
    expect(isServiceQueryActive(EMPTY_SERVICE_QUERY)).toBe(false);
    expect(isServiceQueryActive({ ...EMPTY_SERVICE_QUERY, sort: 'nombre-asc' })).toBe(true);
  });
});
