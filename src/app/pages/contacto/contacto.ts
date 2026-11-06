import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CONTACT_FORM_ACTION } from '../../core/contact-form.config';
import { PageBanner } from '../../shared/components/page-banner/page-banner';

/**
 * Página de contacto. El formulario es un POST HTML nativo hacia el script PHP
 * existente (no se usa FormsModule para que Angular no intercepte el envío).
 */
@Component({
  selector: 'app-contacto-page',
  imports: [PageBanner],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactoPage {
  protected readonly formAction = CONTACT_FORM_ACTION;
}
