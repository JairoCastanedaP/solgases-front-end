import { CatalogItem, CatalogSection } from '../../shared/models/catalog-item';
import {
  Product,
  ProductCatalog,
  ProductCategory,
  ProductListEntry,
  ProductPrice,
} from './product.model';
import data from './products.json';

/** Fuente única de los productos. Sin servicio: es contenido estático, como el resto del sitio. */
export const PRODUCT_CATALOG: ProductCatalog = data;

const productsById = new Map(PRODUCT_CATALOG.products.map((p) => [p.id, p]));
const productsBySlug = new Map(PRODUCT_CATALOG.products.map((p) => [p.slug, p]));
const categoriesById = new Map(PRODUCT_CATALOG.categories.map((c) => [c.id, c]));

export function findProductBySlug(slug: string | null): Product | undefined {
  return slug === null ? undefined : productsBySlug.get(slug);
}

export function findCategory(id: string): ProductCategory | undefined {
  return categoriesById.get(id);
}

export function productPath(product: Pick<Product, 'slug'>): string {
  return `/productos/${product.slug}`;
}

/** Tarjetas de una lista del JSON, con enlace al detalle de cada producto. */
export function toCatalogItems(entries: readonly ProductListEntry[]): readonly CatalogItem[] {
  return entries.map(({ productId, label }) => {
    const product = productsById.get(productId);
    if (!product) {
      throw new Error(`Producto inexistente en products.json: ${productId}`);
    }
    return {
      title: label ?? product.name,
      image: product.image.src,
      alt: product.image.alt,
      link: productPath(product),
    };
  });
}

/** Secciones de una página, en el orden del JSON. */
export function catalogSections(path: string): readonly CatalogSection[] {
  return PRODUCT_CATALOG.categories
    .filter((category) => category.path === path)
    .map((category) => ({
      id: category.fragment,
      title: category.name,
      items: toCatalogItems(category.items),
    }));
}

/** P. ej. `$ 45.000 COP`. */
export function formatPrice({ amount, currency }: ProductPrice): string {
  const value = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
  return `${value} ${currency}`;
}
