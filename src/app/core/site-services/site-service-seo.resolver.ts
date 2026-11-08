import { ResolveFn } from '@angular/router';
import { PageSeo } from '../seo/public-pages';
import { SERVICE_NOT_FOUND_SEO, buildServiceSeo } from './site-service-seo';

/**
 * Entrega a `SeoTitleStrategy` los metadatos del servicio de la ruta (`data.seo`).
 * El catálogo se importa de forma diferida para no incluir el JSON en el bundle inicial.
 */
export const serviceSeoResolver: ResolveFn<PageSeo> = async (route) => {
  const { findServiceBySlug } = await import('./site-service-catalog');
  const service = findServiceBySlug(route.paramMap.get('slug'));
  return service ? buildServiceSeo(service) : SERVICE_NOT_FOUND_SEO;
};
