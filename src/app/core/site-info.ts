/**
 * Datos de contacto del negocio tal como aparecían en el sitio estático original.
 * Centralizarlos aquí evita repetirlos en encabezado, pie de página y contacto.
 */
export const SITE_INFO = {
  name: 'Solgases',
  phone: '(038) 772 86 66',
  address: 'Cra 16 #10 48 Sogamoso',
  email: 'solgases@gmail.com',
  copyright: '2020 | Todos los derechos reservados',
} as const;

/** Resumen de servicios repetido en Nosotros, Servicios y Bioseguridad (texto original). */
export const SERVICES_SUMMARY = {
  title: 'Solgases - Sogamoso',
  text: 'Recarga de extintores ABC, agua a presión, CO2, Solkaflam, entre otos.También realizamos el mantenimiento y llenado de acumuladores y tanques de oxigeno, acetileno, nitrogeno y CO2, también reparación de reguladores y equipos de soldadura',
} as const;
