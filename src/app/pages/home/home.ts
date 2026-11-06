import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { FEATURED_PRODUCTS, FEATURED_SERVICES } from './home.data';

@Component({
  selector: 'app-home-page',
  imports: [ContactButton, PageBanner, IntroSection, ProductGrid],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly featuredProducts = FEATURED_PRODUCTS;
  protected readonly featuredServices = FEATURED_SERVICES;
}
