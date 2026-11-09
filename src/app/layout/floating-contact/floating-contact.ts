import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SITE_INFO } from '../../core/site-info';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { WhatsAppIcon } from '../../shared/components/whatsapp-icon/whatsapp-icon';

/**
 * Tres accesos fijos: asesoría (amarillo), WhatsApp (verde) y llamada. Van fuera del área de contenido:
 * en el margen lateral si cabe y, si no, en una barra inferior para la que `styles.css` reserva espacio
 * al final de la página.
 *
 * Asesoría y WhatsApp usan la configuración central: sin un número válido no abren nada. El teléfono de
 * llamadas es fijo y nunca se usa como WhatsApp.
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
