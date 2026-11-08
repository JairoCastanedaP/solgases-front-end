import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OptimizedImagePipe } from '../../images/optimized-image';
import { CatalogItem } from '../../models/catalog-item';

/**
 * Cuadrícula de productos o servicios (bloque `.today-special` del sitio original).
 * El contenido proyectado (p. ej. el botón de contacto) se muestra antes de la cuadrícula.
 * Las imágenes usan NgOptimizedImage: WebP con dimensiones reales y carga diferida.
 * Los elementos con `link` son enlaces nativos: funcionan con teclado y en una pestaña nueva.
 * El `@for` sigue cada objeto: NgOptimizedImage no admite cambiar `width` o `height` de una imagen
 * ya creada, así que una lista filtrada debe crear o mover tarjetas, no reutilizarlas por posición.
 */
@Component({
  selector: 'app-product-grid',
  imports: [NgOptimizedImage, NgTemplateOutlet, OptimizedImagePipe, RouterLink],
  template: `
    <ng-template #card let-item>
      @let img = item.image | optimizedImage;
      <img
        [ngSrc]="img.src"
        [width]="img.width"
        [height]="img.height"
        [alt]="item.alt ?? item.title"
        class="today-special__img"
      />
      <div class="today-special__title">{{ item.title }}</div>
      @if (item.note) {
        <div class="today-special__note">{{ item.note }}</div>
      }
    </ng-template>

    <section class="group today-special">
      @if (heading()) {
        <h2 class="group__title">{{ heading() }}</h2>
      }
      <ng-content />
      <div class="container container--flex">
        @for (item of items(); track item) {
          <div class="column column--50-25">
            @if (item.link) {
              <a
                class="today-special__link"
                [routerLink]="item.link"
                [attr.aria-label]="
                  'Ver detalle de ' + item.title + (item.note ? '. ' + item.note : '')
                "
              >
                <ng-container
                  [ngTemplateOutlet]="card"
                  [ngTemplateOutletContext]="{ $implicit: item }"
                />
              </a>
            } @else {
              <ng-container
                [ngTemplateOutlet]="card"
                [ngTemplateOutletContext]="{ $implicit: item }"
              />
            }
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .today-special__link {
      display: block;
      color: inherit;
      text-decoration: none;
    }

    .today-special__link:hover .today-special__title {
      text-decoration: underline;
    }

    .today-special__link:focus-visible {
      outline: 3px solid #111;
      outline-offset: 2px;
    }

    .today-special__title:has(+ .today-special__note) {
      padding-bottom: 5px;
    }

    .today-special__note {
      padding-bottom: 20px;
      color: #333;
      font-size: 0.85em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductGrid {
  readonly items = input.required<readonly CatalogItem[]>();
  readonly heading = input('');
}
