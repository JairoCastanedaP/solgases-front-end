import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_INFO } from '../../core/site-info';

@Component({
  selector: 'app-site-footer',
  templateUrl: './site-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooter {
  protected readonly site = SITE_INFO;
}
