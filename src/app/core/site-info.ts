import { InjectionToken } from '@angular/core';

/** Teléfono fijo confirmado, con el indicativo vigente. No es el número de WhatsApp. */
const PHONE = '(608) 772 86 66';
const COLOMBIA_DIALING_CODE = '57';
const ADDRESS = 'Cra 16 #10 48, Sogamoso';

/**
 * Datos de contacto del negocio. Centralizarlos aquí evita repetirlos en encabezado, pie de página y
 * contacto: el enlace de llamada y el de Google Maps se derivan del teléfono y de la dirección.
 */
export const SITE_INFO = {
  name: 'Solgases',
  phone: PHONE,
  phoneHref: `tel:+${COLOMBIA_DIALING_CODE}${PHONE.replace(/\D/g, '')}`,
  address: ADDRESS,
  /** Busca la dirección: el sitio no tiene coordenadas exactas confirmadas. */
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  email: 'solgases@gmail.com',
  /** Medios de pago confirmados. No hay logos aprobados en el repositorio: se muestran como texto. */
  paymentMethods: ['Nequi', 'Bre-B'],
  /** El año lo añade el pie de página en el navegador, para que no quede fijo en el HTML. */
  copyright: 'Todos los derechos reservados',
} as const;

export interface SocialProfiles {
  readonly facebook: string | null;
  readonly instagram: string | null;
}

/**
 * URL de los perfiles oficiales. PENDIENTE: `null` porque el repositorio no identifica ninguna
 * cuenta; mientras tanto, la ventana del encabezado lo indica. No poner URLs sin confirmar.
 */
export const SOCIAL_PROFILES: SocialProfiles = { facebook: null, instagram: null };

/** Permite sustituir los perfiles en pruebas. */
export const SOCIAL_PROFILES_TOKEN = new InjectionToken<SocialProfiles>('SOCIAL_PROFILES', {
  providedIn: 'root',
  factory: () => SOCIAL_PROFILES,
});

/** Resumen de servicios repetido en Nosotros, Servicios y Bioseguridad (texto original). */
export const SERVICES_SUMMARY = {
  title: 'Solgases - Sogamoso',
  text: 'Recarga de extintores ABC, agua a presión, CO2, Solkaflam, entre otos.También realizamos el mantenimiento y llenado de acumuladores y tanques de oxigeno, acetileno, nitrogeno y CO2, también reparación de reguladores y equipos de soldadura',
} as const;
