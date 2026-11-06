import { CatalogSection } from '../../shared/models/catalog-item';
import { GalleryImage } from '../../shared/models/gallery-image';

/** Contenido migrado de productos.html (mismo orden y textos). */
export const PRODUCT_CATEGORIES: readonly CatalogSection[] = [
  {
    title: 'Calzado Caucho',
    items: [
      { title: 'Botas Croydon Argyll Amarillo', image: 'img/productos/botas-caucho-argyll.jpg' },
      { title: 'Botas Croydon Machita Azul', image: 'img/productos/bota-croydon-machita.jpg' },
      { title: 'Botas Croydon Seguridad', image: 'img/productos/bota-caucho-amarilla.jpg' },
      { title: 'Botas Workman Seguridad', image: 'img/productos/botas-macha-negra.jpg' },
      { title: 'Botas Workman Seguridad', image: 'img/productos/botas-caucho-blancas.jpg' },
      { title: 'Botas Croydon Machita Negra', image: 'img/productos/bota-machita-negra.jpg' },
      { title: 'Botas Croydon Argyll Rojo', image: 'img/productos/bota-caucho-argyll-rojo.jpg' },
      { title: 'Botas Robusta Seguridad', image: 'img/productos/bota-caucho-negra.jpg' },
    ],
  },
  {
    title: 'Calzado Cuero - Sintético',
    items: [
      { title: 'Botas Kondor Soldador', image: 'img/productos/bota-kondor-soldar.jpg' },
      { title: 'Botas Kondor Dieléctricas', image: 'img/productos/bota kondor teni amarilla.PNG' },
      {
        title: 'Botas Ingeniero Steel Series',
        image: 'img/productos/botas-ingeniero-seguridad.jpg',
      },
      { title: 'Botas Ingeniero Terrano', image: 'img/productos/bota-terrano-ingeniero.jpg' },
      { title: 'Botas Saga Seguridad', image: 'img/productos/bota-saga-seguridad.jpg' },
      { title: 'Botas Ingeniero Steel Series', image: 'img/productos/bota-ingeniera-dama.jpg' },
      { title: 'Botas Ingeniero Saga', image: 'img/productos/bota-saga-ingeniero.jpg' },
      { title: 'Botas Ingeniero Terrano', image: 'img/productos/botas-terrano-ingeniero.jpg' },
    ],
  },
  {
    title: 'Seguridad Vial',
    items: [
      { title: 'Extintor 5 libras', image: 'img/productos/extintor 5 libras.jfif' },
      { title: 'Chaleco Reflectivo', image: 'img/productos/chaleco-reflectivo.jpg' },
      { title: 'Cono', image: 'img/productos/cono.jpg' },
      { title: 'Botiquín Básico', image: 'img/productos/BOTIQUIN-25-elementos.jpg' },
      { title: 'Linterna Varta', image: 'img/productos/linterna-varta.jpg' },
      { title: 'Kit Carretera', image: 'img/productos/kit-carretera-automovil.jpg' },
      { title: 'Soporte Extintor', image: 'img/productos/soporte-extintor.jpg' },
      { title: 'Maleta Alfombra', image: 'img/productos/maleta-alfombra-carro.jpg' },
    ],
  },
  {
    title: 'Overoles - Ropa',
    items: [
      {
        title: 'Camisa Jean para Caballero',
        image: 'img/productos/camisa-jean-hombre-somgamoso.jpg',
      },
      { title: 'Camisa Azul Caballero', image: 'img/productos/camisa-azul.jpg' },
      { title: 'Camisa Jean para Dama', image: 'img/productos/camisa jean sogamoso.jpg' },
      { title: 'Conjunto Impermeable', image: 'img/productos/conjunto-impermeable.jpg' },
      { title: 'Pantalón Jean', image: 'img/productos/pantalón jean sogamoso.jpg' },
      { title: 'Overol Piezas', image: 'img/productos/overol-drill-dos-piezas.jpg' },
      { title: 'Chaleco Acolchado', image: 'img/productos/chaleco acolchado.jpg' },
      { title: 'Overol Eterizo', image: 'img/productos/overol-drill-enterizo.jpg' },
    ],
  },
  {
    title: 'Guantes',
    items: [
      { title: 'Guantes de Latex', image: 'img/productos/guante-latex-negro.jpg' },
      { title: 'Guante Vaqueta', image: 'img/productos/guantes vaqueta.jpg' },
      { title: 'Guante Carnaza', image: 'img/productos/guante-carnaza-sogamoso.jpg' },
      { title: 'Guante Kodiak', image: 'img/productos/guante-kodiak.jpg' },
      { title: 'Guante Lana', image: 'img/productos/guante-lana.jpg' },
      { title: 'Guante Nitrilo', image: 'img/productos/guantes-nitrilo.jpg' },
      { title: 'Altas temperaturas', image: 'img/productos/guante-altas-temperaturas.jpg' },
      { title: 'Guante Mosquetero', image: 'img/productos/guantes-mosquetero.jpg' },
    ],
  },
  {
    title: 'Mascarillas - Respiradores - Filtros',
    items: [
      { title: 'Mascarilla Económica', image: 'img/productos/mascarilla-economica.jpg' },
      { title: 'Mascarilla 3M Elastomero', image: 'img/productos/mascarilla 3m elastomero.PNG' },
      { title: 'Tapabocas 3M Desechable N95', image: 'img/productos/tapabocas 3m.jpg' },
      { title: 'Respirador Well Done', image: 'img/productos/mascarilla-well-done.jpg' },
      { title: 'Respirador 3M 7501', image: 'img/productos/respirador-7501.jpg' },
      { title: 'Filtro 3M 6003', image: 'img/productos/filtro-6003.jpg' },
      { title: 'Filtro 3M 2097', image: 'img/productos/filtro-2097.jpg' },
      { title: 'Filtro 3M 7093-C', image: 'img/productos/filtro-3M-7093C.jpg' },
    ],
  },
  {
    title: 'Cascos',
    items: [
      { title: 'Casco de Seguridad', image: 'img/productos/casco de seguridad sogamoso.jpg' },
      { title: 'Casco Minero', image: 'img/productos/casco-minero-armadura.jpg' },
      { title: 'Casco Alturas', image: 'img/productos/casco-alturas-sogamoso.jpg' },
      { title: 'Casco prevención', image: 'img/productos/casco-economico-sogamoso.jpg' },
      { title: 'Casco Safari', image: 'img/productos/casco-safari-sogamoso.jpg' },
      { title: 'Visor Guadañar', image: 'img/productos/casco-visor-sogamoso.jpg' },
      { title: 'Barbuquejo 3pts', image: 'img/productos/barbuquejo-3-puntos.jpg' },
      { title: 'Tapaiodios Casco', image: 'img/productos/tapaoidos-casco.jpg' },
    ],
  },
  {
    title: 'Caretas',
    items: [
      { title: 'Careta Pulir', image: 'img/productos/careta-pulir-sogamoso.jpg' },
      { title: 'Careta Corriente', image: 'img/productos/Careta-soldar-corriente.jpg' },
      { title: 'Careta Arco', image: 'img/productos/careta-altas-temperaturas.jpg' },
      {
        title: 'Careta Inteligente',
        image: 'img/productos/careta-soldar-inteligente-calabera.jpg',
      },
    ],
  },
  {
    title: 'Gafas',
    items: [
      { title: 'Monogafa Clara', image: 'img/productos/monogafa-everest.jpg' },
      { title: 'Gafas de Seguridad', image: 'img/productos/gafas de seguridad sogamoso.jpg' },
      { title: 'Gafas Nemesis', image: 'img/productos/gafa-nemesis.jpg' },
      { title: 'Gafas Ámbar', image: 'img/productos/gafa-ambar-amarilla.jpg' },
      { title: 'Gafas Radians', image: 'img/productos/gafa-radians-negra.jpg' },
      { title: 'Gafas Top-Gun', image: 'img/productos/gafa-top-gun.jpg' },
      { title: 'Gafas Laboratorio', image: 'img/productos/gafa-laboratorio.jpg' },
      { title: 'Gafas Malla', image: 'img/productos/gafa-kim-malla.jpg' },
    ],
  },
  {
    title: 'Otros',
    items: [
      { title: 'Manómetro', image: 'img/productos/manometro.jpg' },
      { title: 'Gel Antibacterial', image: 'img/productos/gel sogamoso.jpg' },
      { title: 'Eslingas', image: 'img/productos/eslinga.jpg' },
      { title: 'Señalización PVC', image: 'img/productos/señalización.PNG' },
      { title: 'Arnés', image: 'img/productos/arnés.jpg' },
      { title: 'Botiquín Metálico', image: 'img/productos/botiquin-metalico.jpg' },
      { title: 'Pinza de Masa', image: 'img/productos/pinza-masa.jpg' },
      { title: 'Manguera Oxicorte', image: 'img/productos/manguera-oxicorte.jpg' },
    ],
  },
];

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
