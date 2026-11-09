import { CatalogCard } from '../../shared/models/catalog-card';
import { CatalogItem } from '../../shared/models/catalog-item';
import { SEARCH_MAX_LENGTH, SPANISH_COLLATOR, normalizeText, searchWords } from '../catalog-text';
import { interleavedOrder } from './interleaved-order';
import {
  PRODUCT_CATALOG,
  findCategory,
  findProductById,
  formatPrice,
  toCatalogItems,
} from './product-catalog';
import { productRatingView } from './product-rating';
import { Product } from './product.model';

/** Criterios del catálogo. Viven en la URL: `?q=&categoria=&marca=&orden=`. */
export type CatalogSort = '' | 'nombre-asc' | 'nombre-desc' | 'precio-asc' | 'precio-desc';

export interface CatalogQuery {
  /** Texto tal como se escribió: la búsqueda ignora los espacios de los extremos. */
  readonly q: string;
  readonly category: string;
  readonly brand: string;
  readonly sort: CatalogSort;
}

export interface CatalogResults {
  readonly total: number;
  readonly heading: string;
  /** Ancla de la categoría elegida, para los enlaces `/productos#guantes`. */
  readonly anchor?: string;
  readonly items: readonly CatalogCard[];
}

export const EMPTY_CATALOG_QUERY: CatalogQuery = { q: '', category: '', brand: '', sort: '' };

export const CATALOG_SEARCH_MAX_LENGTH = SEARCH_MAX_LENGTH;

export const SORT_OPTIONS: readonly { readonly value: CatalogSort; readonly label: string }[] = [
  { value: '', label: 'Orden predeterminado' },
  { value: 'nombre-asc', label: 'Nombre: de A a Z' },
  { value: 'nombre-desc', label: 'Nombre: de Z a A' },
  { value: 'precio-asc', label: 'Precio ficticio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio ficticio: mayor a menor' },
];

/** Única especificación fiable para filtrar: su valor siempre sale del nombre del producto. */
const BRAND_LABEL = 'Marca o línea en el catálogo';
const TYPE_LABEL = 'Tipo';

/** Fija el orden mezclado de "Todas las categorías". Cambiarla da otro orden, igual de estable. */
const MIXED_ORDER_SEED = 94;

const collator = SPANISH_COLLATOR;

function specification(product: Product, name: string): string | undefined {
  return product.specifications.find(({ label }) => label === name)?.value;
}

function productBrand(product: Product): string | undefined {
  return specification(product, BRAND_LABEL);
}

/** Categorías y textos de tarjeta de todas las listas donde aparece cada producto. */
function listingTexts(): ReadonlyMap<string, readonly string[]> {
  const texts = new Map<string, string[]>();
  for (const { name, items } of PRODUCT_CATALOG.categories) {
    for (const { productId, label } of items) {
      const list = texts.get(productId) ?? [];
      list.push(name, ...(label ? [label] : []));
      texts.set(productId, list);
    }
  }
  return texts;
}

/** Sin `recommendations`: son frases genéricas que harían coincidir casi todo el catálogo. */
function searchableText(product: Product, listing: readonly string[]): string {
  return normalizeText(
    [
      product.name,
      ...listing,
      product.shortDescription,
      product.description,
      ...product.features,
      ...product.specifications.map(({ value }) => value),
    ].join(' '),
  );
}

interface CatalogEntry {
  readonly categoryId: string;
  readonly product: Product;
  readonly text: string;
  readonly card: CatalogCard;
  readonly pricedCard: CatalogCard;
}

/** Si el texto de la tarjeta difiere del nombre, se anuncian los dos: nunca falta lo visible. */
function cardAriaLabel(item: CatalogItem, card: Omit<CatalogCard, 'ariaLabel'>): string {
  const sameText = item.title.toLowerCase() === card.name.toLowerCase();
  return [
    `Ver detalle de ${sameText ? card.name : `${item.title} (${card.name})`}`,
    card.brand && `Marca: ${card.brand}`,
    `Tipo: ${card.kind}`,
    card.rating?.label,
    card.note,
  ]
    .filter(Boolean)
    .join('. ');
}

function toCatalogCard(item: CatalogItem, product: Product, note?: string): CatalogCard {
  const categoryName = findCategory(product.categoryId)?.name ?? '';
  const brand = productBrand(product);
  const card = {
    ...item,
    link: item.link!,
    slug: product.slug,
    name: product.name,
    brand,
    // Todos los productos tienen "Tipo"; la categoría cubre uno nuevo que aún no lo tenga.
    kind: specification(product, TYPE_LABEL) ?? categoryName,
    summary: product.shortDescription,
    rating: productRatingView(product.id),
    note,
    quickView: {
      facts: [
        { label: 'Categoría', value: categoryName },
        ...(brand ? [{ label: 'Marca', value: brand }] : []),
      ],
      notice: 'Descripción de demostración: no es una ficha técnica.',
    },
  };
  return { ...card, ariaLabel: cardAriaLabel(item, card) };
}

/**
 * Se calcula una sola vez: cada tarjeta conserva su identidad entre búsquedas, así la cuadrícula
 * reutiliza los elementos del DOM y las imágenes no parpadean.
 */
const listings = listingTexts();
const ENTRIES: readonly CatalogEntry[] = PRODUCT_CATALOG.categories.flatMap((category) => {
  const items = toCatalogItems(category.items);
  return category.items.map(({ productId }, index) => {
    const product = findProductById(productId)!;
    const { isDemo, unit } = product.price;
    const label = isDemo ? 'Precio ficticio' : 'Precio';
    return {
      categoryId: category.id,
      product,
      text: searchableText(product, listings.get(productId) ?? []),
      card: toCatalogCard(items[index], product),
      pricedCard: toCatalogCard(
        items[index],
        product,
        `${label}: ${formatPrice(product.price)} por ${unit}`,
      ),
    };
  });
});

/** Sin filtro de categoría, cada producto aparece una vez: en la primera lista que lo incluye. */
const UNIQUE_ENTRIES = ENTRIES.filter(
  (entry, index) => ENTRIES.findIndex((e) => e.product.id === entry.product.id) === index,
);

/**
 * Orden de "Todas las categorías". Filtrar conserva este orden en vez de barajar de nuevo, y nada de
 * él depende de la URL. Ver `interleavedOrder`: es igual en el servidor y en el navegador.
 */
const MIXED_ENTRIES = interleavedOrder(UNIQUE_ENTRIES, (e) => e.categoryId, MIXED_ORDER_SEED);

const CATEGORY_IDS = new Set(PRODUCT_CATALOG.categories.map(({ id }) => id));

export const CATALOG_TOTAL = UNIQUE_ENTRIES.length;

export const CATEGORY_OPTIONS: readonly { readonly value: string; readonly label: string }[] =
  PRODUCT_CATALOG.categories.map(({ id, name }) => ({ value: id, label: name }));

/** Valores presentes en el JSON. Un producto sin marca solo se oculta al filtrar por marca. */
export const BRAND_OPTIONS: readonly string[] = [
  ...new Set(
    PRODUCT_CATALOG.products.flatMap((product) => {
      const brand = productBrand(product);
      return brand ? [brand] : [];
    }),
  ),
].sort(collator.compare);

/** Lee la URL. Un valor desconocido equivale a no filtrar: nunca provoca un error. */
export function parseCatalogQuery(params: { get(name: string): string | null }): CatalogQuery {
  const category = params.get('categoria') ?? '';
  const brand = params.get('marca') ?? '';
  const sort = params.get('orden') ?? '';
  return {
    q: (params.get('q') ?? '').slice(0, CATALOG_SEARCH_MAX_LENGTH),
    category: CATEGORY_IDS.has(category) ? category : '',
    brand: BRAND_OPTIONS.includes(brand) ? brand : '',
    sort: SORT_OPTIONS.find(({ value }) => value === sort)?.value ?? '',
  };
}

/** Parámetros de la URL; `null` los quita para que el catálogo sin filtros sea `/productos`. */
export function toCatalogParams({ q, category, brand, sort }: CatalogQuery) {
  return {
    q: q.trim() ? q : null,
    categoria: category || null,
    marca: brand || null,
    orden: sort || null,
  };
}

/** Los enlaces `/productos#guantes` de los detalles y de favoritos abren esa categoría. */
export function categoryFromFragment(fragment: string | null): string {
  return PRODUCT_CATALOG.categories.find((c) => c.fragment === fragment)?.id ?? '';
}

export function isCatalogQueryActive({ q, category, brand, sort }: CatalogQuery): boolean {
  return Boolean(q.trim() || category || brand || sort);
}

/** Un precio no numérico queda siempre al final, en cualquier sentido del orden. */
function comparePrice(a: Product, b: Product, direction: number): number {
  const [priceA, priceB] = [a.price?.amount, b.price?.amount];
  const [validA, validB] = [Number.isFinite(priceA), Number.isFinite(priceB)];
  if (!validA || !validB) {
    return Number(validB) - Number(validA);
  }
  return (priceA - priceB) * direction;
}

function comparator(sort: CatalogSort) {
  const byTitle = (a: CatalogEntry, b: CatalogEntry) =>
    collator.compare(a.card.title, b.card.title);
  switch (sort) {
    case 'nombre-desc':
      return (a: CatalogEntry, b: CatalogEntry) => byTitle(b, a);
    case 'precio-asc':
    case 'precio-desc': {
      const direction = sort === 'precio-asc' ? 1 : -1;
      return (a: CatalogEntry, b: CatalogEntry) =>
        comparePrice(a.product, b.product, direction) || byTitle(a, b);
    }
    default:
      return byTitle;
  }
}

/** Busca palabra por palabra, en cualquier orden: "croydon negra" encuentra "Machita Negra". */
export function searchCatalog(query: CatalogQuery): CatalogResults {
  const { q, category, brand, sort } = query;
  const words = searchWords(q);
  const matches = (category ? ENTRIES.filter((e) => e.categoryId === category) : MIXED_ENTRIES)
    .filter((e) => !brand || productBrand(e.product) === brand)
    .filter((e) => words.every((word) => e.text.includes(word)));

  const ordered = sort ? [...matches].sort(comparator(sort)) : matches;
  const priced = sort.startsWith('precio');
  const selected = category ? findCategory(category) : undefined;
  return {
    total: matches.length,
    heading: selected?.name ?? (isCatalogQueryActive(query) ? 'Resultados' : 'Todos los productos'),
    anchor: selected?.fragment,
    items: ordered.map((entry) => (priced ? entry.pricedCard : entry.card)),
  };
}
