/** Formato de `products.json` (documentado en el README, sección "Catálogo de productos"). */
export interface ProductImage {
  /** Ruta relativa a `public/`, p. ej. `img/productos/cono.jpg`. */
  readonly src: string;
  readonly alt: string;
}

export interface ProductPrice {
  readonly amount: number;
  /** Código ISO 4217, p. ej. `COP`. */
  readonly currency: string;
  /** Unidad de venta: `par`, `unidad`, `caja`... */
  readonly unit: string;
  /** `true` mientras el valor sea ficticio; la vista muestra entonces el aviso de demostración. */
  readonly isDemo: boolean;
}

export interface ProductSpecification {
  readonly label: string;
  readonly value: string;
}

export interface Product {
  /** Identificador estable: las listas lo referencian y no cambia aunque cambie el `slug`. */
  readonly id: string;
  /** Segmento único de la URL `/productos/:slug`. */
  readonly slug: string;
  readonly name: string;
  /** Categoría principal: define las migas de pan y el enlace de regreso. */
  readonly categoryId: string;
  readonly shortDescription: string;
  readonly description: string;
  readonly price: ProductPrice;
  readonly image: ProductImage;
  readonly gallery?: readonly ProductImage[];
  readonly features: readonly string[];
  readonly specifications: readonly ProductSpecification[];
  readonly recommendations: readonly string[];
}

/** Aparición de un producto en una lista; `label` conserva un texto de tarjeta distinto al nombre. */
export interface ProductListEntry {
  readonly productId: string;
  readonly label?: string;
}

export interface ProductCategory {
  readonly id: string;
  readonly name: string;
  /** Página donde se lista la categoría. */
  readonly path: string;
  /** Ancla de la categoría dentro de su página, si comparte página con otras. */
  readonly fragment?: string;
  /** Orden en que se muestran las tarjetas. */
  readonly items: readonly ProductListEntry[];
}

export interface ProductCatalog {
  /** `demo` mientras los datos sean ficticios. */
  readonly dataStatus: string;
  /** Aviso que la vista de detalle muestra junto a los datos de demostración. */
  readonly notice: string;
  readonly categories: readonly ProductCategory[];
  /** Productos destacados en la página de inicio. */
  readonly featured: readonly ProductListEntry[];
  readonly products: readonly Product[];
}
