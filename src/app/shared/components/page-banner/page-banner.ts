import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Imagen principal de cada página con texto superpuesto. */
@Component({
  selector: 'app-page-banner',
  template: `
    <section class="banner">
      <img [src]="image()" alt="" class="banner__img" />
      <div class="banner__content">{{ text() }}</div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBanner {
  readonly image = input.required<string>();
  readonly text = input('');
}
