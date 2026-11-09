# Solgases – Sitio web (frontend)

Sitio informativo de Solgases (seguridad industrial, Sogamoso). Antes era un sitio HTML/CSS/JS
estático y se migró a **Angular 22**, conservando las páginas, los textos, las imágenes y el diseño.
El pequeño script PHP del formulario de contacto se mantiene **separado y sin cambios** en `php/`.

Las páginas públicas se **prerenderizan en el build** (HTML estático con contenido y metadatos por
ruta), así que el sitio se publica en un hosting estático sin servidor Node.

## Requisitos

| Herramienta | Versión                                                                              | Motivo                                                                 |
| ----------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Node.js     | `^22.22.3` o `^24.15.0` (o `>=26`)                                                   | Requisito oficial de Angular 22 (verificado con Node 24.21.0)          |
| npm         | 11 (incluido con Node 24)                                                            | Gestor de paquetes (`packageManager` en `package.json`)                |
| PHP         | 5.5+ (requisito de la PHPMailer 6.0.7 incluida); se recomienda una versión soportada | Ejecutar `php/enviar-prueba.php` (no forma parte del build de Angular) |

Versiones elegidas (según <https://angular.dev/reference/versions> y
<https://angular.dev/reference/releases>, consultadas el 2026-11-06):

- **Angular 22.2** es la única versión mayor en soporte _Active_ (LTS hasta 2028-06). Angular 21
  está en LTS y la 20 termina su LTS el 2026-11-28, por eso no se eligieron.
- **TypeScript ~6.0** (Angular 22 exige `>=6.0 <6.1`).
- **RxJS ~7.8**, **Vitest 5** + **jsdom** para las pruebas unitarias (opción por defecto de Angular CLI 22).
- La aplicación usa componentes standalone, signals y detección de cambios _zoneless_ (por defecto
  en Angular 22). No se incluyó `zone.js` ni `@angular/forms`, porque ninguno es necesario.

## Instalación y comandos

```bash
npm install          # instala las dependencias (usa package-lock.json)
npm start            # servidor de desarrollo en http://localhost:4200
npm run build        # build + prerenderizado en dist/solgases/browser, y después robots.txt/sitemap.xml
npm test             # pruebas unitarias (Vitest, una sola ejecución)
npm run test:watch   # pruebas en modo observación
npm run check:assets # verifica imágenes referenciadas y sus versiones optimizadas
npm run verify       # check:assets + test + build (verificación completa)
npm run php:serve    # servidor PHP local en :8000 (requiere PHP instalado)
npm run optimize:images  # regenera WebP, imágenes Open Graph y el manifiesto (tras añadir o cambiar imágenes)
npm run optimize:fonts   # regenera las fuentes WOFF2 a partir de los TTF
```

`npm run build` falla si alguna página pública no se prerenderizó con su título, su descripción y un
único `<h1>`.

Al añadir o cambiar una imagen en `public/img`, ejecuta `npm run optimize:images`.
`check:assets` falla si una imagen referenciada no tiene versión optimizada. Los resultados
(`public/img/webp`, `public/img/og`, `src/app/shared/images/optimized-images.json` y los `.woff2`)
se guardan en el repositorio, así que el build no necesita `sharp` ni `subset-font`.

> npm 11 puede avisar de que no ejecutó los scripts de instalación de `esbuild`, `lmdb`,
> `msgpackr-extract` y `@parcel/watcher`. El build y las pruebas funcionan igual (se usan los
> binarios precompilados). Solo apruébalos con `npm install-scripts approve <paquete>` si los
> necesitas.

### Formulario de contacto en desarrollo

`ng serve` no ejecuta PHP. `proxy.conf.json` reenvía las peticiones a `/php/*` hacia
`http://localhost:8000`. Para probar el envío del formulario en local:

```bash
npm run php:serve   # terminal 1 (sirve la raíz del repo; solo para desarrollo)
npm start           # terminal 2
```

## Estructura

```
├── php/                         # Backend PHP existente (separado, sin cambios de código)
│   ├── enviar-prueba.php        # Recibe el POST del formulario y envía el correo
│   └── PHPMailer/               # Librería PHPMailer incluida en el repo
├── public/                      # Archivos estáticos copiados tal cual al build
│   ├── img/                     # Imágenes originales (mismas rutas relativas: img/...)
│   └── icons/
│       ├── webp/                # Versiones WebP generadas (mismo subdirectorio que el original)
│       └── og/                  # Imágenes para compartir (1200×630) generadas
├── scripts/
│   ├── check-assets.mjs         # Verificación de rutas de imágenes y del manifiesto
│   ├── optimize-images.mjs      # WebP + Open Graph + manifiesto (sharp)
│   ├── optimize-fonts.mjs       # TTF -> WOFF2 con subconjunto latino (subset-font)
│   └── generate-seo-files.mjs   # robots.txt / sitemap.xml y verificación del prerenderizado
├── proxy.conf.json              # Proxy /php -> servidor PHP local (solo ng serve)
└── src/
    ├── index.html, main.ts
    ├── main.server.ts           # Entrada usada solo en el build para prerenderizar
    ├── styles.css               # Punto de entrada de estilos globales
    ├── styles/
    │   ├── base.css             # Antes css/estilos.css (rutas de fuentes ajustadas)
    │   ├── fonts/               # Montserrat y Pacifico (locales)
    │   └── sw/                  # Fuente de iconos Fontastic (.icon-*) y su referencia
    └── app/
        ├── app.ts, app.config.ts, app.routes.ts
        ├── app.config.server.ts, app.routes.server.ts   # Prerenderizado
        ├── core/                # Datos del sitio (contacto), navegación, destino del formulario
        │   └── products/        # products.json (catálogo), su modelo, consultas y SEO por producto
        │   └── site-services/   # site-services.json, su modelo, consultas y SEO por servicio
        │   └── seo/             # public-pages.ts (títulos/descripciones), site-url.ts (dominio),
        │                        # seo-title-strategy.ts (metadatos), seo-files.ts (robots/sitemap)
        │   └── whatsapp.config.ts   # Número y mensaje del botón de WhatsApp
        ├── layout/              # Encabezado, menú principal (móvil), pie y botón de WhatsApp
        ├── shared/
        │   ├── models/          # Tipos: CatalogItem, CatalogSection, GalleryImage
        │   ├── images/          # Manifiesto de imágenes optimizadas, pipe y loader de banners
        │   └── components/      # Banner, franja de título, cuadrícula de productos,
        │                        # galería con modal y botón "Contáctanos"
        └── pages/               # Una carpeta por página, con sus datos (*.data.ts) y estilos
            ├── home/  nosotros/  productos/  producto-detalle/  servicios/  servicio-detalle/  bioseguridad/  contacto/
```

Criterios usados:

- **Contenido como datos tipados.** Los catálogos (unos 150 elementos) se extrajeron
  automáticamente del HTML original a archivos `*.data.ts`, con los mismos textos, el mismo orden
  y las mismas imágenes. Se renderizan con un único componente, `ProductGrid`, en lugar de
  repetir el marcado.
- **Productos en un único JSON.** Inicio, Productos, Bioseguridad y el detalle leen
  `core/products/products.json` (ver [Catálogo de productos](#catálogo-de-productos)). Los servicios
  tienen su propia fuente, `core/site-services/site-services.json` (ver
  [Catálogo de servicios](#catálogo-de-servicios)).
- **No hay servicios Angular de datos.** El contenido es estático y no hay API, así que un
  servicio solo envolvería constantes. Si en el futuro el contenido viene de un backend, el lugar
  natural para añadir ese servicio es `core/`, y las páginas no tendrían que cambiar su plantilla.
- **Estilos.** `base.css` sigue siendo global para conservar la cascada original. Los CSS que antes
  se cargaban solo en ciertas páginas (`contacto.css`, `nosotros.css`, y la galería y el modal de
  `produtos.css`) ahora están encapsulados en su componente, de modo que no afectan a otras páginas.

## Páginas y rutas

| Ruta               | Origen                       | Título (`<title>`)                            | Notas                                   |
| ------------------ | ---------------------------- | --------------------------------------------- | --------------------------------------- |
| `/`                | `index.html`                 | Solgases \| Seguridad industrial en Sogamoso  | Portafolio, collage y carruseles        |
| `/nosotros`        | `nosotros.html`              | Nosotros \| Solgases                          | Equipo, resumen de servicios, marcas    |
| `/productos`       | `productos.html`             | Productos de seguridad industrial \| Solgases | Catálogo: búsqueda y 11 categorías (94) |
| `/productos/:slug` | Nueva (`products.json`)      | `<Nombre> \| Solgases`                        | Detalle de cada uno de los 94 productos |
| `/servicios`       | `servicios.html`             | Recarga de extintores y gases \| Solgases     | Catálogo: búsqueda y filtro (18)        |
| `/servicios/:slug` | Nueva (`site-services.json`) | `<Nombre> \| Solgases`                        | Detalle de cada uno de los 18 servicios |
| `/bioseguridad`    | `bioseguridad.html`          | Productos de bioseguridad \| Solgases         | 20 productos                            |
| `/contacto`        | `contacto.html`              | Contacto \| Solgases                          | Horario, mapa y formulario (POST a PHP) |

Composición visual y datos sin confirmar:

- `/productos` es un catálogo de tienda: buscador y orden arriba, categorías y marca en una columna
  lateral (desde 1024 px) o en un panel desplegable (móvil y tablet), y resultados a la derecha. El
  texto "Elementos de Protección Personal" y la sección "Encuentra todo en Solgases" van al final.
- "Todas las categorías" muestra una sola lista intercalada, sin agrupar. El orden usa una semilla
  fija (`MIXED_ORDER_SEED`): el servidor y el navegador calculan el mismo, por lo que no hay errores
  de hidratación ni se baraja de nuevo; es igual para todos hasta que se cambie la semilla. Las
  anclas antiguas (`/productos#guantes`), que usan los detalles, abren esa categoría.
- Las tarjetas del catálogo muestran `MARCA | TIPO` y el nombre. La marca sale de "Marca o línea en
  el catálogo" (26 de 94 productos) y, si falta, se omite. El tipo sale de "Tipo".
- Las estrellas son vacías y dicen "Sin calificaciones": no hay reseñas. Las valoraciones reales se
  añaden en `AUTHENTIC_RATINGS` (`core/products/product-rating.ts`); no uses valores de ejemplo.
- La vista rápida solo existe en el DOM mientras está abierta y no incluye precios. Avisa que la
  descripción es de demostración, como declara `notice` en el JSON.
- Los carruseles de Inicio no duplican tarjetas: las reciclan con la propiedad CSS `order`, de modo
  que cada enlace existe una vez y el orden del DOM no cambia. La dirección automática está en
  `AUTO_DIRECTION` (`card-carousel/carousel-motion.ts`).
- "Iniciar sesión" y "Crear cuenta" son botones desactivados, rotulados "Próximamente": no hay
  rutas ni flujo de cuenta.
- El teléfono y la dirección viven solo en `SITE_INFO` (`core/site-info.ts`); de ahí salen el botón
  "Llamar" (`tel:+576087728666`) y el de ubicación, que pregunta antes de abrir Google Maps buscando
  la dirección, sin coordenadas. El teléfono de llamadas no es el número de WhatsApp.
- El pie de página solo usa datos de `SITE_INFO` y rutas existentes. El HTML no lleva el año del
  copyright: el navegador pone el actual, sin necesidad de un nuevo build.
- `/servicios` comparte composición, estilos, cuadrícula y vista rápida con `/productos`. Filtra por
  "Tipo de servicio", el único dato presente en los 18; en la URL: `?q=&tipo=&orden=`.
- Los iconos del menú abren una ventana con el dato de contacto. **Pendiente:** Facebook e Instagram
  dicen "pendiente de configurar" porque ninguna cuenta oficial está identificada; al confirmarlas,
  se añaden en `SOCIAL_PROFILES` (`core/site-info.ts`) y la ventana muestra el enlace.
- Los atajos a categorías del pie (`CATALOG_SHORTCUTS`) son una copia para no llevar
  `products.json` al paquete inicial; una prueba exige que coincidan con el JSON.

Las pruebas se ejecutan aisladas por archivo (`isolate` en `angular.json`): las de prerenderizado
sustituyen clases globales del DOM y, sin aislar, otras fallaban según el orden de los archivos.

Las URLs antiguas (`/productos.html`, etc.) redirigen a las nuevas (ver
[Rutas heredadas](#rutas-heredadas-html)). `galeria.html` estaba vacío (0 bytes) y no tenía
enlaces, así que no se migró. Cualquier ruta desconocida redirige al inicio en el navegador, salvo
`/productos/<slug inexistente>` y `/servicios/<slug inexistente>`, que muestran un aviso de "no
encontrado" con un enlace de regreso.

## Catálogo de productos

> **Todos los precios, unidades, descripciones, características y recomendaciones de
> `products.json` son datos ficticios de demostración.** Todavía no hay base de datos ni backend
> integrado. Hay que reemplazarlos por información confirmada antes de publicar el sitio.

Fuente única: `src/app/core/products/products.json` (94 productos). `product-catalog.ts` lo importa
y ofrece las consultas. Las plantillas no repiten datos de productos.

### Formato del JSON

```jsonc
{
  "dataStatus": "demo", // "demo" mientras los datos sean ficticios
  "notice": "Información de demostración: ...", // aviso que se muestra en el detalle
  "categories": [
    {
      "id": "guantes",
      "name": "Guantes",
      "path": "/productos", // página que lista la categoría
      "fragment": "guantes", // ancla en esa página; se omite si la categoría tiene página propia
      "items": [
        // Orden de las tarjetas. `label` conserva un texto de tarjeta distinto del nombre.
        { "productId": "guantes-altas-temperaturas", "label": "Altas temperaturas" },
      ],
    },
  ],
  "featured": [{ "productId": "cono" }], // destacados del inicio; admite `label`
  "products": [
    {
      "id": "guante-kodiak", // estable: las listas lo referencian, no cambiarlo
      "slug": "guante-kodiak", // único: /productos/guante-kodiak
      "name": "Guante Kodiak", // título principal; "<name> | Solgases" (máximo 60 caracteres)
      "categoryId": "guantes", // categoría principal: migas de pan y enlace de regreso
      "shortDescription": "...", // la descripción SEO añade "Consulta en Solgases, Sogamoso."
      "description": "...",
      "price": { "amount": 30000, "currency": "COP", "unit": "par", "isDemo": true },
      "image": { "src": "img/productos/guante-kodiak.jpg", "alt": "..." },
      "gallery": [{ "src": "img/productos/...", "alt": "..." }], // opcional
      "features": ["..."],
      "specifications": [{ "label": "Tipo", "value": "Guante" }],
      "recommendations": ["..."],
    },
  ],
}
```

Un producto puede aparecer en varias listas, como Gel Antibacterial en Otros y Bioseguridad, pero
tiene un solo registro y una sola URL. La disponibilidad no se incluye: un dato ficticio de
existencias no aporta y podría confundirse con información real.

### Agregar un producto

1. Copia la imagen en `public/img/productos/`.
2. Añade el registro a `products` con `id` y `slug` nuevos (minúsculas, números y guiones).
3. Añade `{ "productId": "<id>" }` a los `items` de su categoría y, si es destacado, a `featured`.
4. Genera la versión WebP y el manifiesto: `npm run optimize:images`.
5. Comprueba todo con `npm run verify`.

La ruta de detalle, el prerenderizado, el título, la descripción y el sitemap (con dominio
confirmado) se generan a partir del JSON, sin tocar otro archivo.

### Búsqueda, filtros y orden

`/productos` cubre los 94 productos. `product-catalog-search.ts` obtiene las opciones del JSON, así
que un producto o una categoría nuevos aparecen sin tocar código:

| Control   | Parámetro   | De dónde sale                                                                                      |
| --------- | ----------- | -------------------------------------------------------------------------------------------------- |
| Buscar    | `q`         | Nombre, texto de tarjeta, categorías, descripciones, características y valores de especificaciones |
| Categoría | `categoria` | `categories`, incluidos los productos de sus `items`                                               |
| Marca     | `marca`     | Especificación "Marca o línea en el catálogo"                                                      |
| Ordenar   | `orden`     | `nombre-asc`, `nombre-desc`, `precio-asc` o `precio-desc`                                          |

- **Búsqueda:** ignora mayúsculas y tildes y exige todas las palabras. Mantiene el orden del JSON,
  sin puntuar la relevancia. No usa `recommendations`, porque son frases genéricas.
- **Sin criterios o sin orden:** los productos se agrupan por categoría y conservan las anclas
  (`/productos#guantes`). Cada listado muestra un producto una sola vez. En la vista completa
  (94 tarjetas), un producto de varias categorías sale en la primera. Por eso la sección Bioseguridad
  de esa vista tiene 18 tarjetas: Gel Antibacterial y el tapabocas N95 salen en Otros y en Mascarillas.
  Filtrar por Bioseguridad muestra su lista completa de 20, igual que la página `/bioseguridad`. Con
  un orden elegido, todo pasa a una sola lista.
- **Campos ausentes:** un producto sin marca (68 de 94) sigue en el catálogo y solo se oculta al
  filtrar por marca. Un precio no numérico queda al final en ambos sentidos.
- **Precios:** solo aparecen en las tarjetas al ordenar por precio, rotulados como ficticios y con el
  aviso `notice`. **Al cargar precios reales**, cambia también el texto de las opciones en
  `SORT_OPTIONS`.
- **URL:** un valor desconocido se ignora. Filtrar reemplaza la entrada del historial, así que "Atrás"
  va del detalle al catálogo filtrado. El enlace "Volver a <categoría>" del detalle sigue llevando a
  la categoría, sin los filtros.

### Verificar las imágenes

`npm run check:assets` comprueba que cada ruta de `products.json` exista en `public/` y tenga versión
optimizada; también falla si un archivo del manifiesto no existe. Las pruebas exigen además un texto
alternativo propio en cada imagen. Ningún comando puede saber si la foto corresponde al producto:
esa revisión es visual, y el `alt` debe describir lo que realmente se ve.

### Distinguir los datos ficticios

- En el JSON: `"dataStatus": "demo"` en la raíz y `"isDemo": true` en cada precio.
- En la página: el rótulo "Precio ficticio de demostración" junto al valor y el aviso `notice`.
- En el HTML estático: el detalle no incluye el precio, que aparece al cargar Angular en el navegador.
  `npm run build` falla si lo encuentra. Sin JavaScript no se ve el precio; el JSON sigue en los
  archivos JS públicos.
- Fuera de la página: el precio no aparece en los metadatos SEO ni hay datos estructurados `Product`.

Los textos solo usan lo que ya estaba en el sitio (nombre y categoría) y lo que se ve en la foto.
Los campos "Marca o línea", "Referencia" y "Capacidad" salen del nombre del catálogo, y "Color" de
la imagen. No se añadieron certificaciones, garantías ni propiedades técnicas. Denominaciones como
"Dieléctricas" o "N95" provienen del catálogo original y se remiten a la ficha del fabricante.

**Al cargar datos reales:** cambia cada `isDemo` a `false` y `dataStatus`. El aviso del detalle
desaparece solo. La prueba "identifica como demostración..." de `product-catalog.spec.ts` fallará a
propósito y debe actualizarse.

### Diferencias con el catálogo original

- **94 productos, ninguno omitido.** Los 116 elementos de Productos (76), Bioseguridad (20) e Inicio
  (20) corresponden a 94 productos únicos: Inicio repite productos de las otras dos páginas, y en
  Bioseguridad se repiten Gel Antibacterial y el tapabocas N95, que allí conserva el texto
  "Mascarilla N95".
- **Nombres repetidos, ahora distintos** (mismo texto para dos productos en dos URL):
  Botas Workman Seguridad Negras y Blancas; Botas Ingeniero Terrano Café y Miel; Botas Ingeniero
  Steel Series y Steel Series para Dama (según el nombre del archivo); Guantes de Látex Negros y
  Verdes.
- **Ortografía corregida:** Overol Enterizo (Eterizo), Tapaoídos Casco (Tapaiodios), Mascarilla 3M
  Elastómero, Guantes de Látex, Overol Dos Piezas (Overol Piezas, según el nombre del archivo).
- **Visor Guadañar** tenía dos fotos. Ahora la de Productos es la principal, también en la tarjeta
  del inicio, y la otra pasa a su galería. Es el único producto con galería: las demás imágenes
  sin usar son escenas generales o corresponden a servicios.
- Algunos textos de tarjeta originales se conservan con `label` (p. ej. "Chaleco Periodista" en el
  inicio, cuyo producto es Chaleco Acolchado).

## Catálogo de servicios

Fuente única: `src/app/core/site-services/site-services.json` (18 servicios). Lo usan las tarjetas de
Inicio y Servicios, y la vista `/servicios/:slug`. `site-service-catalog.ts` ofrece las consultas.

**A diferencia de los productos, no hay datos ficticios.** Por eso no existen campos de precio,
disponibilidad ni aviso de demostración, y no deben añadirse cobertura, tiempos, certificaciones,
garantías, marcas ni condiciones que el negocio no haya confirmado.

### Formato del JSON

```jsonc
{
  "featured": ["llenado-nitrogeno"], // destacados del inicio, por `id` y en orden
  "services": [
    // El orden de este arreglo es el de la página Servicios.
    {
      "id": "llenado-nitrogeno", // estable: `featured` lo referencia, no cambiarlo
      "slug": "llenado-nitrogeno", // único: /servicios/llenado-nitrogeno
      "name": "Llenado de Nitrógeno(N)", // nombre del sitio; "<name> | Solgases" (máximo 60 caracteres)
      "summary": "...", // la descripción SEO añade "Consulta en Solgases, Sogamoso."
      "description": "...", // debe incluir el resumen
      "image": { "src": "img/servicios/nitrogeno-sogamoso.jpg", "alt": "..." },
      "gallery": [{ "src": "img/servicios/tanques1.jpg", "alt": "..." }], // opcional
      "details": [{ "label": "Tipo de servicio", "value": "Llenado de gases" }], // datos del nombre
      "notes": ["..."], // opcional: condiciones ya publicadas en el sitio, textuales
    },
  ],
}
```

### Agregar o actualizar un servicio

1. Si usa una foto nueva, cópiala en `public/img/servicios/`.
2. Añade o edita el registro en `services`. Para un servicio nuevo, usa `id` y `slug` nuevos
   (minúsculas, números y guiones). Al editar uno existente, no cambies su `id`; si cambias el
   `slug`, cambia también su URL publicada.
3. Si debe aparecer en el inicio, añade su `id` a `featured`.
4. Genera la versión WebP y el manifiesto: `npm run optimize:images`.
5. Actualiza las pruebas de `site-service-catalog.spec.ts`, que fijan la lista de nombres.
6. Comprueba todo con `npm run verify`, que incluye `check:assets` (rutas de imagen) y la revisión
   del HTML prerenderizado de cada servicio.

La ruta, el prerenderizado, el título, la descripción y el sitemap (con dominio confirmado) se
generan a partir del JSON.

### De dónde sale cada dato

- **`name`:** texto original de la página Servicios, sin cambios, incluidas formas como
  "Recarga de extintor satelite".
- **`summary` y `details`:** se desprenden del nombre.
- **`description`:** el resumen más, cuando existe, la frase correspondiente del resumen de servicios
  del sitio (`SERVICES_SUMMARY`). Argón, mezcla y alquiler de cilindros no aparecen en ese texto, así
  que su descripción se limita al resumen.
- **`notes`:** la condición de domicilio de Nosotros, en los servicios de llenado y alquiler. Una
  prueba verifica que siga siendo idéntica al texto de Nosotros.

### Diferencias con el sitio anterior

- **Fotos del inicio.** Dos tarjetas usaban una foto distinta a la de `/servicios`: Llenado de
  Nitrógeno y Recarga de extintor de 20 libras. Ahora usan la de `/servicios`, y la otra pasa a la
  galería de su detalle.
- **Tarjeta repetida.** El inicio mostraba dos veces "Recarga de extintor de 5 libras". Se conserva y
  ambas enlazan al mismo detalle; para quitarla, borra el `id` repetido de `featured` y ajusta las
  pruebas que cuentan las tarjetas.

## SEO

Fuente única: `src/app/core/seo/public-pages.ts`. Contiene el título, la descripción y la imagen
para compartir de cada página, y lo usan las rutas, el prerenderizado, el sitemap y las pruebas.
Los textos se redactaron a partir del contenido existente, sin añadir datos nuevos.

- **Productos.** Título y descripción se generan a partir del JSON (`core/products/product-seo.ts`)
  y llegan a `SeoTitleStrategy` por `data.seo`, mediante un resolver. La imagen para compartir es la
  general del catálogo, porque las fotos de producto no son de 1200×630. Un producto inexistente
  recibe `noindex` y no tiene URL canónica.
- **Servicios.** Mismo mecanismo que los productos (`core/site-services/site-service-seo.ts`), con
  la imagen general de Servicios para compartir. Un servicio inexistente recibe `noindex` y no tiene
  URL canónica.
- **Títulos y descripciones únicos por ruta.** Las pruebas verifican que no se repitan, que el
  título tenga como máximo 60 caracteres y que la descripción tenga entre 70 y 160.
- **Metadatos.** `SeoTitleStrategy` (un `TitleStrategy` del router con `Title` y `Meta` de
  `@angular/platform-browser`) aplica en cada navegación, y también al prerenderizar:
  - `description`
  - Open Graph: `og:type`, `og:site_name`, `og:locale` (`es_CO`), `og:title`, `og:description`
  - Twitter: `twitter:card`, `twitter:title`, `twitter:description`
  - Con dominio confirmado, además: `<link rel="canonical">`, `og:url`, `og:image` (1200×630,
    `public/img/og/*.jpg`, recortes de los banners existentes), `og:image:alt` y `twitter:image`.
- **Encabezados.** Cada página tiene exactamente un `<h1>`: el texto del banner. Nosotros, cuyo
  banner no tiene texto visible, usa un `<h1>` oculto visualmente. El logo del encabezado dejó de
  ser `<h1>` (era el mismo en todas las páginas) y ahora es un `<p class="logo">`, con el mismo
  aspecto.
- **Textos `alt`.**
  - Las imágenes informativas tienen `alt` descriptivo: fotos de la galería, del equipo y de
    Sogamoso, logos (nombre de la marca) y productos (descripción de la foto, en `products.json`).
  - Los banners usan `alt=""` porque son decorativos y su texto equivalente es el `<h1>`.
- **`robots.txt`.** Se genera en el build. Permite todo salvo `/php/`, el script del formulario,
  que no es una página. Solo incluye `Sitemap:` cuando hay dominio.
- **`sitemap.xml`.** Solo se genera si hay dominio. Contiene las 6 páginas públicas, los 94
  productos y los 18 servicios, sin rutas
  heredadas, sin PHP y sin `lastmod` (no hay fechas fiables). Las pruebas verifican que cada URL
  corresponde a una página real y prerenderizada.
- **Datos estructurados (`LocalBusiness`): no se añadieron.** Ver
  [Datos pendientes por confirmar](#datos-pendientes-por-confirmar).

### Dominio (pendiente)

El dominio no aparece en el repositorio ni en la documentación, así que no se inventó.
`src/app/core/seo/site-url.ts` tiene `SITE_URL = null`. Mientras sea `null`, el build avisa y omite
la canónica, `og:url`, `og:image`, `twitter:image` y `sitemap.xml`, porque todos exigen URL
absolutas. Para activarlos:

```ts
export const SITE_URL: string | null = 'https://dominio-confirmado.example'; // sin barra final
```

Después, `npm run build`. La URL canónica de cada página no lleva barra final (`/productos`), igual
que los enlaces del sitio. El servidor debe servir esas URL sin redirigir a `/productos/` (ver
[Despliegue](#despliegue)).

## Prerenderizado (SSG)

Se usa el mecanismo oficial de Angular 22: `@angular/ssr` con `"outputMode": "static"` y
`"server": "src/main.server.ts"` en `angular.json`, y `RenderMode.Prerender` en
`src/app/app.routes.server.ts`. Con `outputMode: "static"` no se genera servidor: el resultado es
HTML estático, compatible con el hosting estático y el PHP actuales.

Salida de `npm run build` en `dist/solgases/browser/`, que es la carpeta que se publica:

| Archivo                                     | Contenido                                                        |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `index.html`                                | `/` prerenderizado                                               |
| `<ruta>/index.html`                         | `nosotros`, `productos`, `servicios`, `bioseguridad`, `contacto` |
| `<pagina>.html/index.html`                  | Redirección `meta refresh` desde cada URL heredada (5)           |
| `productos/<slug>/index.html`               | Detalle de cada producto de `products.json` (94)                 |
| `servicios/<slug>/index.html`               | Detalle de cada servicio de `site-services.json` (18)            |
| `index.csr.html`                            | Shell sin prerenderizar para rutas desconocidas (fallback)       |
| `robots.txt`, `sitemap.xml` (con dominio)   | Generados por `scripts/generate-seo-files.mjs`                   |
| `img/`, `icons/`, `media/`, `*.js`, `*.css` | Recursos                                                         |

`dist/solgases/prerendered-routes.json` lista las 123 rutas prerenderizadas.
`scripts/generate-seo-files.mjs` falla si a una página de producto le falta el título, la
descripción, el `<h1>`, el contenido principal o el aviso de demostración.

El script aplica la misma revisión a los servicios: título, descripción, `<h1>`, contenido y notas.

Un producto o servicio inexistente no tiene HTML propio: lo atiende el fallback `index.csr.html`, que muestra
el aviso en el navegador. El hosting estático responde entonces 200, no 404; por eso la página pide
`noindex`.

Cada HTML contiene el contenido completo de la página, su `<title>` y sus metadatos, el CSS crítico
en línea (Angular lo extrae automáticamente), precargas de fuentes y de la imagen del banner, y el
formulario de Contacto apuntando a `php/enviar-prueba.php`. Al cargar, Angular **hidrata** ese HTML
(`provideClientHydration(withEventReplay())`) en lugar de volver a crearlo. `npm start` también
renderiza en el servidor de desarrollo.

## Rendimiento

### Implementado

- **Imágenes.**
  - `scripts/optimize-images.mjs` (con `sharp`) genera WebP a partir de los originales, que no se
    modifican: banners en variantes de 640, 1280 y 1920 px; galería hasta 1280 px, porque también
    se ve ampliada en el modal; el resto hasta 800 px, porque se muestran a 690 px CSS como máximo.
  - Si el WebP no mejora a un original de tamaño adecuado, se usa el original (5 casos).
- **`NgOptimizedImage`** en todas las imágenes salvo la del modal, con el ancho y alto reales del
  archivo servido para reservar espacio y evitar saltos de layout.
  - El banner, que es la imagen principal visible, usa `priority` (`fetchpriority="high"`, carga
    inmediata y `<link rel="preload">` en el HTML prerenderizado) y `srcset` responsivo con
    `sizes="100vw"` mediante un loader propio (`bannerImageLoader`).
  - El resto de imágenes usa `loading="lazy"`.
  - Se añadió `height: auto` a `img` en `base.css`, como recomienda la guía de NgOptimizedImage,
    para que los atributos `width`/`height` no deformen las imágenes que el CSS no dimensiona.
- **Fuentes.**
  - Montserrat y Pacifico pasan a WOFF2 con subconjunto latino (Latin-1 y la puntuación usada) y
    `font-display: swap`. Se verificó que todos los caracteres de los textos están en el subconjunto.
    El TTF queda como respaldo.
  - La fuente de iconos usa solo WOFF y TTF, y `font-display: block` para no mostrar letras en
    lugar de iconos.
- **Carga por ruta.** Las páginas siguen cargándose de forma diferida (`loadComponent`). El
  manifiesto de imágenes y `products.json` (unos 12 kB comprimidos, junto con otros módulos del
  chunk) están en un chunk diferido compartido, no en `main`.
- **Detalle de producto.** La imagen principal usa `priority`, como el banner, porque ambas se ven al
  cargar. La galería usa carga diferida. Los WebP y sus dimensiones reales son los del manifiesto.
- No se añadieron CDN ni servicios externos. El único recurso externo sigue siendo el mapa de Google
  en Contacto.

### Resultados medidos (2026-11-06)

Imágenes referenciadas por el sitio (146 originales): **20,85 MB → 2,57 MB** en WebP. Los banners
se cuentan en su variante de 1920 px.

Carga inicial con caché vacía, medida con un servidor estático local que registra los bytes de
cada petición, sin compresión HTTP, cargando cada página en Firefox headless hasta el evento `load`:

| Página       | Antes (1280×800) | Después 1280×800 | Después 400×800 |
| ------------ | ---------------- | ---------------- | --------------- |
| Inicio       | 8 599 KB         | 557 KB           | 507 KB          |
| Nosotros     | 5 613 KB         | 663 KB           | 474 KB          |
| Productos    | 9 679 KB         | 1 006 KB         | 555 KB          |
| Servicios    | 2 460 KB         | 589 KB           | 479 KB          |
| Bioseguridad | 8 948 KB         | 615 KB           | 458 KB          |
| Contacto     | 1 203 KB         | 491 KB           | 443 KB          |

Antes, la carga era la misma en cualquier viewport porque todas las imágenes se cargaban de
inmediato. No incluye el iframe de Google Maps. Las imágenes diferidas que se piden después del
evento `load` (al hacer scroll) no están en "después".

| Build                     | Antes        | Después                                                    |
| ------------------------- | ------------ | ---------------------------------------------------------- |
| `main` (gzip -9)          | 71 KB        | 89 KB (+18 KB: hidratación, NgOptimizedImage, Meta)        |
| Fuentes descargadas       | 815 KB (TTF) | 93 KB (WOFF2) + 2 KB de iconos                             |
| HTML inicial de `/`       | 1 KB (shell) | 23 KB (contenido prerenderizado)                           |
| Carpeta publicada (total) | 26,7 MB      | 30,2 MB (se conservan los originales y se suman WebP y OG) |

No se midieron tiempos (LCP, FCP) ni se ejecutó Lighthouse, así que no se afirman mejoras de
velocidad concretas: solo la reducción de bytes medida.

## Despliegue

1. `npm run build` (con `SITE_URL` definido si el dominio ya está confirmado).
2. Publicar el **contenido** de `dist/solgases/browser/` en la raíz del sitio.
3. Publicar la carpeta `php/` del repositorio **junto a** ese contenido, de modo que exista
   `/php/enviar-prueba.php`. Ningún archivo del build se llama `php`, así que no hay conflicto. El
   formulario apunta a `php/enviar-prueba.php`, relativo a `<base href="/">`.
4. Configurar el servidor:
   - Servir `/<ruta>` desde `/<ruta>/index.html` **sin redirigir** a `/<ruta>/`. Muchos servidores
     (Apache con `DirectorySlash`, el servidor de prueba de Python) redirigen con 301 a la URL con
     barra, lo que no coincide con la URL canónica.
   - Servir los archivos existentes tal cual, incluido `php/`, que lo ejecuta el PHP del hosting.
   - Fallback: cualquier otra ruta debe servir `index.csr.html`. Recargar una página o volver desde
     el PHP (que ejecuta `history.go(-1)`) a `/contacto` funciona sin fallback porque esas rutas están
     prerenderizadas.
   - Recomendado: redirección **301** de las URL heredadas `.html` (ver abajo).

Ejemplos orientativos, **no probados** en este entorno (no hay Apache ni nginx). Ajustar al
hosting real.

Apache (`.htaccess` en la raíz publicada):

```apache
Options -Indexes
DirectorySlash Off
RewriteEngine On
RewriteBase /

# URL heredadas del sitio estático anterior: redirección permanente.
RewriteRule ^(nosotros|productos|servicios|bioseguridad|contacto)\.html$ /$1 [R=301,L]

# Páginas prerenderizadas: /productos -> productos/index.html (sin redirección).
RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_FILENAME}/index.html -f
RewriteRule ^(.*?)/?$ $1/index.html [L]

# Archivos existentes (incluido php/enviar-prueba.php) se sirven tal cual.
RewriteCond %{REQUEST_FILENAME} -f
RewriteRule ^ - [L]

# Resto de rutas: la aplicación en el navegador.
RewriteRule ^ index.csr.html [L]
```

nginx:

```nginx
location ~ ^/(nosotros|productos|servicios|bioseguridad|contacto)\.html$ {
  return 301 /$1;
}
location / {
  try_files $uri $uri/index.html /index.csr.html;
}
# location ~ ^/php/.+\.php$ { ... }  # según la configuración PHP-FPM del hosting
```

### Rutas heredadas `.html`

- **En la aplicación:** el router redirige `/index.html` y `/<pagina>.html` a la ruta nueva, igual
  que antes.
- **En el HTML estático:** el build genera `<pagina>.html/index.html` con
  `<meta http-equiv="refresh">`, que es como Angular implementa las redirecciones al prerenderizar.
  Así funcionan aun sin configurar el servidor, pero con un salto extra si el servidor añade la
  barra final. Lo recomendable es la redirección 301 en el servidor de los ejemplos.
- **`/index.html`:** no se prerenderiza como redirección porque ese archivo es el propio inicio.

## Botón flotante de WhatsApp

`app-whatsapp-button` se incluye una sola vez en el componente raíz (`app.ts`), así que aparece en
todas las rutas, también en el HTML prerenderizado. Es una pestaña amarilla con el texto "Escríbenos
para asesorarte", fija a media altura del borde derecho, por encima del contenido y por debajo del
modal de la galería, y no ocupa espacio en el layout. Es un
enlace o botón nativo: se puede usar con teclado, tiene foco y hover visibles y su icono SVG está en
línea, sin dependencias. **No requiere backend**: solo abre `https://wa.me/...`.

La configuración está en `src/app/core/whatsapp.config.ts`:

```ts
export const WHATSAPP_CONFIG: WhatsAppConfig = {
  phone: null, // PENDIENTE: código de país + número, solo dígitos (p. ej. '57' + número colombiano)
  message: 'Hola, quisiera recibir información sobre sus productos y servicios.',
};
```

- **`phone`:** mientras sea `null`, o no tenga entre 8 y 15 dígitos sin `+`, espacios ni guiones,
  el botón lleva un borde punteado y `aria-disabled="true"`, no abre ninguna conversación y explica
  "Número de WhatsApp pendiente de configurar" (al pasar el cursor, enfocar o tocar). No se usó el
  teléfono fijo del sitio.
- **Para activarlo:** escribe el número confirmado, por ejemplo `phone: '57XXXXXXXXXX'`, y ejecuta
  `npm run build`. El botón pasa a ser un enlace `https://wa.me/{phone}?text={mensaje codificado}`
  que se abre en una pestaña nueva con `rel="noopener noreferrer"`.
- **`message`:** el texto inicial de la conversación. Se puede cambiar libremente; se codifica
  automáticamente en la URL.

### Consulta desde el detalle de un producto o servicio

Las vistas de detalle usan la misma configuración y la misma validación (`buildWhatsAppUrl`), con un
mensaje que nombra el producto (sin precio) o el servicio. Con `phone: null` muestra un botón `aria-disabled`, el
texto "Número de WhatsApp pendiente de configurar" y el botón "Contáctanos".

## Backend PHP (`php/`)

Se mantiene separado y no está integrado con ningún otro backend. Cambios realizados:

- Se movió de la raíz a `php/`.
- La carpeta `phpmailer/` se renombró a `php/PHPMailer/`. El script ya tenía
  `require 'PHPMailer/...'`, y en servidores Linux (que distinguen mayúsculas) la carpeta en
  minúsculas hacía fallar el `require`. **No se modificó el código PHP.**

Pendiente de configurar por el responsable del hosting (el código lo deja vacío a propósito y no se
inventaron valores): `Username`, `Password`, `setFrom` y `addAddress` de SMTP en
`php/enviar-prueba.php`. Lo ideal es leerlos desde variables de entorno y no guardarlos en el
repositorio.

## Comportamientos conservados y correcciones menores

- El menú móvil se abre y se cierra con el botón (antes `js/menu.js`). Ahora también se cierra al
  elegir una opción, como ocurría antes al recargar la página.
- La galería de Productos abre la imagen en un modal (antes `js/modal.js`). En el sitio original
  el script fallaba porque las páginas tenían la galería o el modal, pero no ambos, así que el
  modal no funcionaba en ninguna.
- Los títulos de pestaña de Productos y Servicios decían "Nosotros | Solgases"; ahora indican la
  página correcta.
- Los logos de Nosotros se muestran igual que antes, sin estilos de galería ni modal.
- Al navegar entre páginas se vuelve al inicio de la página.
- Se añadieron `alt` en las imágenes de productos, `label for` en el formulario y atributos ARIA en
  los botones del menú y del modal. No hay cambios visuales.

## Limitaciones y pendientes conocidos

- Los iconos de correo, ubicación y teléfono del menú y del pie tenían `href=""` (sin destino) y
  siguen sin enlace. Convertirlos en `mailto:`/`tel:` sería una mejora, pero queda fuera del
  alcance de esta fase.
- El envío real del formulario no se probó de extremo a extremo: no hay PHP en el entorno de
  desarrollo usado y las credenciales SMTP están vacías.
- Las imágenes WebP no tienen alternativa JPEG/PNG para navegadores sin soporte de WebP (todos los
  actuales lo soportan).

## Datos pendientes por confirmar

- **Datos reales del catálogo.** Precios, unidades, textos y fichas son ficticios. Ver
  [Catálogo de productos](#catálogo-de-productos).
- **Información de los servicios.** El sitio no documenta precios, tiempos, cobertura, requisitos ni
  condiciones de cada servicio, salvo el domicilio de Nosotros, un texto del sitio original que
  conviene confirmar. Las descripciones son breves a propósito. Cuando el negocio confirme más
  información, se puede añadir en `site-services.json`.
- **Fotos por revisar:** Maleta Alfombra muestra un logotipo de Renault; Guante Kodiak lleva impresa
  otra marca en el puño; Eslingas y Manómetro son fotos de contexto, no del producto aislado.
- **Número de WhatsApp.** `phone: null` en `src/app/core/whatsapp.config.ts`; el botón está
  desactivado hasta definirlo. Ver [Botón flotante de WhatsApp](#botón-flotante-de-whatsapp).
- **Dominio público.** Sin él no hay canónica, `og:url`, `og:image` ni `sitemap.xml`. Ver
  [Dominio](#dominio-pendiente).
- **Datos estructurados `LocalBusiness`.** No se publicaron porque varios datos del sitio podrían
  estar desactualizados y no hay forma de verificarlos desde el repositorio:
  - El horario y el texto del sitio son de 2020 ("2020 | Todos los derechos reservados").
  - No hay dominio para `url`.
  - Las coordenadas del mapa embebido son el centro del mapa, no necesariamente la ubicación exacta.
    Una vez confirmados (nombre, dirección, teléfono, horario, dominio), se puede añadir un bloque
    JSON-LD con solo esos campos.
- **Perfiles sociales.** No hay ninguno en el sitio; no se añadieron `sameAs` ni `twitter:site`.

## Recomendaciones futuras

- Medir con Lighthouse o PageSpeed una vez desplegado (LCP, CLS, INP) con el hosting real y
  compresión HTTP activada.
- Activar en el servidor la compresión (gzip/brotli) y la caché larga para `*.js`, `*.css` y
  `media/*`, que tienen hash en el nombre.
- Configurar las redirecciones 301 de las URL `.html` en el servidor.
- Revisar en modo desarrollo (`npm start`, consola del navegador) las advertencias de
  NgOptimizedImage sobre proporciones, ya que las imágenes con `object-fit: cover` se recortan a
  propósito.
- Decidir si se retiran de `public/img` los originales que ya no se referencian, o se mantienen por
  enlaces externos antiguos.
