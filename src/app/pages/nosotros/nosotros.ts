import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SERVICES_SUMMARY } from '../../core/site-info';
import { FreeDelivery } from '../../shared/components/free-delivery/free-delivery';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { OptimizedImagePipe, cardImage } from '../../shared/images/optimized-image';
import { BRAND_LOGO_COLUMNS, TEAM_HIGHLIGHTS, WHY_US } from './nosotros.data';

@Component({
  selector: 'app-nosotros-page',
  imports: [
    PageBanner,
    IntroSection,
    ContactButton,
    FreeDelivery,
    NgOptimizedImage,
    OptimizedImagePipe,
  ],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NosotrosPage {
  protected readonly summary = SERVICES_SUMMARY;
  protected readonly highlights = TEAM_HIGHLIGHTS.map((highlight) => ({
    ...highlight,
    img: cardImage(highlight.image),
  }));
  protected readonly whyUs = WHY_US;
  protected readonly brands = BRAND_LOGO_COLUMNS.flat();
}
