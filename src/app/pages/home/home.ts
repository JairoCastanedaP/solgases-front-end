import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PRODUCT_CATALOG, toCatalogItems } from '../../core/products/product-catalog';
import { featuredServiceCards } from '../../core/site-services/site-service-catalog';
import { CardCarousel } from '../../shared/components/card-carousel/card-carousel';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { ImageGallery } from '../../shared/components/image-gallery/image-gallery';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { OptimizedImagePipe } from '../../shared/images/optimized-image';
import { HOME_GALLERY } from './home.data';

@Component({
  selector: 'app-home-page',
  imports: [
    ContactButton,
    ImageGallery,
    PageBanner,
    IntroSection,
    CardCarousel,
    NgOptimizedImage,
    OptimizedImagePipe,
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly gallery = HOME_GALLERY;
  protected readonly featuredProducts = toCatalogItems(PRODUCT_CATALOG.featured);
  protected readonly featuredServices = featuredServiceCards();
}
