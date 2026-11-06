import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_INFO } from '../../core/site-info';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly site = SITE_INFO;
}
