import { RenderMode, ServerRoute } from '@angular/ssr';
import { LEGACY_REDIRECTS, PUBLIC_PAGES } from './core/seo/public-pages';

/**
 * Prerenderizado estático (SSG, `outputMode: "static"` en angular.json):
 * - Cada página pública genera `<ruta>/index.html` con su contenido y metadatos.
 * - Las URLs .html heredadas generan una página de redirección (`meta refresh`), salvo
 *   `index.html`, que no puede ser a la vez archivo y carpeta y ya sirve el inicio.
 * - Cualquier otra ruta se resuelve en el navegador desde `index.csr.html`
 *   (requiere el fallback del servidor descrito en el README).
 */
export const serverRoutes: ServerRoute[] = [
  ...Object.values(PUBLIC_PAGES).map((p): ServerRoute => ({
    path: p.path,
    renderMode: RenderMode.Prerender,
  })),
  ...Object.keys(LEGACY_REDIRECTS)
    .filter((path) => path !== 'index.html')
    .map((path): ServerRoute => ({ path, renderMode: RenderMode.Prerender })),
  { path: '**', renderMode: RenderMode.Client },
];
