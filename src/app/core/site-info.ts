import { InjectionToken } from '@angular/core';

/**
 * Datos de contacto del negocio tal como aparecían en el sitio estático original.
 * Centralizarlos aquí evita repetirlos en encabezado, pie de página y contacto.
 */
export const SITE_INFO = {
  name: 'Solgases',
  phone: '(038) 772 86 66',
  address: 'Cra 16 #10 48 Sogamoso',
  email: 'solgases@gmail.com',
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
