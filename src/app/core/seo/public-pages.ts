/**
 * Metadatos SEO de las páginas públicas. Es la fuente única para:
 * - las rutas Angular (título y metadatos, ver app.routes.ts),
 * - las rutas prerenderizadas (app.routes.server.ts),
 * - robots.txt y sitemap.xml (scripts/generate-seo-files.mjs).
 *
 * Los textos se redactaron a partir del contenido existente del sitio; no añaden datos nuevos.
 * Este archivo no debe tener imports: también lo lee un script de Node.
 */
export interface PageSeo {
  /** Ruta sin barra inicial ('' es el inicio). */
  readonly path: string;
  readonly title: string;
  readonly description: string;
  /** Imagen para compartir (1200×630, en public/), generada por scripts/optimize-images.mjs. */
  readonly image: string;
  readonly imageAlt: string;
  /** Página que no debe indexarse (p. ej. un producto inexistente): sin URL canónica. */
  readonly noindex?: boolean;
}

export const PUBLIC_PAGES = {
  home: {
    path: '',
    title: 'Solgases | Seguridad industrial en Sogamoso, Boyacá',
    description:
      'Protección personal, extintores, llenado de gases industriales y asesoría en seguridad industrial en Sogamoso, Boyacá, con más de dos décadas de experiencia.',
    image: 'img/og/inicio.jpg',
    imageAlt: 'Soldador trabajando con careta y guantes de protección',
  },
  nosotros: {
    path: 'nosotros',
    title: 'Nosotros | Empresa de Sogamoso, Boyacá | Solgases',
    description:
      'Empresa de Sogamoso, Boyacá, con más de dos décadas en protección personal y prevención de riesgos viales y laborales. Conoce instalaciones, equipo y marcas.',
    image: 'img/og/nosotros.jpg',
    imageAlt: 'Interior del almacén de Solgases con elementos de seguridad',
  },
  productos: {
    path: 'productos',
    title: 'Productos de seguridad industrial en Sogamoso | Solgases',
    description:
      'Calzado de seguridad, guantes, cascos, caretas, gafas, mascarillas, ropa de trabajo y repuestos para equipos de corte y soldadura en Sogamoso, Boyacá.',
    image: 'img/og/productos.jpg',
    imageAlt: 'Cascos de seguridad colgados',
  },
  servicios: {
    path: 'servicios',
    title: 'Recarga de extintores y gases en Sogamoso | Solgases',
    description:
      'En Sogamoso, Boyacá: recarga de extintores ABC, CO2, Solkaflam y tipo K; llenado de oxígeno, nitrógeno, argón y acetileno; reparación de reguladores.',
    image: 'img/og/servicios.jpg',
    imageAlt: 'Grupo de extintores',
  },
  bioseguridad: {
    path: 'bioseguridad',
    title: 'Productos de bioseguridad | Solgases',
    description:
      'Tapabocas, mascarillas N95, gel antibacterial, alcohol, desinfectantes, termómetros, caretas, overoles desechables y señalización de bioseguridad en Sogamoso.',
    image: 'img/og/bioseguridad.jpg',
    imageAlt: 'Persona con overol desechable, mascarilla y guantes',
  },
  contacto: {
    path: 'contacto',
    title: 'Contacto en Sogamoso, Boyacá | Solgases',
    description:
      'Contáctanos en Sogamoso, Boyacá: consulta el horario de atención y la ubicación en el mapa, o envíanos un mensaje desde el formulario.',
    image: 'img/og/contacto.jpg',
    imageAlt: 'Guantes de seguridad exhibidos',
  },
} as const satisfies Record<string, PageSeo>;

/** Rutas heredadas del sitio estático anterior y su destino actual. */
export const LEGACY_REDIRECTS = {
  'index.html': '',
  'nosotros.html': 'nosotros',
  'productos.html': 'productos',
  'servicios.html': 'servicios',
  'bioseguridad.html': 'bioseguridad',
  'contacto.html': 'contacto',
} as const;
