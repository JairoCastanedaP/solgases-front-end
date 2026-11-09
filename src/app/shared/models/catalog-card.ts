import { CatalogItem } from './catalog-item';

/** Dato breve de la vista rápida, p. ej. "Categoría: Guantes". */
export interface CardFact {
  readonly label: string;
  readonly value: string;
}

/** Tarjeta de un catálogo con búsqueda. Solo lleva datos que existen en su JSON. */
export interface CatalogCard extends CatalogItem {
  readonly link: string;
  /** Identifica la tarjeta en la página. */
  readonly slug: string;
  /** Nombre completo, aunque la tarjeta muestre un texto más corto o lo trunque. */
  readonly name: string;
  /** Se omite si no hay una marca confirmada. */
  readonly brand?: string;
  /** Tipo de producto o de servicio. */
  readonly kind: string;
  readonly summary: string;
  /** Estrellas decorativas y su texto equivalente; los servicios no tienen. */
  readonly rating?: { readonly stars: string; readonly label: string };
  /** Precio rotulado como ficticio: solo al ordenar por precio, nunca en el HTML estático. */
  readonly note?: string;
  readonly ariaLabel: string;
  readonly quickView: {
    readonly facts: readonly CardFact[];
    /** Muestra también la imagen de la tarjeta. */
    readonly image?: boolean;
    /** Advertencia sobre los datos, p. ej. que la descripción es de demostración. */
    readonly notice?: string;
  };
}
