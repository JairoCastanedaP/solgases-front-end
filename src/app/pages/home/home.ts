import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PRODUCT_CATALOG, toCatalogItems } from '../../core/products/product-catalog';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { OptimizedImagePipe } from '../../shared/images/optimized-image';
import { FEATURED_SERVICES } from './home.data';

@Component({
  selector: 'app-home-page',
  imports: [
    ContactButton,
    PageBanner,
    IntroSection,
    ProductGrid,
    NgOptimizedImage,
    OptimizedImagePipe,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly featuredProducts = toCatalogItems(PRODUCT_CATALOG.featured);
  protected readonly featuredServices = FEATURED_SERVICES;
}
