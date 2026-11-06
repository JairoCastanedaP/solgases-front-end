import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { ImageGallery } from '../../shared/components/image-gallery/image-gallery';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { ProductGrid } from '../../shared/components/product-grid/product-grid';
import { PRODUCT_CATEGORIES, PRODUCT_GALLERY } from './productos.data';

@Component({
  selector: 'app-productos-page',
  imports: [PageBanner, IntroSection, ImageGallery, ContactButton, ProductGrid],
  templateUrl: './productos.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPage {
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly gallery = PRODUCT_GALLERY;
}
