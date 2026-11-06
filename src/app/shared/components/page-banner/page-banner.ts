import { IMAGE_LOADER, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { bannerImageLoader, bannerSrcset, optimizedImage } from '../../images/optimized-image';

/**
 * Imagen principal de cada página con texto superpuesto.
 * - La imagen es decorativa (`alt=""`): el texto equivalente está en el encabezado.
 * - Es la imagen más visible al cargar, por eso se marca `priority` (carga inmediata y
 *   `fetchpriority=high`) y se sirve en WebP responsivo (640/1280/1920 px).
 * - El texto es el `<h1>` de la página; si no hay texto visible (Nosotros) la página
 *   define su propio `<h1>`.
 */
@Component({
  selector: 'app-page-banner',
  imports: [NgOptimizedImage],
  providers: [{ provide: IMAGE_LOADER, useValue: bannerImageLoader }],
  template: `
    <section class="banner">
      <img
        [ngSrc]="img().src"
        [ngSrcset]="srcset()"
        sizes="100vw"
        [width]="img().width"
        [height]="img().height"
        [loaderParams]="{ fallbackWidth: img().width }"
        priority
        alt=""
        class="banner__img"
      />
      @if (text()) {
        <h1 class="banner__content">{{ text() }}</h1>
      } @else {
        <div class="banner__content"></div>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBanner {
  readonly image = input.required<string>();
  readonly text = input('');

  protected readonly img = computed(() => optimizedImage(this.image()));
  protected readonly srcset = computed(() => bannerSrcset(this.img()));
}
