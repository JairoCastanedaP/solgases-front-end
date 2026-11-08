import { optimizedImage } from '../../shared/images/optimized-image';
import {
  PRODUCT_CATALOG,
  catalogSections,
  findCategory,
  findProductBySlug,
  formatPrice,
  toCatalogItems,
} from './product-catalog';
import { PRODUCT_NOT_FOUND_SEO, buildProductSeo } from './product-seo';

const { products, categories, featured } = PRODUCT_CATALOG;

describe('Catálogo de productos (products.json)', () => {
  it('tiene id y slug únicos, y slugs válidos para una URL', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    for (const { slug } of products) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('identifica como demostración el catálogo y todos sus precios', () => {
    expect(PRODUCT_CATALOG.dataStatus).toBe('demo');
    expect(PRODUCT_CATALOG.notice).toMatch(/demostración/);
    expect(PRODUCT_CATALOG.notice).toMatch(/ficticios/);
    for (const { slug, price } of products) {
      expect(price.isDemo, slug).toBe(true);
      expect(price.amount, slug).toBeGreaterThan(0);
      expect(price.currency, slug).toBe('COP');
      expect(price.unit.trim(), slug).not.toBe('');
    }
  });

  it('cada imagen tiene versión optimizada y texto alternativo propio', () => {
    for (const { slug, image, gallery } of products) {
      for (const { src, alt } of [image, ...(gallery ?? [])]) {
        expect(() => optimizedImage(src), slug).not.toThrow();
        expect(alt.trim().length, src).toBeGreaterThan(10);
      }
    }
  });

  it('cada producto tiene su contenido y aparece en la lista de su categoría principal', () => {
    for (const product of products) {
      const category = findCategory(product.categoryId);
      expect(category, product.slug).toBeDefined();
      expect(category?.items.map((i) => i.productId)).toContain(product.id);
      expect(product.description, product.slug).toContain(product.shortDescription);
      expect(product.features.length, product.slug).toBeGreaterThan(0);
      expect(product.specifications.length, product.slug).toBeGreaterThan(0);
      expect(product.recommendations.length, product.slug).toBeGreaterThan(0);
    }
  });

  it('las listas solo referencian productos existentes y sin repetir dentro de cada lista', () => {
    const ids = new Set(products.map((p) => p.id));
    for (const list of [...categories.map((c) => c.items), featured]) {
      const listed = list.map((entry) => entry.productId);
      expect(new Set(listed).size).toBe(listed.length);
      expect(listed.filter((id) => !ids.has(id))).toEqual([]);
    }
    expect(() => toCatalogItems([{ productId: 'no-existe' }])).toThrow(/no-existe/);
  });

  it('conserva las secciones, el orden y los textos del catálogo original', () => {
    const sections = catalogSections('/productos');
    expect(sections.map((s) => s.title)).toEqual([
      'Calzado Caucho',
      'Calzado Cuero - Sintético',
      'Seguridad Vial',
      'Overoles - Ropa',
      'Guantes',
      'Mascarillas - Respiradores - Filtros',
      'Cascos',
      'Caretas',
      'Gafas',
      'Otros',
    ]);
    expect(sections.flatMap((s) => s.items).length).toBe(76);
    expect(catalogSections('/bioseguridad').flatMap((s) => s.items).length).toBe(20);
    expect(toCatalogItems(featured)[2]).toMatchObject({
      title: 'Chaleco Periodista',
      link: '/productos/chaleco-acolchado',
    });
  });

  it('busca por slug y formatea el precio con moneda', () => {
    expect(findProductBySlug('cono')?.name).toBe('Cono');
    expect(findProductBySlug('no-existe')).toBeUndefined();
    expect(findProductBySlug(null)).toBeUndefined();
    expect(
      formatPrice({ amount: 45000, currency: 'COP', unit: 'par', isDemo: true }).replace(
        /\s/g,
        ' ',
      ),
    ).toBe('$ 45.000 COP');
  });

  it('genera título y descripción SEO únicos, de longitud razonable y sin precio', () => {
    const seo = products.map(buildProductSeo);
    expect(new Set(seo.map((s) => s.title)).size).toBe(products.length);
    expect(new Set(seo.map((s) => s.description)).size).toBe(products.length);
    for (const { title, description, path } of seo) {
      expect(path).toMatch(/^productos\/[a-z0-9-]+$/);
      expect(title.length, title).toBeLessThanOrEqual(60);
      expect(description.length, description).toBeGreaterThanOrEqual(70);
      expect(description.length, description).toBeLessThanOrEqual(160);
      expect(description).not.toMatch(/\$|COP/);
    }
    expect(PRODUCT_NOT_FOUND_SEO.noindex).toBe(true);
  });
});
