import { ResolveFn } from '@angular/router';
import { PageSeo } from '../seo/public-pages';
import { PRODUCT_NOT_FOUND_SEO, buildProductSeo } from './product-seo';

/**
 * Entrega a `SeoTitleStrategy` los metadatos del producto de la ruta (`data.seo`).
 * El catálogo se importa de forma diferida para no incluir el JSON en el bundle inicial.
 */
export const productSeoResolver: ResolveFn<PageSeo> = async (route) => {
  const { findProductBySlug } = await import('./product-catalog');
  const product = findProductBySlug(route.paramMap.get('slug'));
  return product ? buildProductSeo(product) : PRODUCT_NOT_FOUND_SEO;
};
