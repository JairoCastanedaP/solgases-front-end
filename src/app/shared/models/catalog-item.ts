/** Producto o servicio mostrado en una cuadrícula con imagen y título. */
export interface CatalogItem {
  readonly title: string;
  /** Ruta relativa a `public/`, p. ej. `img/productos/cono.jpg`. */
  readonly image: string;
  /** Texto alternativo; por defecto, el título. */
  readonly alt?: string;
  /** Ruta de detalle: si existe, la tarjeta es un enlace. */
  readonly link?: string;
}

/** Bloque de catálogo con encabezado (p. ej. una categoría de productos). */
export interface CatalogSection {
  /** Ancla de la sección dentro de la página. */
  readonly id?: string;
  readonly title: string;
  readonly items: readonly CatalogItem[];
}
