/**
 * Destino del formulario de contacto.
 *
 * El formulario se envía con un POST HTML clásico (sin AJAX) al script PHP
 * existente, igual que en el sitio original. La ruta es relativa al
 * `<base href>` de la aplicación: en producción el directorio `php/` debe
 * publicarse junto al contenido de `dist/solgases/browser` (ver README).
 * En desarrollo, `proxy.conf.json` reenvía `/php` al servidor PHP local.
 */
export const CONTACT_FORM_ACTION = 'php/enviar-prueba.php';
