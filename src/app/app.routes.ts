import { Route, Routes } from '@angular/router';
import { productSeoResolver } from './core/products/product-seo.resolver';
import { LEGACY_REDIRECTS, PUBLIC_PAGES, PageSeo } from './core/seo/public-pages';

/** Ruta pública con título y metadatos SEO (aplicados por SeoTitleStrategy). */
function page(seo: PageSeo, loadComponent: Route['loadComponent']): Route {
  return { path: seo.path, title: seo.title, data: { seo }, loadComponent };
}

export const routes: Routes = [
  page(PUBLIC_PAGES.home, () => import('./pages/home/home').then((m) => m.HomePage)),
  page(PUBLIC_PAGES.nosotros, () =>
    import('./pages/nosotros/nosotros').then((m) => m.NosotrosPage),
  ),
  page(PUBLIC_PAGES.productos, () =>
    import('./pages/productos/productos').then((m) => m.ProductosPage),
  ),
  // Sin `title`: SeoTitleStrategy toma el título de `data.seo`, que depende del producto.
  {
    path: 'productos/:slug',
    resolve: { seo: productSeoResolver },
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle').then((m) => m.ProductoDetallePage),
  },
  page(PUBLIC_PAGES.servicios, () =>
    import('./pages/servicios/servicios').then((m) => m.ServiciosPage),
  ),
  page(PUBLIC_PAGES.bioseguridad, () =>
    import('./pages/bioseguridad/bioseguridad').then((m) => m.BioseguridadPage),
  ),
  page(PUBLIC_PAGES.contacto, () =>
    import('./pages/contacto/contacto').then((m) => m.ContactoPage),
  ),

  // Compatibilidad con las URLs del sitio estático anterior (enlaces guardados o indexados).
  ...Object.entries(LEGACY_REDIRECTS).map(([path, redirectTo]) => ({ path, redirectTo })),

  // galeria.html estaba vacío en el sitio original; cualquier ruta desconocida va al inicio.
  { path: '**', redirectTo: '' },
];
