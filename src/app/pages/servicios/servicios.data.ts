import { SERVICE_TYPES, servicesOfType } from '../../core/site-services/site-service-search';
import { DirectoryGroup } from '../../shared/components/catalog-directory/catalog-directory';

function servicesGroup(title: string, type: string): DirectoryGroup {
  return {
    title,
    links: servicesOfType(type).map(({ name, link }) => ({ label: name, path: link })),
  };
}

/** Solo tipos, servicios y páginas que ya existen en el sitio. */
export const SERVICES_DIRECTORY: readonly DirectoryGroup[] = [
  {
    title: 'Tipos de servicio',
    links: SERVICE_TYPES.map((type) => ({
      label: type,
      path: '/servicios',
      queryParams: { tipo: type },
    })),
  },
  servicesGroup('Recarga de extintores', 'Recarga de extintores'),
  servicesGroup('Llenado de gases', 'Llenado de gases'),
  {
    title: 'También en Solgases',
    links: [
      { label: 'Productos', path: '/productos' },
      { label: 'Bioseguridad', path: '/bioseguridad' },
      { label: 'Contacto', path: '/contacto' },
    ],
  },
];
