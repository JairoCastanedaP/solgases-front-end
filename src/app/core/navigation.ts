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
