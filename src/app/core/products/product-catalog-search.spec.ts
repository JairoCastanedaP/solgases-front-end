import { CatalogItem } from '../../shared/models/catalog-item';
import { PRODUCT_CATALOG } from './product-catalog';
import {
  BRAND_OPTIONS,
  CATALOG_TOTAL,
  CATEGORY_OPTIONS,
  CatalogQuery,
  EMPTY_CATALOG_QUERY,
  SORT_OPTIONS,
  isCatalogQueryActive,
  parseCatalogQuery,
  searchCatalog,
  toCatalogParams,
} from './product-catalog-search';

const search = (query: Partial<CatalogQuery>) =>
  searchCatalog({ ...EMPTY_CATALOG_QUERY, ...query });
const cards = (query: Partial<CatalogQuery>): readonly CatalogItem[] => {
  const { sections, sorted } = search(query);
  return sorted ?? sections.flatMap((section) => section.items);
};
const titles = (query: Partial<CatalogQuery>) => cards(query).map((card) => card.title);
const params = (values: Record<string, string>) => new URLSearchParams(values);

describe('Búsqueda del catálogo de productos', () => {
  describe('sin criterios', () => {
    it('cubre los 94 productos, cada uno una sola vez', () => {
      const links = cards({}).map((card) => card.link);

      expect(CATALOG_TOTAL).toBe(94);
      expect(CATALOG_TOTAL).toBe(PRODUCT_CATALOG.products.length);
      expect(search({}).total).toBe(94);
      expect(new Set(links).size).toBe(94);
    });

    it('agrupa por categoría, con el orden y las anclas del JSON', () => {
      const { sections, sorted } = search({});

      expect(sorted).toBeNull();
      expect(sections.map((s) => s.title)).toEqual(PRODUCT_CATALOG.categories.map((c) => c.name));
      expect(sections[4].id).toBe('guantes');
    });

    it('conserva imagen, texto alternativo y enlace de cada tarjeta', () => {
      const bySlug = new Map(PRODUCT_CATALOG.products.map((p) => [`/productos/${p.slug}`, p]));

      for (const card of cards({})) {
        const product = bySlug.get(card.link!);
        expect(product, card.title).toBeDefined();
        expect(card.image).toBe(product!.image.src);
        expect(card.alt).toBe(product!.image.alt);
      }
    });
  });

  describe('búsqueda de texto', () => {
    it('encuentra por nombre sin distinguir mayúsculas ni tildes', () => {
      expect(titles({ q: 'KONDOR' })).toEqual([
        'Botas Kondor Soldador',
        'Botas Kondor Dieléctricas',
      ]);
      expect(titles({ q: 'dielectricas' })).toContain('Botas Kondor Dieléctricas');
      expect(titles({ q: 'señalización' })).toEqual(titles({ q: 'senalizacion' }));
    });

    it('encuentra por el texto de tarjeta distinto al nombre', () => {
      expect(titles({ q: 'altas temperaturas' })).toContain('Altas temperaturas');
    });

    it('encuentra por descripción, característica y especificación', () => {
      expect(titles({ q: 'puntera y suela en color amarillo' })).toContain(
        'Botas Croydon Argyll Amarillo',
      );
      expect(titles({ q: 'suela con labrado visible' })).toContain('Botas Croydon Argyll Amarillo');
      expect(titles({ q: '7093-C' })).toEqual(['Filtro 3M 7093-C']);
    });

    it('encuentra por categoría, incluida la de un producto que está en dos listas', () => {
      expect(titles({ q: 'bioseguridad' })).toContain('Gel Antibacterial');
    });

    it('exige todas las palabras, en cualquier orden, e ignora los espacios extra', () => {
      expect(titles({ q: '  negra   machita  croydon ' })).toEqual(['Botas Croydon Machita Negra']);
      expect(search({ q: '   ' }).total).toBe(94);
    });

    it('no se activa con frases genéricas de las recomendaciones', () => {
      expect(search({ q: 'revisa la ficha del fabricante' }).total).toBe(0);
    });

    it('trata los caracteres especiales como texto', () => {
      expect(search({ q: '.*' }).total).toBe(0);
      expect(search({ q: '<script>' }).total).toBe(0);
    });
  });

  describe('filtros', () => {
    it('ofrece todas las categorías del JSON', () => {
      expect(CATEGORY_OPTIONS.map((o) => o.value)).toEqual(
        PRODUCT_CATALOG.categories.map((c) => c.id),
      );
    });

    it('la categoría muestra su lista completa, con sus propios textos de tarjeta', () => {
      for (const { id, items } of PRODUCT_CATALOG.categories) {
        expect(search({ category: id }).total, id).toBe(items.length);
      }
      const bioseguridad = titles({ category: 'bioseguridad' });
      expect(bioseguridad).toContain('Gel Antibacterial');
      expect(bioseguridad).toContain('Mascarilla N95');
    });

    it('solo ofrece marcas que aparecen en el nombre de sus productos', () => {
      expect(BRAND_OPTIONS.length).toBe(12);
      for (const brand of BRAND_OPTIONS) {
        const found = titles({ brand });
        expect(found.length, brand).toBeGreaterThan(0);
        for (const title of found) {
          expect(title).toContain(brand);
        }
      }
    });

    it('un producto sin marca sigue en el catálogo y solo sale al filtrar por marca', () => {
      expect(titles({})).toContain('Cono');
      expect(titles({ brand: '3M' })).not.toContain('Cono');
    });

    it('combina búsqueda, categoría y marca', () => {
      expect(titles({ brand: 'Croydon', category: 'calzado-caucho', q: 'machita' })).toEqual([
        'Botas Croydon Machita Azul',
        'Botas Croydon Machita Negra',
      ]);
      expect(search({ brand: 'Workman', q: 'machita' }).total).toBe(0);
      expect(search({ brand: 'Croydon', category: 'gafas' }).total).toBe(0);
    });
  });

  describe('orden', () => {
    const es = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

    it('ordena por nombre en ambos sentidos, en una sola lista', () => {
      const asc = search({ sort: 'nombre-asc' });
      const names = titles({ sort: 'nombre-asc' });

      expect(asc.sections).toEqual([]);
      expect(names.length).toBe(94);
      expect(names).toEqual([...names].sort(es.compare));
      expect(titles({ sort: 'nombre-desc' })).toEqual([...names].reverse());
    });

    it('ordena por precio y desempata por nombre', () => {
      const amounts = (sort: CatalogQuery['sort']) =>
        cards({ sort }).map((card) =>
          Number(card.note!.match(/[\d.]+(?=\s*COP)/)![0].replaceAll('.', '')),
        );

      expect(amounts('precio-asc')).toEqual([...amounts('precio-asc')].sort((a, b) => a - b));
      expect(amounts('precio-desc')).toEqual([...amounts('precio-desc')].sort((a, b) => b - a));
    });

    it('identifica el precio de la tarjeta como ficticio y solo lo muestra al ordenar por precio', () => {
      expect(
        cards({ sort: 'precio-asc' }).every((c) => c.note?.startsWith('Precio ficticio:')),
      ).toBe(true);
      expect(cards({ sort: 'nombre-asc' }).every((c) => c.note === undefined)).toBe(true);
      expect(cards({}).every((c) => c.note === undefined)).toBe(true);
    });

    it('las opciones de precio avisan que es ficticio', () => {
      for (const { value, label } of SORT_OPTIONS) {
        if (value.startsWith('precio')) {
          expect(label).toContain('ficticio');
        }
      }
    });

    it('todos los productos tienen un precio numérico de demostración', () => {
      for (const { name, price } of PRODUCT_CATALOG.products) {
        expect(Number.isFinite(price.amount), name).toBe(true);
        expect(price.isDemo, name).toBe(true);
      }
    });

    it('mantiene los filtros al ordenar', () => {
      const asc = titles({ category: 'caretas', sort: 'nombre-asc' });

      expect(asc.length).toBe(4);
      expect(titles({ category: 'caretas', sort: 'nombre-desc' })).toEqual([...asc].reverse());
    });
  });

  describe('parámetros de la URL', () => {
    it('lee los valores válidos', () => {
      expect(
        parseCatalogQuery(
          params({ q: 'casco', categoria: 'cascos', marca: '3M', orden: 'precio-asc' }),
        ),
      ).toEqual({ q: 'casco', category: 'cascos', brand: '3M', sort: 'precio-asc' });
    });

    it('ignora valores desconocidos y parámetros ajenos', () => {
      expect(
        parseCatalogQuery(
          params({ categoria: 'no-existe', marca: 'Acme', orden: 'azar', utm_source: 'x' }),
        ),
      ).toEqual(EMPTY_CATALOG_QUERY);
    });

    it('limita la longitud del texto', () => {
      expect(parseCatalogQuery(params({ q: 'a'.repeat(500) })).q.length).toBe(100);
    });

    it('quita de la URL lo que no filtra', () => {
      expect(toCatalogParams(EMPTY_CATALOG_QUERY)).toEqual({
        q: null,
        categoria: null,
        marca: null,
        orden: null,
      });
      expect(toCatalogParams({ ...EMPTY_CATALOG_QUERY, q: '   ' }).q).toBeNull();
    });

    it('conserva el espacio final para no borrarlo mientras se escribe', () => {
      expect(toCatalogParams({ ...EMPTY_CATALOG_QUERY, q: 'botas ' }).q).toBe('botas ');
    });

    it('distingue un catálogo con y sin criterios', () => {
      expect(isCatalogQueryActive(EMPTY_CATALOG_QUERY)).toBe(false);
      expect(isCatalogQueryActive({ ...EMPTY_CATALOG_QUERY, q: '  ' })).toBe(false);
      expect(isCatalogQueryActive({ ...EMPTY_CATALOG_QUERY, sort: 'nombre-asc' })).toBe(true);
    });
  });
});
