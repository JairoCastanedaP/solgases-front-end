import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CATALOG_SHORTCUTS, NAV_ITEMS } from '../../core/navigation';
import { PAYMENT_METHODS, SITE_INFO } from '../../core/site-info';

/**
 * Pie de página. Solo usa datos ya confirmados en el sitio: sin redes ni horarios.
 */

@Component({
  selector: 'app-site-footer',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly site = SITE_INFO;
  protected readonly paymentMethods = PAYMENT_METHODS;
  protected readonly navItems = NAV_ITEMS;
  protected readonly categories = CATALOG_SHORTCUTS;
  /**
   * El prerenderizado no ejecuta `afterNextRender`, que además espera a la hidratación: el HTML no
   * lleva año y el navegador pone el de hoy, sin diferencias ni necesidad de un nuevo build.
   */
  protected readonly year = signal<number | null>(null);

  constructor() {
    afterNextRender(() => this.year.set(new Date().getFullYear()));
  }
}
