import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Botón "Contáctanos" que se repetía en varias páginas. */
@Component({
  selector: 'app-contact-button',
  imports: [RouterLink],
  template: `<a routerLink="/contacto" class="btn btn--contact btn--dark">Contáctanos</a>`,
  styles: `
    .btn--dark {
      background-color: black;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactButton {}
