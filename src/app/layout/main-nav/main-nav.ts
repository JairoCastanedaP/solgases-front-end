import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/navigation';
import { ContactDialog, ContactTopic } from '../contact-dialog/contact-dialog';

const CONTACTS: readonly {
  readonly topic: ContactTopic;
  readonly label: string;
  readonly icon?: string;
}[] = [
  { topic: 'email', label: 'Ver correo de Solgases', icon: 'icon-mail' },
  { topic: 'address', label: 'Ver dirección de Solgases', icon: 'icon-location' },
  { topic: 'phone', label: 'Ver teléfono de Solgases', icon: 'icon-phone' },
  { topic: 'facebook', label: 'Ver Facebook de Solgases' },
  { topic: 'instagram', label: 'Ver Instagram de Solgases' },
];

/**
 * Menú principal. En pantallas pequeñas se despliega con el botón de menú
 * (reemplaza a js/menu.js, que alternaba la clase `mostrar`).
 */
@Component({
  selector: 'app-main-nav',
  imports: [RouterLink, RouterLinkActive, ContactDialog],
  styleUrl: './main-nav.css',
  templateUrl: './main-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNav {
  protected readonly items = NAV_ITEMS;
  protected readonly contacts = CONTACTS;
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** En el sitio original cada enlace recargaba la página y el menú quedaba cerrado. */
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
