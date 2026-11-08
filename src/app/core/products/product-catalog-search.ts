import { CatalogItem, CatalogSection } from '../../shared/models/catalog-item';
import { PRODUCT_CATALOG, findProductById, formatPrice, toCatalogItems } from './product-catalog';
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
  /** Orden del JSON: tarjetas agrupadas por categoría. Vacío si hay un orden elegido. */
  readonly sections: readonly CatalogSection[];
  /** Orden elegido: lista única, porque las categorías partirían la secuencia. */
  readonly sorted: readonly CatalogItem[] | null;
}

export const EMPTY_CATALOG_QUERY: CatalogQuery = { q: '', category: '', brand: '', sort: '' };

export const CATALOG_SEARCH_MAX_LENGTH = 100;

export const SORT_OPTIONS: readonly { readonly value: CatalogSort; readonly label: string }[] = [
  { value: '', label: 'Por categoría' },
  { value: 'nombre-asc', label: 'Nombre: de A a Z' },
  { value: 'nombre-desc', label: 'Nombre: de Z a A' },
  { value: 'precio-asc', label: 'Precio ficticio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio ficticio: mayor a menor' },
];

/** Única especificación fiable para filtrar: su valor siempre sale del nombre del producto. */
const BRAND_LABEL = 'Marca o línea en el catálogo';

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });

/** Sin mayúsculas ni tildes: "NITRILO" y "dieléctricas" encuentran "Nitrilo" y "Dielectricas". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function productBrand(product: Product): string | undefined {
  return product.specifications.find(({ label }) => label === BRAND_LABEL)?.value;
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
  return normalize(
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
  readonly card: CatalogItem;
  readonly pricedCard: CatalogItem;
}

/**
 * Se calcula una sola vez: cada tarjeta conserva su identidad entre búsquedas, así la cuadrícula
 * reutiliza los elementos del DOM y las imágenes no parpadean.
 */
const listings = listingTexts();
const ENTRIES: readonly CatalogEntry[] = PRODUCT_CATALOG.categories.flatMap((category) => {
  const cards = toCatalogItems(category.items);
  return category.items.map(({ productId }, index) => {
    const product = findProductById(productId)!;
    const { isDemo, unit } = product.price;
    return {
      categoryId: category.id,
      product,
      text: searchableText(product, listings.get(productId) ?? []),
      card: cards[index],
      pricedCard: {
        ...cards[index],
        note: `${isDemo ? 'Precio ficticio' : 'Precio'}: ${formatPrice(product.price)} por ${unit}`,
      },
    };
  });
});

/** Sin filtro de categoría, cada producto aparece una vez: en la primera lista que lo incluye. */
const UNIQUE_ENTRIES = ENTRIES.filter(
  (entry, index) => ENTRIES.findIndex((e) => e.product.id === entry.product.id) === index,
);

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
export function searchCatalog({ q, category, brand, sort }: CatalogQuery): CatalogResults {
  const words = normalize(q).split(/\s+/).filter(Boolean);
  const matches = (category ? ENTRIES.filter((e) => e.categoryId === category) : UNIQUE_ENTRIES)
    .filter((e) => !brand || productBrand(e.product) === brand)
    .filter((e) => words.every((word) => e.text.includes(word)));

  if (sort) {
    const priced = sort.startsWith('precio');
    const sorted = [...matches]
      .sort(comparator(sort))
      .map((entry) => (priced ? entry.pricedCard : entry.card));
    return { total: matches.length, sections: [], sorted };
  }

  const sections = PRODUCT_CATALOG.categories.flatMap(({ id, fragment, name }) => {
    const items = matches.filter((e) => e.categoryId === id).map((e) => e.card);
    return items.length ? [{ id: fragment, title: name, items }] : [];
  });
  return { total: matches.length, sections, sorted: null };
}
