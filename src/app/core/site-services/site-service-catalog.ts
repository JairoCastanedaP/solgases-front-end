import { CatalogItem } from '../../shared/models/catalog-item';
import { SiteService, SiteServiceCatalog } from './site-service.model';
import data from './site-services.json';

/** Fuente única de los servicios. Sin servicio Angular: es contenido estático, como los productos. */
export const SITE_SERVICE_CATALOG: SiteServiceCatalog = data;

const servicesById = new Map(SITE_SERVICE_CATALOG.services.map((s) => [s.id, s]));
const servicesBySlug = new Map(SITE_SERVICE_CATALOG.services.map((s) => [s.slug, s]));

export function findServiceBySlug(slug: string | null): SiteService | undefined {
  return slug === null ? undefined : servicesBySlug.get(slug);
}

function toCatalogItem(service: SiteService): CatalogItem {
  return {
    title: service.name,
    image: service.image.src,
    alt: service.image.alt,
    link: `/servicios/${service.slug}`,
  };
}

/** Tarjetas de la página Servicios. */
export function serviceCards(): readonly CatalogItem[] {
  return SITE_SERVICE_CATALOG.services.map(toCatalogItem);
}

/** Tarjetas de los servicios destacados del inicio. */
export function featuredServiceCards(): readonly CatalogItem[] {
  return SITE_SERVICE_CATALOG.featured.map((id) => {
    const service = servicesById.get(id);
    if (!service) {
      throw new Error(`Servicio inexistente en site-services.json: ${id}`);
    }
    return toCatalogItem(service);
  });
}
