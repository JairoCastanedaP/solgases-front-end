import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainNav } from './layout/main-nav/main-nav';
import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';
import { WhatsAppButton } from './layout/whatsapp-button/whatsapp-button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, MainNav, SiteFooter, WhatsAppButton],
  template: `
    <app-site-header />
    <app-main-nav />
    <router-outlet />
    <app-site-footer />
    <app-whatsapp-button />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
