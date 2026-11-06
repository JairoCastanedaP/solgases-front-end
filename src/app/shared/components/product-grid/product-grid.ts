import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CatalogItem } from '../../models/catalog-item';

/**
 * Cuadrícula de productos o servicios (bloque `.today-special` del sitio original).
 * El contenido proyectado (p. ej. el botón de contacto) se muestra antes de la cuadrícula.
 */
@Component({
  selector: 'app-product-grid',
  template: `
    <section class="group today-special">
      @if (heading()) {
        <h2 class="group__title">{{ heading() }}</h2>
      }
      <ng-content />
      <div class="container container--flex">
        @for (item of items(); track $index) {
          <div class="column column--50-25">
            <img [src]="item.image" [alt]="item.title" class="today-special__img" />
            <div class="today-special__title">{{ item.title }}</div>
          </div>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGrid {
  readonly items = input.required<readonly CatalogItem[]>();
  readonly heading = input('');
}
