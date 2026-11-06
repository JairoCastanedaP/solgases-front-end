import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SERVICES_SUMMARY } from '../../core/site-info';
import { ContactButton } from '../../shared/components/contact-button/contact-button';
import { IntroSection } from '../../shared/components/intro-section/intro-section';
import { PageBanner } from '../../shared/components/page-banner/page-banner';
import { BRAND_LOGO_COLUMNS, TEAM_HIGHLIGHTS } from './nosotros.data';

@Component({
  selector: 'app-nosotros-page',
  imports: [PageBanner, IntroSection, ContactButton],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NosotrosPage {
  protected readonly summary = SERVICES_SUMMARY;
  protected readonly highlights = TEAM_HIGHLIGHTS;
  protected readonly brandColumns = BRAND_LOGO_COLUMNS;
}
