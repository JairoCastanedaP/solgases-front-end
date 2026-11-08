import type { ProductImage, ProductSpecification } from '../products/product.model';

/**
 * Formato de `site-services.json` (documentado en el README, sección "Catálogo de servicios").
 * A diferencia de los productos, aquí no hay datos de demostración: solo información que ya
 * estaba en el sitio. Por eso no hay precios ni otros campos sin respaldo.
 */
export interface SiteService {
  /** Identificador estable: `featured` lo referencia y no cambia aunque cambie el `slug`. */
  readonly id: string;
  /** Segmento único de la URL `/servicios/:slug`. */
  readonly slug: string;
  /** Nombre tal como aparece en el sitio; también es el texto de la tarjeta. */
  readonly name: string;
  readonly summary: string;
  readonly description: string;
  readonly image: ProductImage;
  readonly gallery?: readonly ProductImage[];
  /** Datos que se desprenden del nombre del servicio. */
  readonly details: readonly ProductSpecification[];
  /** Condiciones publicadas en otra página del sitio; se omite si no hay ninguna. */
  readonly notes?: readonly string[];
}

export interface SiteServiceCatalog {
  /** Servicios destacados en la página de inicio, por `id`. */
  readonly featured: readonly string[];
  /** En el orden de la página Servicios. */
  readonly services: readonly SiteService[];
}
