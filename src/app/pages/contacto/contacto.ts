import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CONTACT_FORM_ACTION } from '../../core/contact-form.config';
import { SITE_INFO } from '../../core/site-info';
import { WHATSAPP_CONFIG_TOKEN, buildWhatsAppUrl } from '../../core/whatsapp.config';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { WhatsAppIcon } from '../../shared/components/whatsapp-icon/whatsapp-icon';

/**
 * Página de contacto. El formulario es un POST HTML nativo hacia el script PHP
 * existente (no se usa FormsModule para que Angular no intercepte el envío).
 */
@Component({
  selector: 'app-contacto-page',
  imports: [PageBanner, WhatsAppIcon],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactoPage {
  protected readonly formAction = CONTACT_FORM_ACTION;
  protected readonly site = SITE_INFO;
  protected readonly whatsAppUrl = buildWhatsAppUrl(inject(WHATSAPP_CONFIG_TOKEN));
}
