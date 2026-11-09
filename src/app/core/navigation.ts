export interface NavItem {
  readonly label: string;
  readonly path: string;
}

/** Entradas del menú principal, en el mismo orden que el sitio original. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', path: '/' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Productos', path: '/productos' },
  { label: 'Servicios', path: '/servicios' },
  { label: 'Bioseguridad', path: '/bioseguridad' },
  { label: 'Contacto', path: '/contacto' },
];

/**
 * Atajos del pie de página a cada categoría del catálogo. Es una copia a propósito: importar el JSON
 * llevaría todos los productos al paquete inicial de cada página. Una prueba la compara con el JSON.
 */
export const CATALOG_SHORTCUTS: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'calzado-caucho', label: 'Calzado Caucho' },
  { id: 'calzado-cuero-sintetico', label: 'Calzado Cuero - Sintético' },
  { id: 'seguridad-vial', label: 'Seguridad Vial' },
  { id: 'overoles-ropa', label: 'Overoles - Ropa' },
  { id: 'guantes', label: 'Guantes' },
  { id: 'mascarillas-respiradores-filtros', label: 'Mascarillas - Respiradores - Filtros' },
  { id: 'cascos', label: 'Cascos' },
  { id: 'caretas', label: 'Caretas' },
  { id: 'gafas', label: 'Gafas' },
  { id: 'otros', label: 'Otros' },
  { id: 'bioseguridad', label: 'Bioseguridad' },
];
