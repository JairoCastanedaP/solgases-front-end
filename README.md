# Solgases – Sitio web (frontend)

Sitio informativo de Solgases (seguridad industrial, Sogamoso). Antes era un sitio HTML/CSS/JS
estático y se migró a **Angular 22**, conservando las páginas, los textos, las imágenes y el diseño.
El pequeño script PHP del formulario de contacto se mantiene **separado y sin cambios** en `php/`.

## Requisitos

| Herramienta | Versión                                                  | Motivo                                                                  |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Node.js     | `^22.22.3` o `^24.15.0` (o `>=26`)                        | Requisito oficial de Angular 22 (verificado con Node 24.21.0)           |
| npm         | 11 (incluido con Node 24)                                 | Gestor de paquetes (`packageManager` en `package.json`)                 |
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
npm run build        # build de producción en dist/solgases/browser
npm test             # pruebas unitarias (Vitest, una sola ejecución)
npm run test:watch   # pruebas en modo observación
npm run check:assets # verifica que toda imagen referenciada exista en public/
npm run verify       # check:assets + test + build (verificación completa)
npm run php:serve    # servidor PHP local en :8000 (requiere PHP instalado)
```

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
├── scripts/check-assets.mjs     # Verificación de rutas de imágenes
├── proxy.conf.json              # Proxy /php -> servidor PHP local (solo ng serve)
└── src/
    ├── index.html, main.ts
    ├── styles.css               # Punto de entrada de estilos globales
    ├── styles/
    │   ├── base.css             # Antes css/estilos.css (rutas de fuentes ajustadas)
    │   ├── fonts/               # Montserrat y Pacifico (locales)
    │   └── sw/                  # Fuente de iconos Fontastic (.icon-*) y su referencia
    └── app/
        ├── app.ts, app.config.ts, app.routes.ts
        ├── core/                # Datos del sitio (contacto), navegación, destino del formulario
        ├── layout/              # Encabezado, menú principal (móvil) y pie de página
        ├── shared/
        │   ├── models/          # Tipos: CatalogItem, CatalogSection, GalleryImage
        │   └── components/      # Banner, franja de título, cuadrícula de productos,
        │                        # galería con modal y botón "Contáctanos"
        └── pages/               # Una carpeta por página, con sus datos (*.data.ts) y estilos
            ├── home/  nosotros/  productos/  servicios/  bioseguridad/  contacto/
```

Criterios usados:

- **Contenido como datos tipados.** Los catálogos (unos 150 elementos) se extrajeron
  automáticamente del HTML original a archivos `*.data.ts`, con los mismos textos, el mismo orden
  y las mismas imágenes. Se renderizan con un único componente, `ProductGrid`, en lugar de
  repetir el marcado.
- **No hay servicios Angular de datos.** El contenido es estático y no hay API, así que un
  servicio solo envolvería constantes. Si en el futuro el contenido viene de un backend, el lugar
  natural para añadir ese servicio es `core/`, y las páginas no tendrían que cambiar su plantilla.
- **Estilos.** `base.css` sigue siendo global para conservar la cascada original. Los CSS que antes
  se cargaban solo en ciertas páginas (`contacto.css`, `nosotros.css`, y la galería y el modal de
  `produtos.css`) ahora están encapsulados en su componente, de modo que no afectan a otras páginas.

## Páginas y rutas

| Ruta            | Origen              | Notas                                                        |
| --------------- | ------------------- | ------------------------------------------------------------ |
| `/`             | `index.html`        | Productos y servicios relevantes                             |
| `/nosotros`     | `nosotros.html`     | Equipo, resumen de servicios y logos de marcas               |
| `/productos`    | `productos.html`    | Galería con modal y 10 categorías (76 productos)             |
| `/servicios`    | `servicios.html`    | 18 servicios                                                 |
| `/bioseguridad` | `bioseguridad.html` | 20 productos                                                 |
| `/contacto`     | `contacto.html`     | Horario, mapa de Google y formulario (POST a PHP)            |

Las URLs antiguas (`/productos.html`, `/index.html`, etc.) redirigen a las nuevas.
`galeria.html` estaba vacío (0 bytes) y no tenía enlaces, así que no se migró. Cualquier ruta
desconocida redirige al inicio.

## Despliegue

1. `npm run build` y publicar el contenido de `dist/solgases/browser/` en la raíz del sitio.
2. Publicar la carpeta `php/` **junto a** ese contenido, de modo que exista
   `/php/enviar-prueba.php`. El formulario apunta a `php/enviar-prueba.php`, relativo a
   `<base href="/">` (configurable en `src/app/core/contact-form.config.ts`).
3. Configurar en el servidor un _fallback_ de SPA: las rutas que no correspondan a un archivo
   existente deben servir `index.html`. Sin esto, recargar `/productos` o volver desde el PHP
   (que ejecuta `history.go(-1)`) daría 404. Ejemplo orientativo para Apache (`.htaccess`), que
   no se incluye en el repo porque depende del hosting:

   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} -f [OR]
   RewriteCond %{REQUEST_FILENAME} -d
   RewriteRule ^ - [L]
   RewriteRule ^ index.html [L]
   ```

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
- La fuente de iconos incluye formatos antiguos (`.eot`, `.svg`). Se conservan tal cual.
- Las imágenes ocupan unos 27 MB sin optimizar; queda como posible mejora futura.
