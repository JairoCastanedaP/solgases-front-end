import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';

/**
 * Botón flotante de WhatsApp, fijo en la esquina inferior derecha en todas las páginas.
 * - Con número configurado: enlace a wa.me en una pestaña nueva.
 * - Con número pendiente: botón desactivado (`aria-disabled`) que sigue siendo enfocable
 *   y explica que el número falta, para no abrir una conversación incorrecta.
 */
@Component({
  selector: 'app-whatsapp-button',
  imports: [NgTemplateOutlet],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsAppButton {
  protected readonly url = buildWhatsAppUrl(inject(WHATSAPP_CONFIG_TOKEN));
}
