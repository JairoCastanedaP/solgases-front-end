import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OptimizedImagePipe } from '../../images/optimized-image';
import { CatalogItem } from '../../models/catalog-item';

/**
 * Cuadrícula de productos o servicios (bloque `.today-special` del sitio original).
 * El contenido proyectado (p. ej. el botón de contacto) se muestra antes de la cuadrícula.
 * Las imágenes usan NgOptimizedImage: WebP con dimensiones reales y carga diferida.
 */
@Component({
  selector: 'app-product-grid',
  imports: [NgOptimizedImage, OptimizedImagePipe],
  template: `
    <section class="group today-special">
      @if (heading()) {
        <h2 class="group__title">{{ heading() }}</h2>
      }
      <ng-content />
      <div class="container container--flex">
        @for (item of items(); track $index) {
          <div class="column column--50-25">
            @let img = item.image | optimizedImage;
            <img
              [ngSrc]="img.src"
              [width]="img.width"
              [height]="img.height"
              [alt]="item.title"
              class="today-special__img"
            />
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
