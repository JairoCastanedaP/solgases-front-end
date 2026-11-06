import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SERVICES_SUMMARY } from '../../core/site-info';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { BIOSAFETY_PRODUCTS } from './bioseguridad.data';

@Component({
  selector: 'app-bioseguridad-page',
  imports: [PageBanner, IntroSection, ContactButton, ProductGrid],
  template: `
    <app-page-banner image="img/bioseguridad/coronavirus.jpg" text="Bioseguridad" />
    <main class="main">
      <app-intro-section [title]="summary.title" [paragraphs]="[summary.text]" />
      <app-product-grid [items]="products">
        <app-contact-button />
      </app-product-grid>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BioseguridadPage {
  protected readonly summary = SERVICES_SUMMARY;
  protected readonly products = BIOSAFETY_PRODUCTS;
}
