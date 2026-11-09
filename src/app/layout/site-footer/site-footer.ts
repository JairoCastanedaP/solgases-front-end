import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG_SHORTCUTS, NAV_ITEMS } from '../../core/navigation';
import { SITE_INFO } from '../../core/site-info';

/**
 * Pie de página. Solo usa datos ya confirmados en el sitio: sin redes, horarios ni medios de pago.
 * El teléfono y la dirección son texto: no hay enlace verificado de llamada ni de mapa.
 */

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly site = SITE_INFO;
  protected readonly navItems = NAV_ITEMS;
  protected readonly categories = CATALOG_SHORTCUTS;
}
