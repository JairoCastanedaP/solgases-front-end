import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingContact } from './layout/floating-contact/floating-contact';
import { MainNav } from './layout/main-nav/main-nav';
import { SiteFooter } from './layout/site-footer/site-footer';
import { SiteHeader } from './layout/site-header/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, MainNav, SiteFooter, FloatingContact],
  template: `
    <app-site-header />
    <app-main-nav />
    <router-outlet />
    <app-site-footer />
    <app-floating-contact />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
