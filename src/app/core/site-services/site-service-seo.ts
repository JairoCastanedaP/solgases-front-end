/**
 * Metadatos SEO de los servicios, a partir de sus datos.
 * Solo importa tipos: también lo lee scripts/generate-seo-files.mjs desde Node.
 */
import type { PageSeo } from '../seo/public-pages';
import type { SiteService } from './site-service.model';

export function buildServiceSeo(service: Pick<SiteService, 'slug' | 'name' | 'summary'>): PageSeo {
  return {
    path: `servicios/${service.slug}`,
    title: `${service.name} | Solgases`,
    description: `${service.summary} Consulta en Solgases, Sogamoso.`,
    // Las fotos de servicio no son de 1200×630: se comparte la imagen general de Servicios.
    image: 'img/og/servicios.jpg',
    imageAlt: 'Grupo de extintores',
  };
}

export const SERVICE_NOT_FOUND_SEO: PageSeo = {
  path: 'servicios',
  title: 'Servicio no encontrado | Solgases',
  description: 'El servicio solicitado no está en el sitio. Consulta todos los servicios.',
  image: 'img/og/servicios.jpg',
  imageAlt: 'Grupo de extintores',
  noindex: true,
};
