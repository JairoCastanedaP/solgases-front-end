import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV_ITEMS } from '../../core/navigation';

/**
 * Menú principal. En pantallas pequeñas se despliega con el botón de menú
 * (reemplaza a js/menu.js, que alternaba la clase `mostrar`).
 */
@Component({
  selector: 'app-main-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './main-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNav {
  protected readonly items = NAV_ITEMS;
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** En el sitio original cada enlace recargaba la página y el menú quedaba cerrado. */
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
