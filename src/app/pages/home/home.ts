import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PRODUCT_CATALOG, toCatalogItems } from '../../core/products/product-catalog';
import { featuredServiceCards } from '../../core/site-services/site-service-catalog';
import { CardCarousel } from '../../shared/components/card-carousel/card-carousel';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { ImageGallery } from '../../shared/components/image-gallery/image-gallery';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { OptimizedImagePipe } from '../../shared/images/optimized-image';
import { HOME_GALLERY, HOME_PORTFOLIO } from './home.data';

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
    RouterLink,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly gallery = HOME_GALLERY;
  protected readonly portfolio = HOME_PORTFOLIO;
  protected readonly featuredProducts = toCatalogItems(PRODUCT_CATALOG.featured);
  protected readonly featuredServices = featuredServiceCards();
}
