/**
 * Metadatos SEO de los productos, a partir de sus datos.
 * Solo importa tipos: también lo lee scripts/generate-seo-files.mjs desde Node.
 */
import type { PageSeo } from '../seo/public-pages';
import type { Product } from './product.model';

/** El precio se omite a propósito: es ficticio y no debe aparecer en resultados de búsqueda. */
export function buildProductSeo(
  product: Pick<Product, 'slug' | 'name' | 'shortDescription'>,
): PageSeo {
  return {
    path: `productos/${product.slug}`,
    title: `${product.name} | Solgases`,
    description: `${product.shortDescription} Consulta en Solgases, Sogamoso.`,
    // Las imágenes de producto no son de 1200×630: se comparte la imagen general del catálogo.
    image: 'img/og/productos.jpg',
    imageAlt: 'Cascos de seguridad colgados',
  };
}

export const PRODUCT_NOT_FOUND_SEO: PageSeo = {
  path: 'productos',
  title: 'Producto no encontrado | Solgases',
  description: 'El producto solicitado no está en el catálogo. Consulta todos los productos.',
  image: 'img/og/productos.jpg',
  imageAlt: 'Cascos de seguridad colgados',
  noindex: true,
};
