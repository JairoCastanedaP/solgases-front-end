import { ChangeDetectionStrategy, Component } from '@angular/core';
import { serviceCards } from '../../core/site-services/site-service-catalog';
import { SERVICES_SUMMARY } from '../../core/site-info';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';

@Component({
  selector: 'app-servicios-page',
  imports: [PageBanner, IntroSection, ContactButton, ProductGrid],
  template: `
    <app-page-banner image="img/extintores.jpg" text="Nuestros Servicios" />
    <main class="main">
      <app-intro-section [title]="summary.title" [paragraphs]="[summary.text]" />
      <app-product-grid [items]="services">
        <app-contact-button />
      </app-product-grid>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiciosPage {
  protected readonly summary = SERVICES_SUMMARY;
  protected readonly services = serviceCards();
}
