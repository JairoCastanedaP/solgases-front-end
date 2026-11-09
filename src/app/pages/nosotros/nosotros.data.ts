/** Contenido migrado de nosotros.html (mismo orden y textos). */

export interface TeamHighlight {
  readonly title: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly text: string;
}

export const TEAM_HIGHLIGHTS: readonly TeamHighlight[] = [
  {
    title: 'Instalaciones',
    image: 'img/almacen.jpg',
    imageAlt: 'Interior del almacén de Solgases',
    text: 'Contamos con un establecimiento amplio en donde te brindaremos la mejor atención y encontrarás todos los productos y servicios que necesites',
  },
  {
    title: 'Empleados',
    image: 'img/socios.jpg',
    imageAlt: 'Manos del equipo de trabajo unidas',
    text: 'Nuestro equipo de trabajo está comprometido en brindar la mejor asesoría a cada cliente y colaborar así con el cuidado del trabajador boyacense',
  },
  {
    title: 'Domicilio',
    image: 'img/camioneta2.jpg',
    imageAlt: 'Camioneta para domicilios',
    text: 'Para el transporte de tanques o gran cantidad de mercancía ofrecemos servicio de domicilio. Consulta con nosotros las condiciones.',
  },
];

/** Cada punto se apoya en lo que el sitio ya publica: sin certificaciones, garantías ni cifras nuevas. */
export const WHY_US = {
  title: 'Por qué contratar con nosotros',
  text: 'Somos una empresa sogamoseña con más de dos décadas de experiencia en seguridad industrial. Colaboramos con la protección personal de los trabajadores y la prevención de riesgos viales y laborales.',
  points: [
    'Experiencia en seguridad industrial en Sogamoso.',
    'Dotaciones, calzado, guantes, cascos, gafas, caretas y mascarillas.',
    'Recarga de extintores y llenado de gases.',
    'Reparación de reguladores y revisión de equipos de soldar.',
    'Asesoría según tus necesidades y la normativa.',
  ],
} as const;

export interface BrandLogo {
  readonly image: string;
  readonly name: string;
}

/** Logos de marcas, agrupados en las mismas cuatro columnas del original. */
export const BRAND_LOGO_COLUMNS: readonly (readonly BrandLogo[])[] = [
  [
    { image: 'img/marcas/kondor.png', name: 'Kondor' },
    { image: 'img/marcas/croydon.png', name: 'Croydon' },
    { image: 'img/marcas/westland.jfif', name: 'Westland' },
    { image: 'img/marcas/EPI.png', name: 'E.P.I.' },
  ],
  [
    { image: 'img/marcas/zubi-ola.jfif', name: 'Zubi-Ola' },
    { image: 'img/marcas/MSA.png', name: 'MSA' },
    { image: 'img/marcas/terrano.jfif', name: 'Terrano' },
    { image: 'img/marcas/noth.jpg', name: 'North' },
  ],
  [
    { image: 'img/marcas/victor.png', name: 'Victor' },
    { image: 'img/marcas/link tech.png', name: 'Link Tech' },
    { image: 'img/marcas/du pont.png', name: 'DuPont' },
    { image: 'img/marcas/robusta.jfif', name: 'Robusta' },
  ],
  [
    { image: 'img/marcas/3M.png', name: '3M' },
    { image: 'img/marcas/steelpro.png', name: 'Steelpro' },
    { image: 'img/marcas/arseg.png', name: 'Arseg' },
    { image: 'img/marcas/saga.png', name: 'Saga' },
  ],
];
