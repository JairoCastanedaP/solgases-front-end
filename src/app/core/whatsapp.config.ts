import { InjectionToken } from '@angular/core';

export interface WhatsAppConfig {
  /**
   * Número de WhatsApp con código de país y SOLO dígitos: sin `+`, espacios ni guiones.
   * Ejemplo de formato para Colombia: `57` seguido del número (p. ej. `573001234567`).
   *
   * PENDIENTE: `null` hasta que se confirme la cuenta de WhatsApp del negocio. No usar el
   * teléfono fijo publicado en el sitio. Mientras sea `null` (o no tenga un formato válido),
   * el botón se muestra desactivado y no abre ninguna conversación.
   */
  readonly phone: string | null;
  /** Mensaje inicial que se precarga en la conversación (se codifica en la URL). */
  readonly message: string;
}

/** Configuración única del botón flotante de WhatsApp. No requiere backend. */
export const WHATSAPP_CONFIG: WhatsAppConfig = {
  phone: null,
  message: 'Hola, quisiera recibir información sobre sus productos y servicios.',
};

/** Permite sustituir la configuración en pruebas. */
export const WHATSAPP_CONFIG_TOKEN = new InjectionToken<WhatsAppConfig>('WHATSAPP_CONFIG', {
  providedIn: 'root',
  factory: () => WHATSAPP_CONFIG,
});

/** Código de país + número: 8 a 15 dígitos (máximo E.164). */
const VALID_PHONE = /^\d{8,15}$/;

/** Enlace `wa.me`, o `null` si el número está pendiente o no tiene el formato esperado. */
export function buildWhatsAppUrl({ phone, message }: WhatsAppConfig): string | null {
  if (!phone || !VALID_PHONE.test(phone)) {
    return null;
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
