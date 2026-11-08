import { GalleryImage } from '../../shared/models/gallery-image';

/** Galería superior de la página (columnas con imagen grande y pequeña). */
export const PRODUCT_GALLERY: readonly (readonly GalleryImage[])[] = [
  [
    {
      src: 'img/productos/construccion.jpg',
      size: 'big',
      alt: 'Trabajador con casco, chaleco reflectivo y arnés de seguridad',
    },
    {
      src: 'img/productos/reguladores.jfif',
      size: 'small',
      alt: 'Regulador de gas con manómetros',
    },
  ],
  [
    {
      src: 'img/productos/2.jpg',
      size: 'small',
      alt: 'Trabajadora con protectores auditivos y gafas de seguridad',
    },
    {
      src: 'img/productos/3.jpg',
      size: 'big',
      alt: 'Persona con overol, respirador y guantes manipulando productos químicos',
    },
  ],
  [
    {
      src: 'img/galeria/galeria1.jpg',
      size: 'big',
      alt: 'Trabajador puliendo metal con careta y overol de protección',
    },
    {
      src: 'img/productos/equipo victor.jfif',
      size: 'small',
      alt: 'Equipo de oxicorte Victor',
    },
  ],
  [
    {
      src: 'img/productos/nipleria.jpg',
      size: 'small',
      alt: 'Niples, uniones y accesorios de bronce para reguladores',
    },
    {
      src: 'img/productos/5.jpg',
      size: 'big',
      alt: 'Soldador con careta de soldar',
    },
  ],
];
