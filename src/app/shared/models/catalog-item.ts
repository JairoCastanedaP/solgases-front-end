/** Producto o servicio mostrado en una cuadrícula con imagen y título. */
export interface CatalogItem {
  readonly title: string;
  /** Ruta relativa a `public/`, p. ej. `img/productos/cono.jpg`. */
  readonly image: string;
}

/** Bloque de catálogo con encabezado (p. ej. una categoría de productos). */
export interface CatalogSection {
  readonly title: string;
  readonly items: readonly CatalogItem[];
}
