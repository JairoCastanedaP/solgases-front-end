import { PRODUCT_CATALOG, toCatalogItems } from '../../core/products/product-catalog';
import { BRAND_OPTIONS, CATEGORY_OPTIONS } from '../../core/products/product-catalog-search';
import { featuredServiceCards } from '../../core/site-services/site-service-catalog';
import {
  DirectoryGroup,
  DirectoryLink,
} from '../../shared/components/catalog-directory/catalog-directory';
import { CatalogItem } from '../../shared/models/catalog-item';

/** Selección corta: la lista completa está a un enlace, al final de cada grupo. */
const FEATURED_LINKS = 8;

/** Sin repetidos: `featured` de los servicios incluye un `id` dos veces a propósito (ver README). */
function shortList(items: readonly CatalogItem[]): readonly DirectoryLink[] {
  const unique = new Map(items.map(({ title, link }) => [link!, title]));
  return [...unique].slice(0, FEATURED_LINKS).map(([path, label]) => ({ label, path }));
}

/** Solo categorías, marcas, productos y servicios que ya existen en los datos del sitio. */
export const PRODUCTS_DIRECTORY: readonly DirectoryGroup[] = [
  {
    title: 'Categorías',
    links: CATEGORY_OPTIONS.map(({ value, label }) => ({
      label,
      path: '/productos',
      queryParams: { categoria: value },
    })),
  },
  {
    title: 'Marcas y líneas',
    links: BRAND_OPTIONS.map((brand) => ({
      label: brand,
      path: '/productos',
      queryParams: { marca: brand },
    })),
  },
  {
    title: 'Productos relevantes',
    links: [
      ...shortList(toCatalogItems(PRODUCT_CATALOG.featured)),
      { label: 'Ver todos los productos', path: '/productos' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      ...shortList(featuredServiceCards()),
      { label: 'Ver todos los servicios', path: '/servicios' },
    ],
  },
];
