import { SPANISH_COLLATOR, SEARCH_MAX_LENGTH, normalizeText, searchWords } from '../catalog-text';
import { interleavedOrder } from '../products/interleaved-order';
import { CatalogCard } from '../../shared/models/catalog-card';
import { SITE_SERVICE_CATALOG } from './site-service-catalog';
import { SiteService } from './site-service.model';

/** Criterios de la página. Viven en la URL: `?q=&tipo=&orden=`. */
export type ServiceSort = '' | 'nombre-asc' | 'nombre-desc';

export interface ServiceQuery {
  /** Texto tal como se escribió: la búsqueda ignora los espacios de los extremos. */
  readonly q: string;
  readonly type: string;
  readonly sort: ServiceSort;
}

export interface ServiceResults {
  readonly total: number;
  readonly heading: string;
  readonly items: readonly CatalogCard[];
}

export const EMPTY_SERVICE_QUERY: ServiceQuery = { q: '', type: '', sort: '' };

export const SERVICE_SORT_OPTIONS: readonly {
  readonly value: ServiceSort;
  readonly label: string;
}[] = [
  { value: '', label: 'Orden predeterminado' },
  { value: 'nombre-asc', label: 'Nombre: de A a Z' },
  { value: 'nombre-desc', label: 'Nombre: de Z a A' },
];

/** Único campo presente en todos los servicios; "Gas" o "Extintor" solo describen a algunos. */
const TYPE_LABEL = 'Tipo de servicio';

/** Fija el orden mezclado: igual en el servidor y en el navegador, sin errores de hidratación. */
const MIXED_ORDER_SEED = 18;

function serviceType(service: SiteService): string {
  return service.details.find(({ label }) => label === TYPE_LABEL)?.value ?? '';
}

function toCard(service: SiteService): CatalogCard {
  const kind = serviceType(service);
  return {
    title: service.name,
    image: service.image.src,
    alt: service.image.alt,
    link: `/servicios/${service.slug}`,
    slug: service.slug,
    name: service.name,
    kind,
    summary: service.summary,
    ariaLabel: `Ver detalle de ${service.name}. Tipo: ${kind}`,
    quickView: { facts: [{ label: 'Tipo', value: kind }], image: true },
  };
}

interface ServiceEntry {
  readonly type: string;
  readonly text: string;
  readonly card: CatalogCard;
}

/** Se calcula una sola vez: cada tarjeta conserva su identidad entre búsquedas. */
const ENTRIES: readonly ServiceEntry[] = SITE_SERVICE_CATALOG.services.map((service) => ({
  type: serviceType(service),
  text: normalizeText(
    [
      service.name,
      service.summary,
      service.description,
      ...service.details.map(({ value }) => value),
    ].join(' '),
  ),
  card: toCard(service),
}));

const MIXED_ENTRIES = interleavedOrder(ENTRIES, (e) => e.type, MIXED_ORDER_SEED);

export const SERVICE_TOTAL = ENTRIES.length;

/** Valores presentes en el JSON, en orden alfabético. */
export const SERVICE_TYPES: readonly string[] = [...new Set(ENTRIES.map((e) => e.type))]
  .filter(Boolean)
  .sort(SPANISH_COLLATOR.compare);

/** Servicios de un tipo, en el orden del JSON. */
export function servicesOfType(type: string): readonly CatalogCard[] {
  return ENTRIES.filter((e) => e.type === type).map((e) => e.card);
}

/** Lee la URL. Un valor desconocido equivale a no filtrar: nunca provoca un error. */
export function parseServiceQuery(params: { get(name: string): string | null }): ServiceQuery {
  const type = params.get('tipo') ?? '';
  const sort = params.get('orden') ?? '';
  return {
    q: (params.get('q') ?? '').slice(0, SEARCH_MAX_LENGTH),
    type: SERVICE_TYPES.includes(type) ? type : '',
    sort: SERVICE_SORT_OPTIONS.find(({ value }) => value === sort)?.value ?? '',
  };
}

/** Parámetros de la URL; `null` los quita para que la página sin filtros sea `/servicios`. */
export function toServiceParams({ q, type, sort }: ServiceQuery) {
  return { q: q.trim() ? q : null, tipo: type || null, orden: sort || null };
}

export function isServiceQueryActive({ q, type, sort }: ServiceQuery): boolean {
  return Boolean(q.trim() || type || sort);
}

export function searchServices(query: ServiceQuery): ServiceResults {
  const { q, type, sort } = query;
  const words = searchWords(q);
  const matches = (type ? ENTRIES.filter((e) => e.type === type) : MIXED_ENTRIES).filter((e) =>
    words.every((word) => e.text.includes(word)),
  );
  const direction = sort === 'nombre-desc' ? -1 : 1;
  const ordered = sort
    ? [...matches].sort((a, b) => direction * SPANISH_COLLATOR.compare(a.card.title, b.card.title))
    : matches;
  return {
    total: matches.length,
    heading: type || (isServiceQueryActive(query) ? 'Resultados' : 'Todos los servicios'),
    items: ordered.map((e) => e.card),
  };
}
