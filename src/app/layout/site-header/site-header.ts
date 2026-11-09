import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE_INFO } from '../../core/site-info';
import { ContactDialog } from '../contact-dialog/contact-dialog';

@Component({
  selector: 'app-site-header',
  imports: [ContactDialog],
  templateUrl: './site-header.html',
  styleUrl: './site-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteHeader {
  protected readonly site = SITE_INFO;
}
