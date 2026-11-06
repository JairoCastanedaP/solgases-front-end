/**
 * Dominio público del sitio, SIN barra final (p. ej. 'https://www.ejemplo.com').
 *
 * PENDIENTE DE CONFIRMAR: el dominio no aparece en el repositorio ni en la documentación,
 * por eso es `null`. Mientras sea `null` no se generan URL canónicas, `og:url`, `og:image`,
 * `twitter:image` ni `sitemap.xml` (todos requieren URL absolutas). Al definirlo, vuelve a
 * ejecutar `npm run build`.
 *
 * Este archivo no debe tener imports: también lo lee `scripts/generate-seo-files.mjs`.
 */
export const SITE_URL: string | null = null;
