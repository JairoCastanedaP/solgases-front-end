import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { WhatsAppIcon } from '../../shared/components/whatsapp-icon/whatsapp-icon';

/**
 * Botón flotante de asesoría por WhatsApp, fijo a media altura del borde derecho en todas las páginas.
 * - Con número configurado: enlace a wa.me en una pestaña nueva.
 * - Con número pendiente: botón desactivado (`aria-disabled`) que sigue siendo enfocable
 *   y explica que el número falta, para no abrir una conversación incorrecta.
 */
@Component({
  selector: 'app-whatsapp-button',
  imports: [WhatsAppIcon],
  templateUrl: './whatsapp-button.html',
  styleUrl: './whatsapp-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsAppButton {
  protected readonly url = buildWhatsAppUrl(inject(WHATSAPP_CONFIG_TOKEN));
}
