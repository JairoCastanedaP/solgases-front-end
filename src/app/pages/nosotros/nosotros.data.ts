/** Contenido migrado de nosotros.html (mismo orden y textos). */

export interface TeamHighlight {
  readonly title: string;
  readonly image: string;
  readonly text: string;
}

export const TEAM_HIGHLIGHTS: readonly TeamHighlight[] = [
  {
    title: 'Instalaciones',
    image: 'img/almacen.jpg',
    text: 'Contamos con un establecimiento amplio en donde te brindaremos la mejor atención y encontrarás todos los productos y servicios que necesites',
  },
  {
    title: 'Empleados',
    image: 'img/socios.jpg',
    text: 'Nuestro equipo de trabajo está comprometido en brindar la mejor asesoría a cada cliente y colaborar así con el cuidado del trabajador boyacense',
  },
  {
    title: 'Domicilio',
    image: 'img/camioneta2.jpg',
    text: 'Para el transporte de tanques o gran cantidad de mercancía ofrecemos el domicilio sin ningún costo adicional siempre y cuando sea dentro del municipio',
  },
];

/** Logos de marcas, agrupados en las mismas cuatro columnas del original. */
export const BRAND_LOGO_COLUMNS: readonly (readonly string[])[] = [
  [
    'img/marcas/kondor.png',
    'img/marcas/croydon.png',
    'img/marcas/westland.jfif',
    'img/marcas/EPI.png',
  ],
  [
    'img/marcas/zubi-ola.jfif',
    'img/marcas/MSA.png',
    'img/marcas/terrano.jfif',
    'img/marcas/noth.jpg',
  ],
  [
    'img/marcas/victor.png',
    'img/marcas/link tech.png',
    'img/marcas/du pont.png',
    'img/marcas/robusta.jfif',
  ],
  ['img/marcas/3M.png', 'img/marcas/steelpro.png', 'img/marcas/arseg.png', 'img/marcas/saga.png'],
];
