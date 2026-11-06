import { Routes } from '@angular/router';

const SITE = 'Solgases';

export const routes: Routes = [
  {
    path: '',
    title: SITE,
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'nosotros',
    title: `Nosotros | ${SITE}`,
    loadComponent: () => import('./pages/nosotros/nosotros').then((m) => m.NosotrosPage),
  },
  {
    path: 'productos',
    title: `Productos | ${SITE}`,
    loadComponent: () => import('./pages/productos/productos').then((m) => m.ProductosPage),
  },
  {
    path: 'servicios',
    title: `Servicios | ${SITE}`,
    loadComponent: () => import('./pages/servicios/servicios').then((m) => m.ServiciosPage),
  },
  {
    path: 'bioseguridad',
    title: `Bioseguridad | ${SITE}`,
    loadComponent: () =>
      import('./pages/bioseguridad/bioseguridad').then((m) => m.BioseguridadPage),
  },
  {
    path: 'contacto',
    title: `Contacto | ${SITE}`,
    loadComponent: () => import('./pages/contacto/contacto').then((m) => m.ContactoPage),
  },

  // Compatibilidad con las URLs del sitio estático anterior (enlaces guardados o indexados).
  { path: 'index.html', redirectTo: '' },
  { path: 'nosotros.html', redirectTo: 'nosotros' },
  { path: 'productos.html', redirectTo: 'productos' },
  { path: 'servicios.html', redirectTo: 'servicios' },
  { path: 'bioseguridad.html', redirectTo: 'bioseguridad' },
  { path: 'contacto.html', redirectTo: 'contacto' },

  // galeria.html estaba vacío en el sitio original; cualquier ruta desconocida va al inicio.
  { path: '**', redirectTo: '' },
];
