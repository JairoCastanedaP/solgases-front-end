import { findProductBySlug } from '../../core/products/product-catalog';
import { ProductImage } from '../../core/products/product.model';
import { findServiceBySlug } from '../../core/site-services/site-service-catalog';
import { GalleryImage } from '../../shared/models/gallery-image';

export interface PortfolioCard {
  readonly title: string;
  readonly description: string;
  readonly image: ProductImage;
  readonly path: string;
  readonly queryParams?: Readonly<Record<string, string>>;
  readonly linkText: string;
}

function productImage(slug: string): ProductImage {
  const product = findProductBySlug(slug);
  if (!product) {
    throw new Error(`Producto inexistente en products.json: ${slug}`);
  }
  return product.image;
}

function serviceImage(slug: string): ProductImage {
  const service = findServiceBySlug(slug);
  if (!service) {
    throw new Error(`Servicio inexistente en site-services.json: ${slug}`);
  }
  return service.image;
}

/**
 * Resumen del portafolio. Las descripciones solo nombran lo que existe en los catálogos y las
 * imágenes salen de ellos. "Venta de gases" describe el llenado: los gases no figuran como productos.
 */
export const HOME_PORTFOLIO: readonly PortfolioCard[] = [
  {
    title: 'Equipos contra incendio',
    description:
      'Extintores, soportes y recarga de extintores ABC, agua a presión, CO2 y Solkaflam.',
    image: serviceImage('recarga-extintor-10-libras'),
    path: '/servicios',
    queryParams: { tipo: 'Recarga de extintores' },
    linkText: 'Ver recarga de extintores',
  },
  {
    title: 'Venta de gases industriales',
    description: 'Llenado de oxígeno, nitrógeno, acetileno, argón y mezcla de argón y CO2.',
    image: serviceImage('llenado-oxigeno-industrial'),
    path: '/servicios',
    queryParams: { tipo: 'Llenado de gases' },
    linkText: 'Ver llenado de gases',
  },
  {
    title: 'Dotaciones',
    description: 'Elementos de protección personal, camisas, guantes y botas.',
    image: productImage('camisa-azul-caballero'),
    path: '/productos',
    linkText: 'Ver el catálogo',
  },
  {
    title: 'Equipos de carretera',
    description: 'Conos, extintores y señalización.',
    image: productImage('kit-carretera'),
    path: '/productos',
    queryParams: { categoria: 'seguridad-vial' },
    linkText: 'Ver seguridad vial',
  },
];

/** Collage de la sección de asesoría (columnas con imagen grande y pequeña). */
export const HOME_GALLERY: readonly (readonly GalleryImage[])[] = [
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
