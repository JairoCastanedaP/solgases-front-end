import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE_INFO } from '../../core/site-info';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { WhatsAppIcon } from '../../shared/components/whatsapp-icon/whatsapp-icon';

/**
 * Pila de contacto de la esquina inferior derecha; la pestaña amarilla de asesoría sigue a media
 * altura. WhatsApp usa la misma configuración que el resto del sitio: sin número válido, explica que
 * está pendiente y no abre nada. El teléfono de llamadas es fijo y nunca se usa como WhatsApp.
 */
@Component({
  selector: 'app-floating-contact',
  imports: [WhatsAppIcon],
  templateUrl: './floating-contact.html',
  styleUrl: './floating-contact.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FloatingContact {
  protected readonly site = SITE_INFO;
  protected readonly whatsAppUrl = buildWhatsAppUrl(inject(WHATSAPP_CONFIG_TOKEN));
}
